// src/route/leaveRequest.ts
import express from 'express';
import { createLeaveRequest, getAllLeaveRequests, updateLeaveStatus, getLeaveRequestsByEmployee, getPendingLeaveRequestsByManager } from '../service/leaveRequestService';
import {LeaveRequest} from '../model/model';

const router = express.Router();

// Create leave request
router.post('/', async (req, res) => {
  try {
    const leave = await createLeaveRequest(req.body);
    res.status(201).json(leave);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all leave requests
router.get('/', async (req, res) => {
  try {
    const leaves = await getAllLeaveRequests();
    res.json(leaves);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update leave status
// src/route/leaveRequest.ts
router.post('/:id/status', async (req, res) => {
  try {
    const { status, approverNotes } = req.body;
    const updatedLeave = await updateLeaveStatus(req.params.id, status, approverNotes);
    res.json(updatedLeave);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get approved leave requests for a specific employee on a specific date
router.get('/employee/:employeeId/date/:date', async (req, res) => {
  try {
    const { employeeId, date } = req.params;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const leaves = await LeaveRequest.find({
      employeeId: employeeId,
      status: "Approved",
      startDate: { $lte: endDate },
      endDate: { $gte: targetDate }
    }).populate('employeeId');

    res.json(leaves);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get leave requests by employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log('Getting leave requests for employee:', employeeId);
    
    const leaveRequests = await getLeaveRequestsByEmployee(employeeId);
    console.log('Found leave requests:', leaveRequests.length);
    
    res.json(leaveRequests);
  } catch (err: any) {
    console.error('Error getting leave requests by employee:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get pending leave requests by manager
router.get('/manager/:managerId/pending', async (req, res) => {
  try {
    const { managerId } = req.params;
    console.log('Getting pending leave requests for manager:', managerId);
    
    const pendingRequests = await getPendingLeaveRequestsByManager(managerId);
    console.log('Found pending leave requests:', pendingRequests.length);
    
    res.json(pendingRequests);
  } catch (err: any) {
    console.error('Error getting pending leave requests by manager:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
