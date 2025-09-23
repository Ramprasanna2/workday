import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '../components/ui/breadcrumb';
import { UniversalBackButton } from '../components/UniversalBackButton';
import {
  Calendar,
  Clock,
  User,
  Save,
  Sun,
  Sunset,
  Moon,
  Settings2,
  Plus,
  Users,
  Edit2,
  Trash2,
  UserCheck,
  Copy,
  Zap
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from "../contexts/AuthContext";
import { cn } from '../components/ui/utils';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobInfo: {
    positionId: {
      title: string;
    };
    departmentId: {
      name: string;
    };
    managerId: string;
  };
  role: string;
}

interface ShiftGroup {
  _id: string;
  name: string;
  description?: string;
  employees: Employee[];
  managerId: string;
  createdAt: string;
}

interface Shift {
  _id?: string;
  id?: string;
  type: 'morning' | 'afternoon' | 'night' | 'custom';
  startTime: string;
  endTime: string;
  employeeId: string;
  date: string;
  customName?: string;
  breakTimeInMinutes?: number;
}

const shiftTypes = [
  { 
    type: 'morning', 
    name: 'Morning Shift', 
    startTime: '09:00', 
    endTime: '15:00', 
    color: 'bg-yellow-500 text-white', 
    icon: Sun,
    displayTime: '14:30 - 22:30 IST' // Pre-calculated IST for display
  },
  { 
    type: 'afternoon', 
    name: 'Afternoon Shift', 
    startTime: '16:00', 
    endTime: '21:00', 
    color: 'bg-blue-500 text-white', 
    icon: Sunset,
    displayTime: '18:30 - 02:30 IST'
  },
  { 
    type: 'night', 
    name: 'Night Shift', 
    startTime: '22:00', 
    endTime: '05:00', 
    color: 'bg-purple-500 text-white', 
    icon: Moon,
    displayTime: '02:30 - 10:30 IST'
  },
] as const;

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ShiftManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'groups' | 'schedule'>('groups');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shiftGroups, setShiftGroups] = useState<ShiftGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ShiftGroup | null>(null);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [weeklyShifts, setWeeklyShifts] = useState<{ [key: string]: Shift[] }>({});
  const [pendingShifts, setPendingShifts] = useState<Shift[]>([]);
  const [editingShift, setEditingShift] = useState<{ employeeId: string; date: string; shift?: Shift } | null>(null);

  // ADD THIS MISSING STATE
  const [pendingAssignments, setPendingAssignments] = useState<{ [key: string]: Shift[] }>({});

  // Group management states
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ShiftGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    selectedEmployees: [] as string[]
  });
  
  // Bulk assignment states
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [bulkAssignForm, setBulkAssignForm] = useState({
    shiftType: 'morning' as const,
    startTime: '09:00',
    endTime: '17:00',
    breakTimeInMinutes: 0,
    selectedDays: [] as number[],
    customName: ''
  });

  // Shift editing states
  const [editShiftForm, setEditShiftForm] = useState({
    type: 'morning' as const,
    startTime: '09:00',
    endTime: '17:00',
    breakTimeInMinutes: 0,
    customName: ''
  });

  // Drag and drop state
  const [draggedShift, setDraggedShift] = useState<{ type: string; startTime: string; endTime: string; name: string } | null>(null);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`http://localhost:5000/workDay/employees/${user?.employeeId}/team`);
        if (!res.ok) throw new Error('Failed to fetch employees');
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to fetch employees');
      }
    };
    if (user?.employeeId) fetchEmployees();
  }, [user?.employeeId]);

  // Fetch shift groups
  useEffect(() => {
    const fetchShiftGroups = async () => {
      try {
        const res = await fetch(`http://localhost:5000/workDay/shiftGroups/manager/${user?.employeeId}`);
        if (!res.ok) throw new Error('Failed to fetch shift groups');
        const data = await res.json();
        setShiftGroups(data);
      } catch (error) {
        console.error('Error fetching shift groups:', error);
        toast.error('Failed to fetch shift groups');
      }
    };
    if (user?.employeeId) fetchShiftGroups();
  }, [user?.employeeId]);

  // Fetch shifts for selected group and week
  useEffect(() => {
    const fetchGroupShifts = async () => {
      if (!selectedGroup) return;
      
      const weekDates = getWeekDates(currentWeek);
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];
      
      const shiftsData: { [key: string]: Shift[] } = {};
      
      for (const employee of selectedGroup.employees) {
        try {
          const res = await fetch(`http://localhost:5000/workDay/shifts/employee/${employee._id}`);
          if (res.ok) {
            const employeeShifts = await res.json();
            // Filter shifts for current week
            const weekShifts = employeeShifts.filter((shift: any) => {
              const shiftDate = new Date(shift.date).toISOString().split('T')[0];
              return shiftDate >= startDate && shiftDate <= endDate;
            });
            shiftsData[employee._id] = weekShifts;
          }
        } catch (error) {
          console.error(`Error fetching shifts for employee ${employee._id}:`, error);
        }
      }
      
      setWeeklyShifts(shiftsData);
    };

    fetchGroupShifts();
  }, [selectedGroup, currentWeek]);

 

  // Helper functions - add these after your state declarations
  const convertToIST = (timeString: string): string => {
    if (!timeString || typeof timeString !== 'string') return '';
    
    try {
      // Handle both "HH:MM" and full datetime strings
      let timeToConvert = timeString;
      
      // If it's a full datetime string, extract just the time part
      if (timeString.includes('T') || timeString.length > 8) {
        const dateObj = new Date(timeString);
        if (!isNaN(dateObj.getTime())) {
          timeToConvert = dateObj.toTimeString().slice(0, 5);
        }
      }
      
      // Parse time string
      const timeMatch = timeToConvert.match(/(\d{1,2}):(\d{2})/);
      if (!timeMatch) return timeString; // Return original if can't parse
      
      const [, hourStr, minuteStr] = timeMatch;
      let hours = parseInt(hourStr, 10);
      let minutes = parseInt(minuteStr, 10);
      
      // Add 5 hours 30 minutes for IST
      
      
      // Handle minute overflow
      if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
      }
      
      // Handle hour overflow (24-hour format)
      hours = hours % 24;
      
      // Format with leading zeros
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error converting time to IST:', error);
      return timeString; // Return original on error
    }
  };

  const formatTimeToIST = (timeString: string): string => {
    if (!timeString) return '';
    
    // Parse the time string (assuming it's in HH:MM format)
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Create a date object for today with the given time
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    // Add 5 hours and 30 minutes for IST conversion
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);
    
    // Format back to HH:MM
    return date.toTimeString().slice(0, 5);
  };

  const getShiftForEmployeeAndDate = (employeeId: string, date: Date): Shift | undefined => {
    const dateString = date.toISOString().split('T')[0];
    const employeeShifts = weeklyShifts[employeeId] || [];
    return employeeShifts.find(shift => 
      new Date(shift.date).toISOString().split('T')[0] === dateString
    );
  };

  const getShiftTypeInfo = (shift: Shift) => {
    const shiftType = shiftTypes.find(st => 
      st.startTime === shift.startTime && st.endTime === shift.endTime
    );
    return shiftType || {
      name: shift.customName || 'Custom Shift',
      color: 'bg-green-500 text-white',
      icon: Settings2
    };
  };

  

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`http://localhost:5000/workDay/employees/${user?.employeeId}/team`);
        if (!res.ok) throw new Error('Failed to fetch employees');
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to fetch employees');
      }
    };
    if (user?.employeeId) fetchEmployees();
  }, [user?.employeeId]);

  // Fetch shift groups
  useEffect(() => {
    const fetchShiftGroups = async () => {
      try {
        const res = await fetch(`http://localhost:5000/workDay/shiftGroups/manager/${user?.employeeId}`);
        if (!res.ok) throw new Error('Failed to fetch shift groups');
        const data = await res.json();
        setShiftGroups(data);
      } catch (error) {
        console.error('Error fetching shift groups:', error);
        toast.error('Failed to fetch shift groups');
      }
    };
    if (user?.employeeId) fetchShiftGroups();
  }, [user?.employeeId]);

  // Fetch shifts for selected group and week
  useEffect(() => {
    const fetchGroupShifts = async () => {
      if (!selectedGroup) return;
      
      const weekDates = getWeekDates(currentWeek);
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];
      
      const shiftsData: { [key: string]: Shift[] } = {};
      
      for (const employee of selectedGroup.employees) {
        try {
          const res = await fetch(`http://localhost:5000/workDay/shifts/employee/${employee._id}`);
          if (res.ok) {
            const employeeShifts = await res.json();
            // Filter shifts for current week
            const weekShifts = employeeShifts.filter((shift: any) => {
              const shiftDate = new Date(shift.date).toISOString().split('T')[0];
              return shiftDate >= startDate && shiftDate <= endDate;
            });
            shiftsData[employee._id] = weekShifts;
          }
        } catch (error) {
          console.error(`Error fetching shifts for employee ${employee._id}:`, error);
        }
      }
      
      setWeeklyShifts(shiftsData);
    };

    fetchGroupShifts();
  }, [selectedGroup, currentWeek]);

  const getWeekDates = (date: Date): Date[] => {
    const week: Date[] = [];
    const startOfWeek = new Date(date);
    
    // Get the Sunday of this week (day 0)
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    // Reset time to midnight to avoid timezone issues
    startOfWeek.setHours(0, 0, 0, 0);
    
    console.log('Week start date:', startOfWeek.toISOString()); // Debug log
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      week.push(dayDate);
      console.log(`Day ${i} (${weekDays[i]}):`, dayDate.toISOString().split('T')[0]); // Debug log
    }
    
    return week;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  // Group management functions
  const handleCreateGroup = () => {
    setEditingGroup(null);
    setGroupForm({ name: '', description: '', selectedEmployees: [] });
    setIsGroupDialogOpen(true);
  };

  const handleEditGroup = (group: ShiftGroup) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description || '',
      selectedEmployees: group.employees.map(emp => emp._id)
    });
    setIsGroupDialogOpen(true);
  };

  const handleSaveGroup = async () => {
    if (!groupForm.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (groupForm.selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    try {
      const payload = {
        name: groupForm.name.trim(),
        description: groupForm.description.trim(),
        employees: groupForm.selectedEmployees,
        managerId: user?.employeeId
      };

      let res;
      if (editingGroup) {
        res = await fetch(`http://localhost:5000/workDay/shiftGroups/${editingGroup._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('http://localhost:5000/workDay/shiftGroups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save group');
      }

      toast.success(editingGroup ? 'Group updated successfully' : 'Group created successfully');
      setIsGroupDialogOpen(false);
      
      // Refresh groups
      const groupsRes = await fetch(`http://localhost:5000/workDay/shiftGroups/manager/${user?.employeeId}`);
      const groupsData = await groupsRes.json();
      setShiftGroups(groupsData);
      
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      const res = await fetch(`http://localhost:5000/workDay/shiftGroups/${groupId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete group');

      toast.success('Group deleted successfully');
      setShiftGroups(shiftGroups.filter(g => g._id !== groupId));
      if (selectedGroup?._id === groupId) {
        setSelectedGroup(null);
        setView('groups');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Bulk assignment functions
  const handleBulkAssign = () => {
    setBulkAssignForm({
      shiftType: 'morning',
      startTime: '09:00',
      endTime: '17:00',
      breakTimeInMinutes: 0,
      selectedDays: [1, 2, 3, 4, 5], // Default to weekdays
      customName: ''
    });
    setIsBulkAssignOpen(true);
  };

  const handleSaveBulkAssign = async () => {
    if (!selectedGroup || bulkAssignForm.selectedDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    const weekDates = getWeekDates(currentWeek);
    let successCount = 0;
    let errorCount = 0;

    for (const employee of selectedGroup.employees) {
      for (const dayIndex of bulkAssignForm.selectedDays) {
        const date = weekDates[dayIndex];
        const dateString = date.toISOString().split('T')[0];
        
        // Check if shift already exists
        const existingShifts = weeklyShifts[employee._id] || [];
        const hasShiftOnDate = existingShifts.some(shift => 
          new Date(shift.date).toISOString().split('T')[0] === dateString
        );

        if (!hasShiftOnDate) {
          const payload = {
            employeeId: employee._id,
            managerId: user?.employeeId,
            date: dateString,
            startTime: bulkAssignForm.startTime,
            endTime: bulkAssignForm.endTime,
            breakTimeInMinutes: bulkAssignForm.breakTimeInMinutes,
            isPublished: true
          };

          try {
            const res = await fetch('http://localhost:5000/workDay/shifts/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (res.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
          }
        }
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} shifts assigned successfully`);
      // Refresh shifts
      const shiftsData: { [key: string]: Shift[] } = {};
      for (const employee of selectedGroup.employees) {
        const empRes = await fetch(`http://localhost:5000/workDay/shifts/employee/${employee._id}`);
        if (empRes.ok) {
          const employeeShifts = await empRes.json();
          const weekDates = getWeekDates(currentWeek);
          const startDate = weekDates[0].toISOString().split('T')[0];
          const endDate = weekDates[6].toISOString().split('T')[0];
          const weekShifts = employeeShifts.filter((shift: any) => {
            const shiftDate = new Date(shift.date).toISOString().split('T')[0];
            return shiftDate >= startDate && shiftDate <= endDate;
          });
          shiftsData[employee._id] = weekShifts;
        }
      }
      setWeeklyShifts(shiftsData);
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} shifts failed to assign`);
    }

    setIsBulkAssignOpen(false);
  };

  // Shift management functions
  const handleEditShift = (employeeId: string, date: string, existingShift?: Shift) => {
    setEditingShift({ employeeId, date, shift: existingShift });
    
    if (existingShift) {
      const shiftType = shiftTypes.find(st => st.startTime === existingShift.startTime && st.endTime === existingShift.endTime);
      setEditShiftForm({
        type: shiftType?.type || 'custom',
        startTime: existingShift.startTime,
        endTime: existingShift.endTime,
        breakTimeInMinutes: existingShift.breakTimeInMinutes || 0,
        customName: existingShift.customName || ''
      });
    } else {
      setEditShiftForm({
        type: 'morning',
        startTime: '09:00',
        endTime: '17:00',
        breakTimeInMinutes: 0,
        customName: ''
      });
    }
  };

  const handleSaveShift = async () => {
    if (!editingShift) return;

    try {
      // Ensure startTime and endTime are on the same date as 'date' (decremented by 5.5 hours)
      // Also increment the date by 1 day as requested
      const baseDate = new Date(editingShift.date);
      baseDate.setDate(baseDate.getDate() + 1);

      // Parse the start and end times
      const [startHour, startMinute] = editShiftForm.startTime.split(':').map(Number);
      const [endHour, endMinute] = editShiftForm.endTime.split(':').map(Number);

      // Create start and end Date objects in local time
      const startDateTime = new Date(baseDate);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      // Subtract 5 hours 30 minutes
      startDateTime.setMinutes(startDateTime.getMinutes());

      const endDateTime = new Date(baseDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      endDateTime.setMinutes(endDateTime.getMinutes() );

      const dateString = baseDate.toISOString().split('T')[0];
      const startTime = startDateTime.toISOString();
      const endTime = endDateTime.toISOString();

      const payload = {
        employeeId: editingShift.employeeId,
        managerId: user?.employeeId,
        date: dateString,
        startTime,
        endTime,
        breakTimeInMinutes: editShiftForm.breakTimeInMinutes,
        isPublished: true
      };

      let res;
      if (editingShift.shift?._id) {
        // Update existing shift
        res = await fetch(`http://localhost:5000/workDay/shifts/update/${editingShift.shift._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new shift
        res = await fetch('http://localhost:5000/workDay/shifts/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save shift');
      }

      toast.success('Shift saved successfully');
      setEditingShift(null);
      
      // Refresh shifts for the selected group
      if (selectedGroup) {
        const weekDates = getWeekDates(currentWeek);
        const startDate = weekDates[0].toISOString().split('T')[0];
        const endDate = weekDates[6].toISOString().split('T')[0];
        
        const shiftsData: { [key: string]: Shift[] } = {};
        
        for (const employee of selectedGroup.employees) {
          const empRes = await fetch(`http://localhost:5000/workDay/shifts/employee/${employee._id}`);
          if (empRes.ok) {
            const employeeShifts = await empRes.json();
            const weekShifts = employeeShifts.filter((shift: any) => {
              const shiftDate = new Date(shift.date).toISOString().split('T')[0];
              return shiftDate >= startDate && shiftDate <= endDate;
            });
            shiftsData[employee._id] = weekShifts;
          }
        }
        
        setWeeklyShifts(shiftsData);
      }
      
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Drag and drop functions
  const handleDragStart = (shiftType: any, e: React.DragEvent) => {
    setDraggedShift({
      type: shiftType.type,
      startTime: shiftType.startTime,
      endTime: shiftType.endTime,
      name: shiftType.name
    });
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (employeeId: string, dateString: string, e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedShift) return;

    console.log('Dropping shift for date:', dateString); // Debug log

    // Check if shift already exists
    const existingShifts = weeklyShifts[employeeId] || [];
    const existingPending = pendingAssignments[employeeId] || [];
    
    const hasShiftOnDate = existingShifts.some(shift => 
      new Date(shift.date).toISOString().split('T')[0] === dateString
    );
    
    const hasPendingOnDate = existingPending.some(shift => 
      new Date(shift.date).toISOString().split('T')[0] === dateString
    );

    if (hasShiftOnDate || hasPendingOnDate) {
      toast.error('Shift already exists or is pending for this date');
      setDraggedShift(null);
      return;
    }

    // Create pending assignment with the EXACT date passed
    const pendingShift: Shift = {
      employeeId: employeeId,
      date: dateString, // Use the exact dateString passed to this function
      startTime: draggedShift.startTime,
      endTime: draggedShift.endTime,
      type: draggedShift.type as any,
      breakTimeInMinutes: 0
    };

    console.log('Creating pending shift:', pendingShift); // Debug log

    setPendingAssignments(prev => ({
      ...prev,
      [employeeId]: [...(prev[employeeId] || []), pendingShift]
    }));

    toast.success(`${draggedShift.name} added to pending assignments for ${new Date(dateString).toLocaleDateString()}`);
    setDraggedShift(null);
  };

  // Add function to publish all pending assignments
  const handlePublishSchedule = async () => {
    if (Object.keys(pendingAssignments).length === 0) {
      toast.error('No pending assignments to publish');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const [employeeId, shifts] of Object.entries(pendingAssignments)) {
      for (const shift of shifts) {
        const payload = {
          employeeId: shift.employeeId,
          managerId: user?.employeeId,
          date: new Date(new Date(shift.date).setDate(new Date(shift.date).getDate() + 1))
,
          startTime: shift.startTime,
          endTime: shift.endTime,
          breakTimeInMinutes: shift.breakTimeInMinutes || 0,
          isPublished: true
        };

        try {
          const res = await fetch('http://localhost:5000/workDay/shifts/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} shifts published successfully`);
      
      // Clear pending assignments
      setPendingAssignments({});
      
      // Refresh shifts display
      if (selectedGroup) {
        const weekDates = getWeekDates(currentWeek);
        const startDate = weekDates[0].toISOString().split('T')[0];
        const endDate = weekDates[6].toISOString().split('T')[0];
        
        const shiftsData: { [key: string]: Shift[] } = {};
        
        for (const employee of selectedGroup.employees) {
          const empRes = await fetch(`http://localhost:5000/workDay/shifts/employee/${employee._id}`);
          if (empRes.ok) {
            const employeeShifts = await empRes.json();
            const weekShifts = employeeShifts.filter((shift: any) => {
              const shiftDate = new Date(shift.date).toISOString().split('T')[0];
              return shiftDate >= startDate && shiftDate <= endDate;
            });
            shiftsData[employee._id] = weekShifts;
          }
        }
        
        setWeeklyShifts(shiftsData);
      }
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} shifts failed to publish`);
    }
  };


  // Clear pending assignments function
  const handleClearPending = () => {
    setPendingAssignments({});
    toast.success('Pending assignments cleared');
  };

  // Update the shift cell rendering to show pending assignments
  const getShiftOrPendingForEmployeeAndDate = (employeeId: string, date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    // Check for published shift first
    const publishedShift = getShiftForEmployeeAndDate(employeeId, date);
    if (publishedShift) return { type: 'published', shift: publishedShift };
    
    // Check for pending assignment
    const pendingShifts = pendingAssignments[employeeId] || [];
    const pendingShift = pendingShifts.find(shift => 
      new Date(shift.date).toISOString().split('T')[0] === dateString
    );
    
    if (pendingShift) return { type: 'pending', shift: pendingShift };
    
    return null;
  };
   //delleting shift
    const handleDeleteShift = async (shift: Shift) => {
    if (!shift._id) return;
    try {
      console.log(shift)
      const res = await fetch(`http://localhost:5000/workDay/shifts/deleting/${shift._id}`, { method: 'POST' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete shift');
      }
      toast.success('Shift deleted');
      // Refresh shifts for the selected group
      if (selectedGroup) {
        const weekDates = getWeekDates(currentWeek);
        const startDate = weekDates[0].toISOString().split('T')[0];
        const endDate = weekDates[6].toISOString().split('T')[0];
        const shiftsData: { [key: string]: Shift[] } = {};
        for (const employee of selectedGroup.employees) {
          const empRes = await fetch(`http://localhost:5000/workDay/shifts/employee/${employee._id}`);
          if (empRes.ok) {
            const employeeShifts = await empRes.json();
            const weekShifts = employeeShifts.filter((shift: any) => {
              const shiftDate = new Date(shift.date).toISOString().split('T')[0];
              return shiftDate >= startDate && shiftDate <= endDate;
            });
            shiftsData[employee._id] = weekShifts;
          }
        }
        setWeeklyShifts(shiftsData);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (view === 'groups') {
    return (
      <div className="space-y-6">
        <UniversalBackButton />
        
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shift Management</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Manager Portal</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Shift Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Shift Groups</span>
                </CardTitle>
                <Button onClick={handleCreateGroup}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {shiftGroups.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No shift groups created yet</p>
                  <p className="text-sm text-gray-400 mt-2">Create a group to start managing shifts for your team</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shiftGroups.map((group) => (
                    <Card key={group._id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGroup(group)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGroup(group._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {group.description && (
                          <p className="text-sm text-gray-600">{group.description}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Members</span>
                            <Badge variant="secondary">{group.employees.length}</Badge>
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {group.employees.map((employee) => (
                              <div key={employee._id} className="flex items-center justify-between text-sm">
                                <span>{employee.firstName} {employee.lastName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {employee.jobInfo?.departmentId?.name}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedGroup(group);
                              setView('schedule');
                            }}
                            className="w-full mt-3"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Manage Schedule
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Group Create/Edit Dialog */}
        <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? 'Edit Shift Group' : 'Create New Shift Group'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="group-name">Group Name *</Label>
                  <Input
                    id="group-name"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    placeholder="e.g., Morning Team, Night Crew"
                  />
                </div>
                <div>
                  <Label htmlFor="group-description">Description</Label>
                  <Textarea
                    id="group-description"
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    placeholder="Optional description for this group"
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label>Select Employees *</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                  {employees.map((employee) => (
                    <div key={employee._id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`emp-${employee._id}`}
                        checked={groupForm.selectedEmployees.includes(employee._id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setGroupForm({
                              ...groupForm,
                              selectedEmployees: [...groupForm.selectedEmployees, employee._id]
                            });
                          } else {
                            setGroupForm({
                              ...groupForm,
                              selectedEmployees: groupForm.selectedEmployees.filter(id => id !== employee._id)
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor={`emp-${employee._id}`}
                        className="flex-1 flex items-center justify-between cursor-pointer"
                      >
                        <span>{employee.firstName} {employee.lastName}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {employee.jobInfo?.departmentId?.name}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {employee.jobInfo?.positionId?.title}
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Selected: {groupForm.selectedEmployees.length} employees
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveGroup}>
                  {editingGroup ? 'Update Group' : 'Create Group'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Schedule View with PROPER COLUMN LAYOUT
  return (
    <div className="space-y-6">
      <UniversalBackButton />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Schedule - {selectedGroup?.name}
            </h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Manager Portal</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => setView('groups')} className="cursor-pointer">
                    Shift Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{selectedGroup?.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center space-x-2">
            {/* Add Publish button to main header */}
            {Object.keys(pendingAssignments).length > 0 && (
              <Button 
                onClick={handlePublishSchedule}
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                Publish Schedule ({Object.values(pendingAssignments).flat().length})
              </Button>
            )}
            <Button onClick={handleBulkAssign}>
              <Zap className="h-4 w-4 mr-2" />
              Bulk Assign
            </Button>
            <Button variant="outline" onClick={() => setView('groups')}>
              <Users className="h-4 w-4 mr-2" />
              Back to Groups
            </Button>
          </div>
        </div>

        {/* Draggable Shift Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Shift Types - Drag & Drop to Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shiftTypes.map((shiftType) => {
                const IconComponent = shiftType.icon;
                return (
                  <Card
                    key={shiftType.type}
                    className={cn(
                      "cursor-grab hover:shadow-md transition-shadow border-2 border-dashed",
                      shiftType.color
                    )}
                    draggable
                    onDragStart={(e) => handleDragStart(shiftType, e)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-white bg-opacity-20">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{shiftType.name}</h4>
                          <p className="text-sm opacity-90">
                            {convertToIST(shiftType.startTime)} - {convertToIST(shiftType.endTime)} IST
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              💡 Drag any shift type to an employee's day slot to assign it
            </p>
          </CardContent>
        </Card>

        {/* PROPER COLUMN-BASED Weekly Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Weekly Schedule</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                  Previous Week
                </Button>
                <span className="text-sm text-gray-600 px-4">
                  {getWeekDates(currentWeek)[0].toLocaleDateString()} - {getWeekDates(currentWeek)[6].toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                  Next Week
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0"> {/* Remove default padding */}
            {!selectedGroup ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No group selected</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                {/* FULL-WIDTH COLUMN LAYOUT */}
                <div className="flex min-w-full">
                  {/* Employee Names Column - Fixed width */}
                  <div className="flex flex-col w-48 flex-shrink-0 p-4">
                    <div className="h-16 flex items-center justify-center font-medium bg-gray-100 rounded-lg mb-2">
                      Employee
                    </div>
                    {selectedGroup.employees.map((employee) => (
                      <div
                        key={employee._id}
                        className="h-20 p-3 mb-2 bg-gray-50 rounded-lg flex flex-col justify-center"
                      >
                        <div className="font-medium text-sm">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {employee.jobInfo?.positionId?.title}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Days Columns - Flex to fill remaining space */}
                  <div className="flex flex-1">
                    {weekDays.map((day, dayIndex) => {
                      const date = getWeekDates(currentWeek)[dayIndex];
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      return (
                        <div key={day} className="flex flex-col flex-1 px-2">
                          {/* Day Header */}
                          <div
                            className={cn(
                              "h-16 p-2 mb-2 rounded-lg flex flex-col items-center justify-center text-center",
                              isToday 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-gray-100"
                            )}
                          >
                            <div className="font-medium text-sm">{day}</div>
                            <div className="text-xs opacity-75">
                              {date.getDate()}/{date.getMonth() + 1}
                            </div>
                          </div>

                          {/* Employee Shift Cells for this day */}
                          {selectedGroup.employees.map((employee) => {
                            const shiftData = getShiftOrPendingForEmployeeAndDate(employee._id, date);
                            // IMPORTANT: Use the date from the current loop iteration, not a calculated one
                            const dateString = date.toISOString().split('T')[0];
                            
                            console.log(`Rendering cell for ${employee.firstName} on ${day} (${dateString})`); // Debug log
                            
                            return (
                              <div
                                key={`${employee._id}-${dayIndex}`}
                                className={cn(
                                  "h-20 mb-2 border-2 border-dashed rounded-lg p-1 cursor-pointer transition-colors flex flex-col justify-center",
                                  shiftData?.type === 'pending' 
                                    ? "border-orange-300 bg-orange-50" 
                                    : "border-gray-200 hover:border-gray-400"
                                )}
                                onClick={() => handleEditShift(employee._id, dateString, shiftData?.shift)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => {
                                  console.log(`Dropping on ${day} for ${employee.firstName}, date: ${dateString}`); // Debug log
                                  handleDrop(employee._id, dateString, e);
                                }}
                              >
                                {shiftData ? (
                                  <div className={cn(
                                    "relative text-xs p-1 rounded text-center h-full flex flex-col justify-center",
                                    shiftData.type === 'pending' 
                                      ? "bg-orange-200 text-orange-800" 
                                      : getShiftTypeInfo(shiftData.shift).color
                                  )}>
                                    {/* Show pending indicator */}
                                    {shiftData.type === 'pending' && (
                                      <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full"></div>
                                    )}

                                    <div className="font-medium text-xs leading-tight">
                                      {convertToIST(shiftData.shift.startTime)}
                                    </div>
                                    <div className="text-xs opacity-90 leading-tight">
                                      {convertToIST(shiftData.shift.endTime)}
                                    </div>
                                    {shiftData.type === 'pending' && (
                                      <div className="text-xs opacity-75">PENDING</div>
                                    )}

                                    {/* Edit & Delete buttons for published shifts */}
                                    {shiftData.type === 'published' && (
                                      <div className="absolute top-1 right-1 flex space-x-1">
                                        <button
                                          className="p-1 rounded hover:bg-white/30"
                                          title="Edit Shift"
                                          onClick={e => {
                                            e.stopPropagation();
                                            handleEditShift(employee._id, dateString, shiftData.shift);
                                          }}
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          className="p-1 rounded hover:bg-white/30"
                                          title="Delete Shift"
                                          onClick={async e => {
                                            e.stopPropagation();
                                            if (window.confirm('Delete this shift?')) {
                                              await handleDeleteShift(shiftData.shift);
                                            }
                                          }}
                                        >
                                          <Trash2 className="w-3 h-3 text-red-600" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-full text-gray-400 hover:text-gray-600">
                                    <Plus className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bulk Assign Dialog */}
      <Dialog open={isBulkAssignOpen} onOpenChange={setIsBulkAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Assign Shifts to Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Shift Type</Label>
              <Select
                value={bulkAssignForm.shiftType}
                onValueChange={(value: any) => {
                  const selectedShiftType = shiftTypes.find(st => st.type === value);
                  if (selectedShiftType) {
                    setBulkAssignForm({
                      ...bulkAssignForm,
                      shiftType: value,
                      startTime: selectedShiftType.startTime,
                      endTime: selectedShiftType.endTime
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shiftTypes.map((type) => (
                    <SelectItem key={type.type} value={type.type}>
                      {type.name} ({type.startTime} - {type.endTime})
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulk-start-time">Start Time</Label>
                <Input
                  id="bulk-start-time"
                  type="time"
                  value={bulkAssignForm.startTime}
                  onChange={(e) => setBulkAssignForm({ ...bulkAssignForm, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bulk-end-time">End Time</Label>
                <Input
                  id="bulk-end-time"
                  type="time"
                  value={bulkAssignForm.endTime}
                  onChange={(e) => setBulkAssignForm({ ...bulkAssignForm, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Select Days</Label>
              <div className="flex flex-wrap gap-2 p-4 border rounded-lg">
                {weekDays.map((day, index) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${index}`}
                      checked={bulkAssignForm.selectedDays.includes(index)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBulkAssignForm({
                            ...bulkAssignForm,
                            selectedDays: [...bulkAssignForm.selectedDays, index]
                          });
                        } else {
                          setBulkAssignForm({
                            ...bulkAssignForm,
                            selectedDays: bulkAssignForm.selectedDays.filter(d => d !== index)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`day-${index}`} className="text-sm cursor-pointer">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {bulkAssignForm.selectedDays.length} days
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsBulkAssignOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBulkAssign}>
                <Zap className="h-4 w-4 mr-2" />
                Assign to All Members
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shift Edit Dialog */}
      <Dialog open={!!editingShift} onOpenChange={() => setEditingShift(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingShift?.shift ? 'Edit Shift' : 'Add Shift'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Shift Type</Label>
              <Select
                value={editShiftForm.type}
                onValueChange={(value: any) => {
                  const selectedShiftType = shiftTypes.find(st => st.type === value);
                  if (selectedShiftType) {
                    setEditShiftForm({
                      ...editShiftForm,
                      type: value,
                      startTime: selectedShiftType.startTime,
                      endTime: selectedShiftType.endTime
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shiftTypes.map((type) => (
                    <SelectItem key={type.type} value={type.type}>
                      {type.name} ({type.startTime} - {type.endTime})
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={editShiftForm.startTime}
                  onChange={(e) => setEditShiftForm({ ...editShiftForm, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={editShiftForm.endTime}
                  onChange={(e) => setEditShiftForm({ ...editShiftForm, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="break-time">Break Time (minutes)</Label>
              <Input
                id="break-time"
                type="number"
                value={editShiftForm.breakTimeInMinutes}
                onChange={(e) => setEditShiftForm({ ...editShiftForm, breakTimeInMinutes: parseInt(e.target.value) || 0 })}
                min="0"
                placeholder="0"
              />
            </div>

            {editShiftForm.type === 'custom' && (
              <div>
                <Label htmlFor="custom-name">Custom Shift Name</Label>
                <Input
                  id="custom-name"
                  value={editShiftForm.customName}
                  onChange={(e) => setEditShiftForm({ ...editShiftForm, customName: e.target.value })}
                  placeholder="e.g., Weekend Shift"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setEditingShift(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveShift}>
                <Save className="h-4 w-4 mr-2" />
                Save Shift
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Publish Controls Section */}
      {Object.keys(pendingAssignments).length > 0 && (
        <Card className="mt-4 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <Clock className="h-5 w-5" />
                <span>Pending Schedule Assignments</span>
                <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                  {Object.values(pendingAssignments).flat().length} shifts
                </Badge>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearPending}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Clear Pending
                </Button>
                <Button 
                  size="sm" 
                  onClick={handlePublishSchedule}
                  variant="outline"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Publish Schedule
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(pendingAssignments).map(([employeeId, shifts]) => {
                const employee = selectedGroup?.employees.find(emp => emp._id === employeeId);
                return (
                  <div key={employeeId} className="p-3 bg-white rounded-lg border border-orange-200">
                    <div className="font-medium text-sm text-orange-800 mb-2">
                      {employee?.firstName} {employee?.lastName}
                    </div>
                    <div className="space-y-1">
                      {shifts.map((shift, index) => (
                        <div key={index} className="text-xs text-orange-700">
                          {new Date(shift.date).toLocaleDateString()} - {convertToIST(shift.startTime)} to {convertToIST(shift.endTime)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-orange-600 mt-4">
              💡 These shifts are pending. Click "Publish Schedule" to assign them to employees.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};