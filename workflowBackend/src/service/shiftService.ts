// src/service/shiftService.ts
import mongoose from 'mongoose';
import { Shift } from '../model/model';
import { startOfWeek, endOfWeek } from "date-fns"; // handy date utils

function getShiftDateTime(date: string, time: string): Date {
  // date: "2025-09-08", time: "21:00"
  const [hours, minutes] = time.split(':').map(Number);
  const baseDate = new Date(date);
  baseDate.setHours(hours, minutes || 0, 0, 0);
  return baseDate;
}

// Create a shift
export const createShift = async (data: {
  employeeId: string;
  managerId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakTimeInMinutes?: number;
  isPublished?: boolean;
}) => {
  try {
    // Calculate start and end DateTime
    const startDateTime = getShiftDateTime(data.date, data.startTime);
    let endDateTime = getShiftDateTime(data.date, data.endTime);

    // If endTime is less than or equal to startTime, shift ends next day
    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    // Find all shifts for this employee that could overlap (including previous/next day for night shifts)
    const possibleOverlaps = await Shift.find({
      employeeId: new mongoose.Types.ObjectId(data.employeeId),
      $or: [
        { date: startDateTime },
        { date: endDateTime },
        { date: { $gte: new Date(startDateTime.getTime() - 24*60*60*1000), $lte: new Date(endDateTime.getTime() + 24*60*60*1000) } }
      ]
    });

    for (const shift of possibleOverlaps) {
      // Get actual start and end DateTime for each shift
      let existingStart = getShiftDateTime(shift.date.toISOString().split('T')[0], shift.startTime.toISOString().substr(11,5));
      let existingEnd = getShiftDateTime(shift.date.toISOString().split('T')[0], shift.endTime.toISOString().substr(11,5));
      if (existingEnd <= existingStart) {
        existingEnd.setDate(existingEnd.getDate() + 1);
      }
      // Overlap check
      if (startDateTime < existingEnd && endDateTime > existingStart) {
        throw new Error("Shift overlaps with an existing shift for this employee");
      }
    }

    // Save shift
    const shift = new Shift({
      employeeId: new mongoose.Types.ObjectId(data.employeeId),
      managerId: new mongoose.Types.ObjectId(data.managerId),
      date: startDateTime,
      startTime: startDateTime,
      endTime: endDateTime,
      breakTimeInMinutes: data.breakTimeInMinutes || 0,
      isPublished: data.isPublished ?? false,
    });

    return await shift.save();
  } catch (err: any) {
    console.error("Error creating shift:", err.message);
    throw err;
  }
};

// Get shifts by employee
export const getShiftsByEmployee = (employeeId: string) => {
 const today = new Date();

  // Get Monday 00:00:00 of this week
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  // Get Sunday 23:59:59 of this week
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  return Shift.find({
    employeeId: new mongoose.Types.ObjectId(employeeId),
    date: { $gte: weekStart }
  }).populate('employeeId').sort({ date: 1, startTime: 1 });
};

// Get shifts by date (for managers)
export const getShiftsByDate = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return Shift.find({ date: { $gte: start, $lte: end } }).populate('employeeId');
};

// Update shift (e.g., publish or change times)
export const updateShift = async (shiftId: string, data: Partial<{
  startTime: Date;
  endTime: Date;
  breakTimeInMinutes: number;
  isPublished?: boolean;
}>) => {
  return Shift.findByIdAndUpdate(shiftId, data, { new: true });
};

// =======================
// Open Shift Features
// =======================

// Employee opens their shift
export const makeShiftOpen = async (shiftId: string, employeeId: string) => {
  const shift = await Shift.findById(shiftId);
  if (!shift) throw new Error("Shift not found");
  if (shift.date < new Date()) {
  throw new Error("Cannot open a past shift");
}
  if (shift.employeeId.toString() !== employeeId) {
    throw new Error("You can only open your own shift");
  }
  shift.isOpen = true;
  shift.set('requestedBy', null); // Clear the requester field
  shift.requestStatus = "none";
  return (await shift.save());
};

