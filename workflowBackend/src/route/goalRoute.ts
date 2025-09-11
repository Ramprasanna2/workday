import express from 'express';
import {
  assignGoal,
  updateMultipleModuleStatus,
  getEmployeeGoals,
  getAssignedGoals,
  deleteGoal
} from '../service/goalService';

const router = express.Router();

// Assign a goal (Manager/Admin only)
router.post('/', assignGoal);

// Employee updates module status
router.patch('/:goalId/modules/status', updateMultipleModuleStatus);

// Get all goals for an employee
router.get('/employee/:employeeId', getEmployeeGoals);

// Get all goals assigned by a manager
router.get('/assigned/:managerId', getAssignedGoals);

// Delete a goal
router.delete('/:goalId', deleteGoal);

export default router;