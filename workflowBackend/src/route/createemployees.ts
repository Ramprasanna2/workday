import express from 'express';
import { 
  createEmployee, 
  deleteEmployee, 
  updateEmployee,
  getAllEmployees,
  getManagers,
  getTeamMembers,
  removeManagerFromEmployees,
  getEmployeesWithFilters
} from '../service/createEmployee';

const router = express.Router();

// Create employee
router.post('/create', async (req, res) => {
  try {
    const employee = await createEmployee(req.body);
    res.status(201).json(employee);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get all employees
router.get('/all', async (req, res) => {
  try {
    const employees = await getAllEmployees();
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get employees with filters
router.get('/filtered', async (req, res) => {
  try {
    const { departmentId, positionId, hasManager } = req.query;
    
    const filters: any = {};
    if (departmentId) filters.departmentId = departmentId as string;
    if (positionId) filters.positionId = positionId as string;
    if (hasManager !== undefined) filters.hasManager = hasManager === 'true';

    const employees = await getEmployeesWithFilters(filters);
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get managers
router.get('/managers', async (req, res) => {
  try {
    const managers = await getManagers();
    res.json(managers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get team members of a manager
router.get('/:id/team', async (req, res) => {
  try {
    const teamMembers = await getTeamMembers(req.params.id);
    res.json(teamMembers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Remove manager from all employees managed by this manager
router.patch('/:id/remove-as-manager', async (req, res) => {
  try {
    const result = await removeManagerFromEmployees(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await updateEmployee(req.params.id, req.body);
    res.json(employee);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteEmployee(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;