// src/route/shift.ts
import express from 'express';
import {  createShift,
  getShiftsByEmployee,
  getShiftsByDate,
  updateShift,
  makeShiftOpen,
  requestOpenShift,
  getPendingRequestsByManager,
  approveOpenShift,
  rejectOpenShift,
   revokeOpenShift,  
getUpcomingOpenShiftsByManager,
getPendingShiftRequestsByManager } from '../service/shiftService';
import mongoose from 'mongoose';
import { Shift } from '../model/model';

const router = express.Router();

router.post('/deleting/:id', async (req, res) => {
  try {
    console.log("executed")
    await Shift.findByIdAndDelete(req.params.id);
    res.json({ message: 'Shift deleted' }); 
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all shifts (alias for root route)
router.get("/", async (req, res) => {
  try {
    const shifts = await Shift.find()
      .populate('employeeId', 'firstName lastName email')
      .sort({ startTime: -1 });
    res.json(shifts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
})

// Get all shifts
router.get('/all', async (req, res) => {
  try {
    const shifts = await Shift.find()
      .populate('employeeId', 'firstName lastName email')
      .sort({ startTime: -1 });
    res.json(shifts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a shift
router.post('/', async (req, res) => {
  try {
    console.log('Request body for creating shift:', req.body);
    
    const shift = await createShift(req.body);
    res.status(201).json(shift);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get shifts by employee
router.get('/employee/:id', async (req, res) => {
  try {
    const shifts = await getShiftsByEmployee(req.params.id);
    res.json(shifts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get shifts by date
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const shifts = await getShiftsByDate(date);
    res.json(shifts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update shift
router.post('/update/:id', async (req, res) => {
  try {
    const updatedShift = await updateShift(req.params.id, req.body);
    res.json(updatedShift);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// =======================
// Open Shift Routes
// =======================

// Employee opens their shift
router.post("/open/:id", async (req, res) => {
  try {
    const shift = await makeShiftOpen(req.params.id, req.body.employeeId);
    res.json(shift);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Employee requests to take an open shift
router.post("/request/:id", async (req, res) => {
  try {
    const shift = await requestOpenShift(req.params.id, req.body.employeeId);
    res.json(shift);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Manager gets all pending requests
router.get("/requests/manager/:managerId", async (req, res) => {
  try {
    const requests = await getPendingRequestsByManager(req.params.managerId);
    res.json(requests);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Manager approves request
router.post("/request/approve/:id", async (req, res) => {
  try {
    const shift = await approveOpenShift(req.params.id, req.body.managerId);
    res.json(shift);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Manager rejects request
router.post("/request/reject/:id", async (req, res) => {
  try {
    const result= await rejectOpenShift(req.params.id, req.body.managerId);

   res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get upcoming open shifts by manager
router.get("/open/manager/:managerId", async (req, res) => {
  try {
    const shifts = await getUpcomingOpenShiftsByManager(req.params.managerId);
    res.json(shifts);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Employee revokes their open shift
router.post("/revoke/:id", async (req, res) => {
  try {
    const shift = await revokeOpenShift(req.params.id, req.body.employeeId);
    res.json({ message: "Shift successfully revoked", shift });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get shift(s) for a particular employee on a particular day
router.get('/employee/:id/date/:date', async (req, res) => {
  try {
    const { id, date } = req.params;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Find shifts for employee on that day
    const shifts = await Shift.find({
      employeeId: new mongoose.Types.ObjectId(id),
      date: { $gte: targetDate, $lte: endDate }
    }).populate('employeeId requestedBy');

    res.json(shifts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending shift requests by manager
router.get('/manager/:managerId/pending', async (req, res) => {
  try {
    const { managerId } = req.params;
    console.log('Getting pending shift requests for manager:', managerId);
    
    const pendingShifts = await getPendingShiftRequestsByManager(managerId);
    console.log('Found pending shift requests:', pendingShifts.length);
    
    res.json(pendingShifts);
  } catch (err: any) {
    console.error('Error getting pending shift requests by manager:', err);
    res.status(400).json({ error: err.message });
  }
});


export default router;