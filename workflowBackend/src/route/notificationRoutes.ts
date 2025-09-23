import express from "express";
import {Notification} from "../model/model";
const router = express.Router();

// --------------------------
// Send notification
// POST /api/notifications/send
// --------------------------
router.post("/send", async (req, res) => {
  try {
    const { senderId, receiverId, title, message, type, category } = req.body;
    const notification = await Notification.create({
      senderId,
      receiverId,
      title,
      message,
      type,
      category,
    });
    res.status(201).json(notification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------
// Get notifications for logged-in user
// GET /api/notifications/me
// ---------------------------------
router.get("/employee/:id", async (req, res) => {
  try {
    // Replace this with your session auth logic to get userId
    const userId = req.params.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const notifications = await Notification.find({ receiverId: userId }).sort({ createdAt: -1 });
    res.json(Array.isArray(notifications) ? notifications : []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------
// Mark a notification as read
// PATCH /api/notifications/:id/read
// --------------------------
router.post("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------
// Mark all notifications as read
// PUT /api/notifications/markAllRead
// --------------------------
router.put("/markAllRead/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    await Notification.updateMany({ receiverId: userId, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------
// Delete notification
// DELETE /api/notifications/:id
// --------------------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ message: "Notification deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread notification count for employee
router.get('/employee/:employeeId/unread-count', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const count = await Notification.countDocuments({
      receiverId: employeeId,  // Use receiverId instead of employeeId
      read: false
    });
    
    res.json({ count });
  } catch (error: any) {
    console.error('Error getting unread notification count:', error);
    res.status(500).json({ message: error.message || 'Failed to get unread count' });
  }
});

export default router;