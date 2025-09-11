  // src/service/timeEntryService.ts
  import mongoose from 'mongoose';
  import { TimeEntry } from '../model/model';

  // Clock in
  export const clockIn = async (data: {
    employeeId: string;
    managerId: string;
  }) => {
    const entry = new TimeEntry({
      employeeId: new mongoose.Types.ObjectId(data.employeeId),
      clockIn: new Date(),
      managerId:new mongoose.Types.ObjectId(data.managerId),
      status: 'Pending'
    });
    return entry.save();
  };

  // Clock out
  export const clockOut = async (entryId: string,clockOutTime:Date) => {
    const entry = await TimeEntry.findById(entryId);
    if (!entry) throw new Error('Time entry not found');
    const totalHours = (clockOutTime.getTime() - entry.clockIn.getTime()) / (1000 * 60 * 60);
    const overtimeHours = totalHours > 8 ? totalHours - 8 : 0;
    entry.clockOut = clockOutTime;
    entry.totalHours = totalHours;
    entry.overtimeHours = overtimeHours;
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