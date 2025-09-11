import { Employee, Department, Position } from '../model/model';
import bcrypt from 'bcrypt';
import mongoose from "mongoose";

// Updated function to accept an object instead of individual parameters
export async function createEmployee(employeeData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
 
  contactDetails: {
    phone: string;
    alternatePhone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    emergencyContact?:{
      name: string;
      relationship: string;
      phone: string;
      alternatePhone?: string;
    };
  };
  jobInfo: {
    positionId: string;
    departmentId: string;
    managerId?: string;
  };
  compensation: {
    wage: number;
    payPeriod: string;
  };
}) {
  try {
    // Validate department exists
    const department = await Department.findById(employeeData.jobInfo.departmentId);
    if (!department) {
      throw new Error('Department not found');
    }

    // Validate position exists
    const position = await Position.findById(employeeData.jobInfo.positionId);
    if (!position) {
      throw new Error('Position not found');
    }

    // Validate manager if provided
    if (employeeData.jobInfo.managerId) {
      if (!mongoose.Types.ObjectId.isValid(employeeData.jobInfo.managerId)) {
        throw new Error(`Invalid managerId format: ${employeeData.jobInfo.managerId}`);
      }
      const manager = await Employee.findById(employeeData.jobInfo.managerId);
      if (!manager) {
        throw new Error(`Manager with id "${employeeData.jobInfo.managerId}" not found.`);
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);

    // Create employee
    const employee = new Employee({
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      email: employeeData.email,
      password: hashedPassword,
      role: position.role,
      contactDetails: employeeData.contactDetails,
      jobInfo: {
        positionId: new mongoose.Types.ObjectId(employeeData.jobInfo.positionId),
        departmentId: new mongoose.Types.ObjectId(employeeData.jobInfo.departmentId),
        managerId: employeeData.jobInfo.managerId ? new mongoose.Types.ObjectId(employeeData.jobInfo.managerId) : undefined
      },
      compensation: employeeData.compensation
    });

    const savedEmployee = await employee.save();

    // Update department employee count
    await Department.findByIdAndUpdate(
      employeeData.jobInfo.departmentId,
      { $inc: { employeeCount: 1 } }
    );

    // Update position employee count
    await Position.findByIdAndUpdate(
      employeeData.jobInfo.positionId,
      { $inc: { employeeCount: 1 } }
    );

    console.log('Employee created:', employee.email);
    return savedEmployee;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
}

export const deleteEmployee = async (employeeId: string) => {
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Check if this employee is a manager of other employees
    const teamMembers = await Employee.find({ 'jobInfo.managerId': employeeId });
    
    if (teamMembers.length > 0) {
      // Prevent deletion if employee has team members
      throw new Error(`Cannot delete employee. This employee is managing ${teamMembers.length} team member(s). Please remove their manager assignment first or reassign them to another manager.`);
    }

    // Check if jobInfo exists and update department employee count
    if (employee.jobInfo && employee.jobInfo.departmentId) {
      await Department.findByIdAndUpdate(
        employee.jobInfo.departmentId,
        { $inc: { employeeCount: -1 } }
      );
    }

    // Check if jobInfo exists and update position employee count
    if (employee.jobInfo && employee.jobInfo.positionId) {
      await Position.findByIdAndUpdate(
        employee.jobInfo.positionId,
        { $inc: { employeeCount: -1 } }
      );
    }

    await Employee.findByIdAndDelete(employeeId);
    return { message: 'Employee deleted successfully' };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete employee');
  }
};

// Add function to get team members
export const getTeamMembers = async (managerId: string) => {
  try {
    return await Employee.find({ 'jobInfo.managerId': managerId })
      .populate('jobInfo.positionId', 'title')
      .populate('jobInfo.departmentId', 'name')
      .select('firstName lastName email role jobInfo');
  } catch (error: any) {
    throw new Error('Failed to fetch team members');
  }
};

// Add function to remove manager from employees
export const removeManagerFromEmployees = async (managerId: string) => {
  try {
    const result = await Employee.updateMany(
      { 'jobInfo.managerId': managerId },
      { $unset: { 'jobInfo.managerId': 1 } }
    );

    return {
      message: `Successfully removed manager from ${result.modifiedCount} employees`,
      modifiedCount: result.modifiedCount
    };
  } catch (error: any) {
    throw new Error('Failed to remove manager from employees');
  }
};

export const updateEmployee = async (employeeId: string, updateData: any) => {
  try {
    const currentEmployee = await Employee.findById(employeeId);
    if (!currentEmployee) {
      throw new Error('Employee not found');
    }

    // Check if jobInfo exists before accessing its properties
    if (!currentEmployee.jobInfo) {
      throw new Error('Employee job information is missing');
    }

    // If department changed, update counts
    if (updateData.jobInfo?.departmentId && 
        updateData.jobInfo.departmentId !== currentEmployee.jobInfo.departmentId?.toString()) {
      
      // Decrease count from old department
      if (currentEmployee.jobInfo.departmentId) {
        await Department.findByIdAndUpdate(
          currentEmployee.jobInfo.departmentId,
          { $inc: { employeeCount: -1 } }
        );
      }
      
      // Increase count for new department
      await Department.findByIdAndUpdate(
        updateData.jobInfo.departmentId,
        { $inc: { employeeCount: 1 } }
      );
    }

    // If position changed, update counts
    if (updateData.jobInfo?.positionId && 
        updateData.jobInfo.positionId !== currentEmployee.jobInfo.positionId?.toString()) {
      
      // Decrease count from old position
      if (currentEmployee.jobInfo.positionId) {
        await Position.findByIdAndUpdate(
          currentEmployee.jobInfo.positionId,
          { $inc: { employeeCount: -1 } }
        );
      }
      
      // Increase count for new position
      await Position.findByIdAndUpdate(
        updateData.jobInfo.positionId,
        { $inc: { employeeCount: 1 } }
      );
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true }
    );

    return updatedEmployee;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update employee');
  }
};

export const getAllEmployees = async () => {
  try {
    return await Employee.find()
      .populate('jobInfo.departmentId', 'name employeeCount')
      .populate('jobInfo.positionId', 'title employeeCount')
      .populate('jobInfo.managerId', 'firstName lastName')
      .select('-password')
      .sort({ createdAt: -1 });
  } catch (error: any) {
    throw new Error('Failed to fetch employees');
  }
};

export const getManagers = async () => {
  try {
    return await Employee.find({ 
      role: { $in: ['Manager', 'Admin'] } 
    }).select('firstName lastName email role');
  } catch (error: any) {
    throw new Error('Failed to fetch managers');
  }
};

// Add function to get employees with filters
export const getEmployeesWithFilters = async (filters: {
  departmentId?: string;
  positionId?: string;
  hasManager?: boolean;
}) => {
  try {
    let query: any = {};

    if (filters.departmentId) {
      query['jobInfo.departmentId'] = filters.departmentId;
    }

    if (filters.positionId) {
      query['jobInfo.positionId'] = filters.positionId;
    }

    if (filters.hasManager !== undefined) {
      if (filters.hasManager) {
        query['jobInfo.managerId'] = { $exists: true, $ne: null };
      } else {
        query['jobInfo.managerId'] = { $exists: false };
      }
    }

    return await Employee.find(query)
      .populate('jobInfo.departmentId', 'name employeeCount')
      .populate('jobInfo.positionId', 'title employeeCount')
      .populate('jobInfo.managerId', 'firstName lastName')
      .select('-password')
      .sort({ createdAt: -1 });
  } catch (error: any) {
    throw new Error('Failed to fetch filtered employees');
  }
};
