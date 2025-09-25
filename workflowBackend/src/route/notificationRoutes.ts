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

// Get all notifications (for dashboard)
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(20); // Limit to recent 20 notifications
    
    // Map notifications to match expected format with mock data for now
    const mockNotifications = [
      {
        _id: '1',
        title: 'New Goal Assigned',
        message: 'You have been assigned a new quarterly goal',
        type: 'info',
        createdAt: new Date().toISOString(),
        icon: 'Target'
      },
      {
        _id: '2',
        title: 'Payslip Generated',
        message: 'Your payslip for this month is ready',
        type: 'success',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        icon: 'CheckCircle'
      },
      {
        _id: '3',
        title: 'Leave Request Approved',
        message: 'Your leave request has been approved',
        type: 'success',
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        icon: 'CheckCircle'
      },
      {
        _id: '4',
        title: 'Shift Reminder',
        message: 'Your shift starts in 30 minutes',
        type: 'warning',
        createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        icon: 'AlertCircle'
      }
    ];
    
    res.json(mockNotifications);
  } catch (error: any) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: error.message || 'Failed to get notifications' });
  }
});

export default router;