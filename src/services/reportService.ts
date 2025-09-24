// src/services/reportService.ts
export const API_BASE_URL = 'http://localhost:5000/workDay';

export interface TimeEntry {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  overtimeHours?: number;
}

export interface Goal {
  _id: string;
  employeeId: string;
  title: string;
  progress: number;
  status: string;
  modules: Array<{
    name: string;
    status: string;
  }>;
}

export interface LeaveRequest {
  _id: string;
  employeeId: string;
  reason: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export const reportService = {
  async fetchTimeEntries(): Promise<TimeEntry[]> {
    const response = await fetch(`${API_BASE_URL}/timeEntries/all`);
    if (!response.ok) {
      throw new Error('Failed to fetch time entries');
    }
    return response.json();
  },

  async fetchLeaveRequests(): Promise<LeaveRequest[]> {
    const response = await fetch(`${API_BASE_URL}/leaves`);
    if (!response.ok) {
      throw new Error('Failed to fetch leave requests');
    }
    return response.json();
  },

  async fetchGoals(): Promise<Goal[]> {
    // Note: You might need to create an endpoint to get all goals
    // For now, we'll return an empty array as a placeholder
    try {
      const response = await fetch(`${API_BASE_URL}/goals/all`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Goals endpoint not available:', error);
      return [];
    }
  },

  async fetchEmployees(): Promise<Employee[]> {
    const response = await fetch(`${API_BASE_URL}/employees`);
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    return response.json();
  }
};