// ✅ Employee revokes their open shift
export const revokeOpenShift = async (shiftId: string, employeeId: string) => {
  const shift = await Shift.findById(shiftId);
  if (!shift) throw new Error("Shift not found");

  if (shift.employeeId.toString() !== employeeId) {
    throw new Error("You can only revoke your own shift");
  }

  if (shift.requestStatus === "pending") {
    throw new Error("Cannot revoke a shift with a pending request. The manager must approve or reject it first.");
  }

  if (shift.requestStatus === "approved") {
    throw new Error("Shift already transferred. Cannot revoke.");
  }

  // reset fields → shift back to normal
  shift.isOpen = false;
  shift.set('requestedBy', null);
  shift.requestStatus = "none";

  return shift.save();
};

// Get open shifts by manager, only future dates
export const getUpcomingOpenShiftsByManager = (managerId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // start of today

  return Shift.find({
    managerId: new mongoose.Types.ObjectId(managerId),
    isOpen: true,
    date: { $gte: today } // only upcoming
  }).populate("employeeId requestedBy").sort({ date: 1, startTime: 1 });;
};

// Employee requests an open shift
export const requestOpenShift = async (shiftId: string, newEmployeeId: string) => {
  const shift = await Shift.findById(shiftId);
  if (!shift) throw new Error("Shift not found");
  if (shift.requestStatus === "pending") {
  throw new Error("Another request is already pending for this shift");
}
  if (!shift.isOpen) throw new Error("Shift is not open");
  if (shift.employeeId.toString() === newEmployeeId) throw new Error("You cannot request your own shift");
   
  // Check if employee already has a conflicting shift
  const overlap = await Shift.findOne({
    employeeId: new mongoose.Types.ObjectId(newEmployeeId),
    date: shift.date,
    $or: [
      { startTime: { $lt: shift.endTime }, endTime: { $gt: shift.startTime } }
    ]
  });

  if (overlap) throw new Error("You already have a shift at this time");
  console.log(newEmployeeId)
  shift.requestedBy = new mongoose.Types.ObjectId(newEmployeeId);
  shift.requestStatus = "pending";
  return shift.save();
};

// Manager gets all pending requests
export const getPendingRequestsByManager = (managerId: string) => {
  return Shift.find({
    managerId: new mongoose.Types.ObjectId(managerId),
    requestStatus: "pending"
  }).populate("requestedBy");
};

// Manager approves request
export const approveOpenShift = async (shiftId: string, managerId: string) => {
   const shift = await Shift.findById(shiftId);
  if (!shift) throw new Error("Shift not found");

  if (shift.managerId.toString() !== managerId) {
    throw new Error("Not authorized to approve this shift request.");
  }

  if (shift.requestStatus !== "pending") {
    throw new Error("No pending request to approve");
  }
  try{
  if(shift.requestedBy){
  shift.employeeId = shift.requestedBy;
  }
  shift.requestStatus = "approved";
  shift.isOpen = false;
  shift.set('requestedBy', null);
  await shift.save();

  // 🔹 Re-fetch with populated fields
  return Shift.findById(shift._id).populate("employeeId requestedBy");
  }catch(e :any){
    console.log(e.message)
  }
};

// Manager rejects request
export const rejectOpenShift = async (shiftId: string, managerId: string) => {
   const shift = await Shift.findById(shiftId);
  if (!shift) throw new Error("Shift not found");

  if (shift.managerId.toString() !== managerId) {
    throw new Error("Not authorized to reject this shift request.");
  }
  if (shift.requestStatus !== 'pending' || !shift.requestedBy) {
    throw new Error("No pending request to reject.");
  }

  const rejectedEmployee = shift.requestedBy;
  // Reset the shift to be open and available for other requests
  shift.requestStatus = "none";
  shift.set('requestedBy', null);
  await shift.save();

  // 🔹 Re-fetch with populated fields
  const updatedShift = await Shift.findById(shift._id).populate("employeeId requestedBy");

  return { 
    message: "Shift request rejected and is now available again.", 
    shift: updatedShift, 
    rejectedEmployee 
  };
}

// Add this function to your existing shiftService.ts
export const getPendingShiftRequestsByManager = async (managerId: string) => {
  try {
    
    
    const pendingShifts = await Shift.find({
      managerId: new mongoose.Types.ObjectId(managerId),
      requestStatus: 'pending'
    })
    .populate('employeeId', 'firstName lastName email')
    .populate('requestedBy', 'firstName lastName email')
    .populate('managerId', 'firstName lastName email')
    .sort({ createdAt: -1 });
    
    
    return pendingShifts;
  } catch (error) {
    console.error('Service error getting pending shift requests by manager:', error);
    throw error;
  }
};