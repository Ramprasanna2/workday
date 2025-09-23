// src/service/leaveRequestService.ts
import mongoose from 'mongoose';
import { LeaveRequest } from '../model/model';

export const createLeaveRequest = async (data: {
  employeeId: string;
  managerId: string;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
}) => {
  const leave = new LeaveRequest({
    employeeId: new mongoose.Types.ObjectId(data.employeeId),
    managerId: new mongoose.Types.ObjectId(data.managerId),
    startDate: data.startDate,
    endDate: data.endDate,
    days: data.days,
    reason: data.reason,
  });
  return leave.save();
};

export const getAllLeaveRequests = () => {
  return LeaveRequest.find().populate('employeeId');
};

// src/service/leaveRequestService.ts
export const updateLeaveStatus = async (
  leaveId: string,
  status: 'Pending' | 'Approved' | 'Rejected',
  approverNotes?: string
) => {
  return LeaveRequest.findByIdAndUpdate(
    leaveId,
    { status, approverNotes },
    { new: true }
  ).populate('employeeId');
};

export const getLeaveRequestsByEmployee = async (employeeId: string) => {
  try {
    console.log('Service: Getting leave requests for employee:', employeeId);

    const requests = await LeaveRequest.find({
      employeeId: new mongoose.Types.ObjectId(employeeId),
    })
      .populate('employeeId', 'name email')
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 }); // Most recent first

    console.log('Service: Found leave requests:', requests.length);
    return requests;
  } catch (error) {
    console.error('Service error getting leave requests by employee:', error);
    throw error;
  }
};

export const getPendingLeaveRequestsByManager = async (managerId: string) => {
  try {
    console.log('Service: Getting pending leave requests for manager:', managerId);

    const pendingRequests = await LeaveRequest.find({
      managerId: new mongoose.Types.ObjectId(managerId),
      status: 'Pending',
    })
      .populate('employeeId', 'firstName lastName email')
      .populate('managerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    console.log('Service: Found pending leave requests:', pendingRequests.length);
    return pendingRequests;
  } catch (error) {
    console.error('Service error getting pending leave requests by manager:', error);
    throw error;
  }
};
