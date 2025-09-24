// src/service/timeEntryService.ts
import mongoose from 'mongoose';
import { TimeEntry } from '../model/model';

// Get time entries by employee and date
export const getTimeEntriesByDate = async (employeeId: string, date: string) => {
 
  
  // Create date range for the specific date
  const startDate = new Date(date + 'T00:00:00.000Z');
  const endDate = new Date(date + 'T23:59:59.999Z');

  
  const entries = await TimeEntry.find({
    employeeId: new mongoose.Types.ObjectId(employeeId),
    clockIn: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ clockIn: -1 });
  

  return entries;
};

// Get all time entries for employee
export const getTimeEntriesForEmployee = async (employeeId: string) => {
  const entries = await TimeEntry.find({
    employeeId: new mongoose.Types.ObjectId(employeeId)
  }).sort({ clockIn: -1 });
  
  return entries;
};

// Clock in
export const clockIn = async (data: {
  employeeId: string;
  managerId: string;
  clockIn?: string;
}) => {
  const entry = new TimeEntry({
    employeeId: new mongoose.Types.ObjectId(data.employeeId),
    clockIn: data.clockIn ? new Date(data.clockIn) : new Date(),
    managerId: new mongoose.Types.ObjectId(data.managerId),
  });
  return entry.save();
};

// Clock out
export const clockOut = async (entryId: string, clockOutData: {
  clockOut: string;
  totalHours?: number;
  overtimeHours?: number;
}) => {
  const entry = await TimeEntry.findById(entryId);
  if (!entry) throw new Error('Time entry not found');
  
  entry.clockOut = new Date(clockOutData.clockOut);
  if (clockOutData.totalHours) entry.totalHours = clockOutData.totalHours;
  if (clockOutData.overtimeHours) entry.overtimeHours = clockOutData.overtimeHours;
  
  return entry.save();
};

// Get all time entries of an employee (for HR/Manager)
export const getEmployeeTimeEntries = (employeeId: string) => {
  return TimeEntry.find({ employeeId: new mongoose.Types.ObjectId(employeeId) })
    .populate('employeeId')
    .sort({ clockIn: -1 });
};

// Get all employees’ entries (for HR/Manager)
export const getAllTimeEntries = () => {
  return TimeEntry.find()
    .populate('employeeId')
    .sort({ clockIn: -1 });
};

 // Get all time entries of an employee for a particular day (for HR/Manager)
export const getEmployeeTimeEntriesForDay = (employeeId: string, start: Date, end: Date) => {
return TimeEntry.find({
  employeeId: new mongoose.Types.ObjectId(employeeId),
  clockIn: { $gte: start, $lte: end }
})
  .populate('employeeId')
  .sort({ clockIn: -1 });
};