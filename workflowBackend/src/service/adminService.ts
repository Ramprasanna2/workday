import { Department, Position, Employee } from '../model/model';
import mongoose from 'mongoose';

// Department Services
export const createDepartment = async (data: { name: string }) => {
  try {
    const existingDepartment = await Department.findOne({ name: data.name });
    if (existingDepartment) {
      throw new Error('Department with this name already exists');
    }

    const department = new Department({
      ...data,
      employeeCount: 0
    });
    return await department.save();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create department');
  }
};

export const getAllDepartments = async () => {
  try {
    return await Department.find().sort({ name: 1 });
  } catch (error: any) {
    throw new Error('Failed to fetch departments');
  }
};

export const deleteDepartment = async (id: string) => {
  try {
    const department = await Department.findById(id);
    if (!department) {
      throw new Error('Department not found');
    }

    // Check if there are employees linked to this department
    if (department.employeeCount > 0) {
      throw new Error(`Cannot delete department. There are ${department.employeeCount} employees linked to it.`);
    }

    // Check if there are positions linked to this department
    const positionsCount = await Position.countDocuments({ departmentId: id });
    if (positionsCount > 0) {
      throw new Error('Cannot delete department. There are positions linked to it.');
    }

    return await Department.findByIdAndDelete(id);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete department');
  }
};

// Position Services
export const createPosition = async (data: {
  title: string;
  departmentId: string;
  role: string;
  description?: string;
}) => {
  try {
    const existingPosition = await Position.findOne({ 
      title: data.title, 
      departmentId: data.departmentId 
    });
    if (existingPosition) {
      throw new Error('Position with this title already exists in this department');
    }

    const department = await Department.findById(data.departmentId);
    if (!department) {
      throw new Error('Department not found');
    }

    const position = new Position({
      ...data,
      employeeCount: 0
    });
    return await position.save();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create position');
  }
};

export const getAllPositions = async () => {
  try {
    // Don't populate departmentId - return as string for frontend filtering
    const positions = await Position.find().sort({ title: 1 });
    
    // Convert to plain objects with string departmentId
    return positions.map(position => ({
      _id: position._id.toString(),
      title: position.title,
      departmentId: position.departmentId.toString(), // Ensure it's a string
      role: position.role,
      description: position.description || '',
      employeeCount: position.employeeCount || 0,
      createdAt: position.createdAt,
      updatedAt: position.updatedAt
    }));
  } catch (error: any) {
    console.error('Error fetching positions:', error);
    throw new Error('Failed to fetch positions');
  }
};

export const deletePosition = async (id: string) => {
  try {
    const position = await Position.findById(id);
    if (!position) {
      throw new Error('Position not found');
    }

    // Check if there are employees linked to this position
    if (position.employeeCount > 0) {
      throw new Error(`Cannot delete position. There are ${position.employeeCount} employees linked to it.`);
    }

    return await Position.findByIdAndDelete(id);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete position');
  }
};

// Employee Services
export const getManagers = async () => {
  try {
    return await Employee.find({ 
      role: { $in: ['Manager', 'Admin'] } 
    }).select('firstName lastName email role');
  } catch (error: any) {
    throw new Error('Failed to fetch managers');
  }
};

// Utility function to recalculate all counts (in case of data inconsistency)
export const recalculateEmployeeCounts = async () => {
  try {
    // Recalculate department counts
    const departments = await Department.find();
    for (const dept of departments) {
      const count = await Employee.countDocuments({ 'jobInfo.departmentId': dept._id });
      await Department.findByIdAndUpdate(dept._id, { employeeCount: count });
    }

    // Recalculate position counts
    const positions = await Position.find();
    for (const pos of positions) {
      const count = await Employee.countDocuments({ 'jobInfo.positionId': pos._id });
      await Position.findByIdAndUpdate(pos._id, { employeeCount: count });
    }

    return { message: 'Employee counts recalculated successfully' };
  } catch (error: any) {
    throw new Error('Failed to recalculate employee counts');
  }
};