import express from 'express';
import {
  createPayslip,
  getPayslipsByEmployee,
  getAllPayslips,
  updatePayslip,
  getPayslipById,
  patchPayslipStatus
} from '../service/payslipService';

const router = express.Router();

// Create a new payslip
router.post('/', createPayslip);

// Get all payslips (admin)
router.get('/', getAllPayslips);

// Get all payslips for a specific employee
router.get('/employee/:employeeId', getPayslipsByEmployee);

// Update a payslip by ID
router.put('/:payslipId', updatePayslip);

// Patch status only
router.patch('/:payslipId/status', patchPayslipStatus);
// Get single payslip by ID
router.get('/:payslipId', getPayslipById);

// Get pending payslips by manager
router.get('/manager/:managerId/pending', async (req, res) => {
  try {
    const { managerId } = req.params;
    console.log('Getting pending payslips for manager:', managerId);
    
    // Import models
    const { Payslip, Employee } = await import('../model/model');
    
    // First, get all employees under this manager
    const teamMembers = await Employee.find({
      'jobInfo.managerId': managerId,
      isActive: { $ne: false }
    });
    
    const employeeIds = teamMembers.map(emp => emp._id);
    
    // Then get pending payslips for those employees
    const pendingPayslips = await Payslip.find({
      employeeId: { $in: employeeIds },
      status: 'draft'
    })
    .populate('employeeId', 'firstName lastName email')
    .sort({ createdAt: -1 });
    
    console.log('Found pending payslips:', pendingPayslips.length);
    res.json(pendingPayslips);
  } catch (err: any) {
    console.error('Error getting pending payslips by manager:', err);
    res.status(400).json({ error: err.message });
  }
});

// Generate payroll for all employees
router.post('/generate-all', async (req, res) => {
  try {
    const { payPeriodStart, payPeriodEnd } = req.body;
    
    // Get all active employees
    const { Employee } = await import('../model/model');
    const employees = await Employee.find({ isActive: { $ne: false } });
    
    const results = [];
    const errors = [];
    
    for (const employee of employees) {
      try {
        // Check if payslip already exists for this period
        const { Payslip } = await import('../model/model');
        const existing = await Payslip.findOne({
          employeeId: employee._id,
          payPeriodStart: new Date(payPeriodStart),
          payPeriodEnd: new Date(payPeriodEnd)
        });
        
        if (existing) {
          continue; // Skip if already exists
        }
        
        // Create payslip data
        const payslipData = {
          employeeId: employee._id.toString(),
          payPeriodStart: new Date(payPeriodStart),
          payPeriodEnd: new Date(payPeriodEnd),
        };
        
        // Use the existing calculatePay function
        const { calculatePay, generatePayslipNumber } = await import('../service/payslipService');
        const result = await calculatePay(payslipData);
        const payslipNumber = await generatePayslipNumber();
        
        const payslip = new Payslip({
          employeeId: employee._id,
          payslipNumber: payslipNumber,
          payPeriodStart: payslipData.payPeriodStart,
          payPeriodEnd: payslipData.payPeriodEnd,
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
        results.push(savedPayslip);
        
      } catch (error) {
        errors.push({
          employeeId: employee._id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    res.status(201).json({
      message: `Generated ${results.length} payslips successfully`,
      generated: results.length,
      errors: errors.length,
      errorDetails: errors
    });
    
  } catch (error) {
    console.error('Error generating payroll:', error);
    res.status(500).json({ 
      message: 'Error generating payroll', 
      error: error instanceof Error ? error.message : error 
    });
  }
});

// Delete a payslip by ID
export default router;
