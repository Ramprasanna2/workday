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


// Delete a payslip by ID
export default router;
// src/route/payslipRoute.ts
import { generatePayrollForAll } from '../service/payslipService';
router.post('/generate-all', generatePayrollForAll);
