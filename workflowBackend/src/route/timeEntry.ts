import express from 'express';
import { clockIn, clockOut, getEmployeeTimeEntries, getAllTimeEntries,getEmployeeTimeEntriesForDay } from '../service/timeEntryService';

const router = express.Router();

// Employee clock-in
router.post('/clockin', async (req, res) => {
  try {
    const entry = await clockIn(req.body);
    res.status(201).json(entry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Employee clock-out
router.post('/clockout/:id', async (req, res) => {
  try {
    const entry = await clockOut(req.params.id, new Date());
    res.json(entry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all time entries of a specific employee
router.get('/employee/:id', async (req, res) => {
  try {
    const entries = await getEmployeeTimeEntries(req.params.id);
    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// HR/Manager - Get all employees’ check-in/out
router.get('/all', async (req, res) => {
  try {
    const entries = await getAllTimeEntries();
    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get time entries for a particular employee on a particular day
router.get('/employee/:id/date/:date', async (req, res) => {
  try {
    const { id, date } = req.params;
    // Parse date and set range for the day
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const entries = await getEmployeeTimeEntriesForDay(id, start, end);
    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;