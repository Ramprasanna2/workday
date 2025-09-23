import express from 'express';
import {
  createShiftGroup,
  getShiftGroupsByManager,
  updateShiftGroup,
  deleteShiftGroup,
  getShiftGroupById
} from '../service/ShiftGroupService';

const router = express.Router();



// Create a new shift group
router.post('/', async (req, res) => {
  try {
    console.log('Creating shift group:', req.body);
    const group = await createShiftGroup(req.body);
    res.status(201).json(group);
  } catch (err: any) {
    console.error('Error creating shift group:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get all shift groups for a manager
router.get('/manager/:managerId', async (req, res) => {
  try {
    const groups = await getShiftGroupsByManager(req.params.managerId);
    res.json(groups);
  } catch (err: any) {
    console.error('Error getting shift groups:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get specific shift group
router.get('/:groupId', async (req, res) => {
  try {
    const group = await getShiftGroupById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Shift group not found' });
    }
    res.json(group);
  } catch (err: any) {
    console.error('Error getting shift group:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update shift group
router.put('/:groupId', async (req, res) => {
  try {
    const group = await updateShiftGroup(req.params.groupId, req.body);
    res.json(group);
  } catch (err: any) {
    console.error('Error updating shift group:', err);
    res.status(400).json({ error: err.message });
  }
});

// Delete shift group
router.delete('/:groupId', async (req, res) => {
  try {
    await deleteShiftGroup(req.params.groupId);
    res.json({ message: 'Shift group deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting shift group:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;