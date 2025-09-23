import mongoose from 'mongoose';
import { ShiftGroup } from '../model/model';

// Create a new shift group
export const createShiftGroup = async (data: {
  name: string;
  managerId: string;
  employees: string[];
  description?: string;
}) => {
  try {
    const shiftGroup = new ShiftGroup({
      name: data.name,
      managerId: new mongoose.Types.ObjectId(data.managerId),
      employees: data.employees.map(id => new mongoose.Types.ObjectId(id)),
      description: data.description
    });

    return await shiftGroup.save();
  } catch (error: any) {
    console.error('Error creating shift group:', error);
    throw error;
  }
};

// Get all shift groups for a manager
export const getShiftGroupsByManager = async (managerId: string) => {
  try {
    return await ShiftGroup.find({
      managerId: new mongoose.Types.ObjectId(managerId),
      isActive: true
    })
    .populate('employees', 'firstName lastName email jobInfo.positionId jobInfo.departmentId')
    .populate({
      path: 'employees',
      populate: [
        { path: 'jobInfo.positionId', model: 'Position', select: 'title' },
        { path: 'jobInfo.departmentId', model: 'Department', select: 'name' }
      ]
    })
    .sort({ createdAt: -1 });
  } catch (error: any) {
    console.error('Error getting shift groups:', error);
    throw error;
  }
};

// Update a shift group
export const updateShiftGroup = async (groupId: string, data: {
  name?: string;
  employees?: string[];
  description?: string;
}) => {
  try {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.employees) updateData.employees = data.employees.map(id => new mongoose.Types.ObjectId(id));
    if (data.description !== undefined) updateData.description = data.description;

    return await ShiftGroup.findByIdAndUpdate(
      groupId,
      updateData,
      { new: true }
    ).populate('employees', 'firstName lastName email');
  } catch (error: any) {
    console.error('Error updating shift group:', error);
    throw error;
  }
};

// Delete a shift group (soft delete)
export const deleteShiftGroup = async (groupId: string) => {
  try {
    return await ShiftGroup.findByIdAndUpdate(
      groupId,
      { isActive: false },
      { new: true }
    );
  } catch (error: any) {
    console.error('Error deleting shift group:', error);
    throw error;
  }
};

// Get shift group by ID
export const getShiftGroupById = async (groupId: string) => {
  try {
    return await ShiftGroup.findById(groupId)
      .populate('employees', 'firstName lastName email jobInfo.positionId jobInfo.departmentId')
      .populate({
        path: 'employees',
        populate: [
          { path: 'jobInfo.positionId', model: 'Position', select: 'title' },
          { path: 'jobInfo.departmentId', model: 'Department', select: 'name' }
        ]
      });
  } catch (error: any) {
    console.error('Error getting shift group by ID:', error);
    throw error;
  }
};