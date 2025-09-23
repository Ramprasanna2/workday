import express from 'express';
import { 
  createDepartment, 
  getAllDepartments, 
  deleteDepartment,
  createPosition,
  getAllPositions,
  deletePosition,
  getManagers,
  recalculateEmployeeCounts
} from '../service/adminService';
import {Employee} from '../model/model'; // Import the Employee model
import mongoose from 'mongoose'; // Import mongoose for ObjectId

const router = express.Router();

// Department Routes
router.post('/departments', async (req, res) => {
  try {
    const department = await createDepartment(req.body);
    res.status(201).json(department);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/departments', async (req, res) => {
  try {
    const departments = await getAllDepartments();
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/departments/:id', async (req, res) => {
  try {
    await deleteDepartment(req.params.id);
    res.json({ message: 'Department deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Position Routes
router.post('/positions', async (req, res) => {
  try {
    const position = await createPosition(req.body);
    res.status(201).json(position);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/positions', async (req, res) => {
  try {
    const positions = await getAllPositions();
    res.json(positions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/positions/:id', async (req, res) => {
  try {
    await deletePosition(req.params.id);
    res.json({ message: 'Position deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Manager Routes
router.get('/managers', async (req, res) => {
  try {
    const managers = await getManagers();
    res.json(managers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Utility route to recalculate counts (for admin use)
router.post('/recalculate-counts', async (req, res) => {
  try {
    const result = await recalculateEmployeeCounts();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get team members by manager ID
router.get('/employees/manager/:managerId/team', async (req, res) => {
  try {
    const { managerId } = req.params;
    console.log('Getting team members for manager:', managerId);
    
    const teamMembers = await Employee.find({
      'jobInfo.managerId': new mongoose.Types.ObjectId(managerId),
      isActive: { $ne: false }
    })
    .populate('jobInfo.positionId', 'title')
    .populate('jobInfo.departmentId', 'name')
    .select('firstName lastName email jobInfo role')
    .sort({ firstName: 1, lastName: 1 });
    
    console.log('Found team members:', teamMembers.length);
    res.json(teamMembers);
  } catch (err: any) {
    console.error('Error getting team members:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;