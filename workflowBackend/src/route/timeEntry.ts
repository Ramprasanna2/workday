import express from 'express';
import { clockIn, clockOut, getTimeEntriesForEmployee, getTimeEntriesByDate } from '../service/timeEntryService';

const router = express.Router();

// Get time entries for employee by date
router.get('/employee/:employeeId/date/:date', async (req, res) => {
  try {
    const { employeeId, date } = req.params;
    
    const entries = await getTimeEntriesByDate(employeeId, date);
 
    
    res.json(entries);
  } catch (err: any) {
    console.error('Error getting time entries by date:', err);
    res.status(400).json({ error: err.message });
  }
});

// Employee clock-in
router.post('/clockin', async (req, res) => {
  try {
    const entry = await clockIn(req.body);
    res.json(entry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Employee clock-out
router.post('/clockout/:id', async (req, res) => {
  try {
    const entry = await clockOut(req.params.id, req.body);
    res.json(entry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all time entries for employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const entries = await getTimeEntriesForEmployee(req.params.employeeId);
    res.json(entries);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all time entries (for reports)
router.get('/all', async (req, res) => {
  try {
    const { getAllTimeEntries } = await import('../service/timeEntryService');
    const entries = await getAllTimeEntries();
    res.json(entries);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;