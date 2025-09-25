import express from 'express';
import {
  assignGoal,
  updateMultipleModuleStatus,
  getEmployeeGoals,
  getAssignedGoals,
  deleteGoal,
  getGoalsByEmployee
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

// Get all goals (for reports)
router.get('/all', async (req, res) => {
  try {
    const { Goal } = await import('../model/model');
    const goals = await Goal.find()
      .populate('employeeId', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(goals);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;