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
