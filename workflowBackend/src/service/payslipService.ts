import { Employee, Shift, TimeEntry, Payslip, Department } from "../model/model";
import mongoose from "mongoose";

// Function to generate unique payslip number
const generatePayslipNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Find the last payslip for this month
  const lastPayslip = await Payslip.findOne({
    payslipNumber: { $regex: `^PSL${year}${month}` }
  }).sort({ payslipNumber: -1 });
  
  let sequenceNumber = 1;
  if (lastPayslip && lastPayslip.payslipNumber) {
    const lastSequence = parseInt(lastPayslip.payslipNumber.slice(-4));
    sequenceNumber = lastSequence + 1;
  }
  
  return `PSL${year}${month}${String(sequenceNumber).padStart(4, '0')}`;
};

// Define Indian payroll-specific deductions
interface IndianDeductions {
  tax?: number;
  pf?: number; // Provident Fund
  professionalTax?: number;
  hra?: number; // House Rent Allowance
  medicalAllowance?: number;
  specialAllowance?: number;
  insurance?: number;
  retirement?: number;
}

// Calculate Indian payroll components
const calculateIndianPayroll = async ({
  employeeId,
  payPeriodStart,
  payPeriodEnd,
  overtimeRate,
  deductions: inputDeductions
}: {
  employeeId: string,
  payPeriodStart: Date,
  payPeriodEnd: Date,
  overtimeRate?: number,
  deductions?: IndianDeductions
}) => {
  // 1. Get Employee info
  const employee = await Employee.findById(employeeId).populate('jobInfo.departmentId');
  if (!employee) throw new Error("Employee not found");

  const wageAmount = employee.compensation?.wage || 0;

  // 2. Calculate Indian payroll components
  const basicPay = wageAmount * 0.4; // 40% of wage is basic pay
  const hra = wageAmount * 0.3; // 30% of wage is HRA
  const specialAllowance = wageAmount * 0.2; // 20% of wage is special allowance
  const medicalAllowance = 1500; // Fixed medical allowance

  // 3. Calculate PF (Provident Fund: 12% of basic pay)
  const pf = basicPay * 0.12;

  // 4. Professional Tax (fixed, varies by state)
  const professionalTax = 200;

  // 5. Income Tax (simplified slab)
  const annualIncome = (basicPay + hra + specialAllowance + medicalAllowance) * 12;
  let incomeTax = 0;
  if (annualIncome > 500000) {
    incomeTax = (annualIncome - 500000) * 0.2; // 20% tax for income above ₹5,00,000
  }
  const monthlyTax = incomeTax / 12;

  // 6. Fetch shifts and time entries for the pay period
  const shifts = await Shift.find({
    employeeId: new mongoose.Types.ObjectId(employeeId),
    $or: [
      { startTime: { $gte: payPeriodStart, $lte: payPeriodEnd } },
      { endTime: { $gte: payPeriodStart, $lte: payPeriodEnd } },
      { startTime: { $lte: payPeriodStart }, endTime: { $gte: payPeriodEnd } }
    ]
  });

  let requiredHours = 0;
  shifts.forEach(shift => {
    const start = new Date(shift.startTime).getTime();
    const end = new Date(shift.endTime).getTime();
    const breakMs = (shift.breakTimeInMinutes || 0) * 60 * 1000;
    requiredHours += (end - start - breakMs) / (1000 * 60 * 60);
  });

  // 7. Fetch actual worked hours from TimeEntry
  const entries = await TimeEntry.find({
    employeeId: new mongoose.Types.ObjectId(employeeId),
    $or: [
      { clockIn: { $gte: payPeriodStart, $lte: payPeriodEnd } },
      { clockOut: { $gte: payPeriodStart, $lte: payPeriodEnd } },
      { clockIn: { $lte: payPeriodStart }, clockOut: { $gte: payPeriodEnd } }
    ]
  });

  // 8. Split into regular + overtime (8 hrs/day rule)
  let regularHours = 0;
  let overtimeHours = 0;
  entries.forEach(entry => {
    if (entry.clockIn && entry.clockOut) {
      const worked =
        (new Date(entry.clockOut).getTime() - new Date(entry.clockIn).getTime()) /
        (1000 * 60 * 60);
      const dailyRegular = Math.min(8, worked);
      const dailyOvertime = Math.max(0, worked - 8);
      regularHours += dailyRegular;
      overtimeHours += dailyOvertime;
    }
  });

  // 9. Calculate hourly rate (fallback to 160 hrs/month)
  const hourlyRate = wageAmount / (requiredHours || 160);
  const overtimePayRate = overtimeRate || hourlyRate * 1.5;

  // 10. Calculate gross pay
  const grossPay = (basicPay + hra + specialAllowance + medicalAllowance) + (overtimeHours * overtimePayRate);

  // 11. Calculate net pay
  const deductions: IndianDeductions = {
    tax: monthlyTax,
    pf,
    professionalTax,
    hra,
    medicalAllowance,
    specialAllowance,
    ...(employee.deductions || {}),
    ...(inputDeductions || {})
  };

  const totalDeductions = Object.values(deductions).reduce(
    (sum, val) => sum + (val || 0),
    0
  );

  const netPay = grossPay - totalDeductions;

  return {
    regularHours,
    overtimeHours,
    wage: wageAmount,
    grossPay,
    deductions,
    netPay,
    finalBill: netPay,
    overtimeRate: overtimePayRate,
  };
};

