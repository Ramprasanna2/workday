import { Employee, Shift, TimeEntry, Payslip } from '../model/model';
import mongoose from 'mongoose';

// Function to generate unique payslip number
export const generatePayslipNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Find the last payslip number for this month/year
  const lastPayslip = await Payslip.findOne({
    payslipNumber: { $regex: `^PS${year}${month}` }
  }).sort({ payslipNumber: -1 });
  
  let sequence = 1;
  if (lastPayslip && lastPayslip.payslipNumber) {
    const lastSequence = parseInt(lastPayslip.payslipNumber.slice(-4));
    sequence = lastSequence + 1;
  }
  
  return `PS${year}${month}${String(sequence).padStart(4, '0')}`;
};

interface Deductions {
  tax?: number;
  socialSecurity?: number;
  medicare?: number;
  insurance?: number;
  retirement?: number;
}

export const calculatePay = async ({
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
  deductions?: Deductions
}) => {
  // 1. Get Employee wage info
  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error("Employee not found");

  const payType = employee.compensation?.payPeriod;
  const wageAmount = employee.compensation?.wage;
  if (!wageAmount) throw new Error("Employee wage information not found");

  // 2. Scheduled hours from Shifts
  const shifts = await Shift.find({
    employeeId,
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

  // 3. Actual worked hours from TimeEntry
  const entries = await TimeEntry.find({
    employeeId,
    $or: [
      { clockIn: { $gte: payPeriodStart, $lte: payPeriodEnd } },
      { clockOut: { $gte: payPeriodStart, $lte: payPeriodEnd } },
      { clockIn: { $lte: payPeriodStart }, clockOut: { $gte: payPeriodEnd } }
    ]
  });

  // 4. Split into regular + overtime (8 hrs/day rule)
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

  // 5. Wage calculation
  let hourlyRate = 0;
  if (payType === "Monthly") {
    hourlyRate = wageAmount / (requiredHours || 160); // fallback to 160 hrs
  } else if (payType === "Annual") {
    const monthlyRate = wageAmount / 12;
    hourlyRate = monthlyRate / (requiredHours || 160);
  } else {
    throw new Error(`Unsupported payType: ${payType}`);
  }

  const overtimePayRate = overtimeRate || hourlyRate * 1.5;
  const grossPay = regularHours * hourlyRate + overtimeHours * overtimePayRate;

  // 6. Deductions
  const deductions: Deductions = {
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
    grossPay,
    wageAmount,
    overtimeRate: overtimePayRate,
    netPay,
    finalBill: netPay,
    deductions
  };
};

// ✅ Create a new payslip
export const createPayslip = async (req: any, res: any) => {
  try {
    const data = req.body;

    if (data.payPeriodStart >= data.payPeriodEnd)
      return res.status(400).json({ message: "Invalid pay period" });

    const existing = await Payslip.findOne({
      employeeId: data.employeeId,
      $or: [
        { payPeriodStart: { $lte: data.payPeriodEnd, $gte: data.payPeriodStart } },
        { payPeriodEnd: { $lte: data.payPeriodEnd, $gte: data.payPeriodStart } }
      ]
    });

    if (existing)
      return res.status(400).json({ message: "Payslip for this period already exists" });

    const result = await calculatePay(data);

    const payslipNumber = await generatePayslipNumber();

    const payslip = new Payslip({
      employeeId: new mongoose.Types.ObjectId(data.employeeId),
      payslipNumber: payslipNumber,
      payPeriodStart: data.payPeriodStart,
      payPeriodEnd: data.payPeriodEnd,
      wage: result.wageAmount,
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

// ✅ Get all payslips for employee
export const getPayslipsByEmployee = async (req: any, res: any) => {
  try {
    const { employeeId } = req.params;
    const payslips = await Payslip.find({ employeeId }).sort({ payPeriodEnd: -1 });
    res.status(200).json(payslips);
  } catch (error) {
    console.error("Error fetching payslips:", error);
    res.status(500).json({ message: "Error fetching payslips", error: error instanceof Error ? error.message : error });
  }
};

// ✅ Get all payslips (admin)
export const getAllPayslips = async (_req: any, res: any) => {
  try {
    const payslips = await Payslip.find().sort({ payPeriodEnd: -1 });
    res.status(200).json(payslips);
  } catch (error) {
    console.error("Error fetching all payslips:", error);
    res.status(500).json({ message: "Error fetching all payslips", error: error instanceof Error ? error.message : error });
  }
};

// ✅ Update payslip (smart: recalc only if pay fields are changed)
export const updatePayslip = async (req: any, res: any) => {
  try {
    const { payslipId } = req.params;
    const data = req.body;

    // Only status change → skip recalculation
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

    const result = await calculatePay(data);

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

// ✅ Patch just status
// ✅ Patch status only
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