// Generate payroll for all employees
export const generatePayrollForAll = async (req: any, res: any) => {
  try {
    const { payPeriodStart, payPeriodEnd } = req.body;
    const employees = await Employee.find({ role: { $ne: 'Admin' } });

    const payslips = [];
    for (const employee of employees) {
      const result = await calculateIndianPayroll({
        employeeId: employee._id.toString(),
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd),
      });

      const payslipNumber = await generatePayslipNumber();

      const payslip = new Payslip({
        payslipNumber,
        employeeId: new mongoose.Types.ObjectId(employee._id),
        department: employee.jobInfo?.departmentId?._id,
        payPeriodStart,
        payPeriodEnd,
        regularHours: result.regularHours,
        overtimeHours: result.overtimeHours,
        wage: result.wage,
        grossPay: result.grossPay,
        deductions: result.deductions,
        netPay: result.netPay,
        finalBill: result.finalBill,
        overtimeRate: result.overtimeRate,
        status: "pending",
      });

      await payslip.save();
      payslips.push(payslip);
    }

    res.status(201).json({ message: "Payroll generated successfully", payslips });
  } catch (error) {
    console.error("Error generating payroll:", error);
    res.status(500).json({ message: "Error generating payroll", error: error instanceof Error ? error.message : error });
  }
};

// Create a new payslip
export const createPayslip = async (req: any, res: any) => {
  try {
    const data = req.body;
    if (data.payPeriodStart >= data.payPeriodEnd)
      return res.status(400).json({ message: "Invalid pay period" });

    const existing = await Payslip.findOne({
      employeeId: new mongoose.Types.ObjectId(data.employeeId),
      $or: [
        { payPeriodStart: { $lte: data.payPeriodEnd, $gte: data.payPeriodStart } },
        { payPeriodEnd: { $lte: data.payPeriodEnd, $gte: data.payPeriodStart } }
      ]
    });

    if (existing)
      return res.status(400).json({ message: "Payslip for this period already exists" });

    const result = await calculateIndianPayroll({
      employeeId: data.employeeId,
      payPeriodStart: data.payPeriodStart,
      payPeriodEnd: data.payPeriodEnd,
      overtimeRate: data.overtimeRate,
      deductions: data.deductions
    });

    const payslipNumber = await generatePayslipNumber();

    const payslip = new Payslip({
      payslipNumber,
      employeeId: new mongoose.Types.ObjectId(data.employeeId),
      payPeriodStart: data.payPeriodStart,
      payPeriodEnd: data.payPeriodEnd,
      wage: result.wage,
      grossPay: result.grossPay,
      deductions: result.deductions,
      netPay: result.netPay,
      regularHours: result.regularHours,
      overtimeHours: result.overtimeHours,
      overtimeRate: result.overtimeRate,
      finalBill: result.finalBill,
      status: "draft" 
    });

    const savedPayslip = await payslip.save();
    res.status(201).json(savedPayslip);
  } catch (error) {
    console.error("Error creating payslip:", error);
    res.status(500).json({ message: "Error creating payslip", error: error instanceof Error ? error.message : error });
  }
};

// Get all payslips for an employee
export const getPayslipsByEmployee = async (req: any, res: any) => {
  try {
    const { employeeId } = req.params;
    const payslips = await Payslip.find({ employeeId: new mongoose.Types.ObjectId(employeeId) }).sort({ payPeriodEnd: -1 });
    res.status(200).json(payslips);
  } catch (error) {
    console.error("Error fetching payslips:", error);
    res.status(500).json({ message: "Error fetching payslips", error: error instanceof Error ? error.message : error });
  }
};

// Get all payslips (admin)
export const getAllPayslips = async (_req: any, res: any) => {
  try {
    const payslips = await Payslip.find().sort({ payPeriodEnd: -1 });
    res.status(200).json(payslips);
  } catch (error) {
    console.error("Error fetching all payslips:", error);
    res.status(500).json({ message: "Error fetching all payslips", error: error instanceof Error ? error.message : error });
  }
};

// Update a payslip
export const updatePayslip = async (req: any, res: any) => {
  try {
    const { payslipId } = req.params;
    const data = req.body;

    if (Object.keys(data).length === 1 && data.status) {
      const updated = await Payslip.findByIdAndUpdate(
        payslipId,
        { status: data.status },
        { new: true }
      );
      return res.status(200).json(updated);
    }

    if (data.payPeriodStart && data.payPeriodEnd && data.payPeriodStart >= data.payPeriodEnd)
      return res.status(400).json({ message: "Invalid pay period" });

    const result = await calculateIndianPayroll({
      employeeId: data.employeeId,
      payPeriodStart: data.payPeriodStart,
      payPeriodEnd: data.payPeriodEnd,
      overtimeRate: data.overtimeRate,
      deductions: data.deductions
    });

    const updatedPayslip = await Payslip.findByIdAndUpdate(
      payslipId,
      { ...data, ...result },
      { new: true }
    );

    if (!updatedPayslip) return res.status(404).json({ message: "Payslip not found" });
    res.status(200).json(updatedPayslip);
  } catch (error) {
    console.error("Error updating payslip:", error);
    res.status(500).json({ message: "Error updating payslip", error: error instanceof Error ? error.message : error });
  }
};

// Patch payslip status
export const patchPayslipStatus = async (req: any, res: any) => {
  try {
    const { payslipId } = req.params;
    const { status } = req.body;
    if (!['draft', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const updatedPayslip = await Payslip.findByIdAndUpdate(
      payslipId,
      { status },
      { new: true }
    );
    if (!updatedPayslip) {
      return res.status(404).json({ message: "Payslip not found" });
    }
    res.status(200).json(updatedPayslip);
  } catch (error) {
    console.error("Error patching payslip status:", error);
    res.status(500).json({
      message: "Error patching payslip status",
      error: error instanceof Error ? error.message : error
    });
  }
};

// Get single payslip by ID
export const getPayslipById = async (req: any, res: any) => {
  try {
    const { payslipId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(payslipId)) {
      return res.status(400).json({ message: "Invalid payslipId" });
    }
    const payslip = await Payslip.findById(payslipId);
    if (!payslip) return res.status(404).json({ message: "Payslip not found" });
    res.status(200).json(payslip);
  } catch (error) {
    console.error("Error fetching payslip by id:", error);
    res.status(500).json({ message: "Error fetching payslip", error: error instanceof Error ? error.message : error });
  }
};
