import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
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
  Plus
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { useAuth } from "../contexts/AuthContext";

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

interface Shift {
  _id?: string;
  id?: string;
  type: 'morning' | 'afternoon' | 'night' | 'custom';
  startTime: string;
  endTime: string;
  employeeId: string;
  date: string;
  customName?: string;
}

const shiftTypes = [
  { type: 'morning', name: 'Morning Shift', startTime: '09:00', endTime: '17:00', color: 'bg-yellow-100 text-yellow-800', icon: Sun },
  { type: 'afternoon', name: 'Afternoon Shift', startTime: '13:00', endTime: '21:00', color: 'bg-blue-100 text-blue-800', icon: Sunset },
  { type: 'night', name: 'Night Shift', startTime: '21:00', endTime: '05:00', color: 'bg-purple-100 text-purple-800', icon: Moon },
] as const;

export const ShiftManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employeeShifts, setEmployeeShifts] = useState<Shift[]>([]);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [draggedShift, setDraggedShift] = useState<{ type: string; data: any } | null>(null);
  const [customShift, setCustomShift] = useState({ name: '', startTime: '', endTime: '' });
  const [isCustomShiftOpen, setIsCustomShiftOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('http://localhost:5000/workDay/employees/all');
        if (!res.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await res.json();
        const filteredEmployees = data.filter((employee: Employee) =>
          employee.jobInfo.managerId === user?.employeeId
        );
        setEmployees(filteredEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to fetch employees');
      }
    };
    fetchEmployees();
  }, [user?.employeeId]);

  useEffect(() => {
    const fetchEmployeeShifts = async () => {
      if (!selectedEmployee) return;
      try {
        const res = await fetch(`http://localhost:5000/workDay/shifts/employee/${selectedEmployee}`);
        if (!res.ok) {
          throw new Error('Failed to fetch employee shifts');
        }
        
        const data = await res.json();
        console.log('Fetched employee shifts:', data);
        setEmployeeShifts(data);
      } catch (error) {
        console.error('Error fetching employee shifts:', error);
        toast.error('Failed to fetch employee shifts');
      }
    };
    fetchEmployeeShifts();
  }, [selectedEmployee]);

  const getWeekDates = (date: Date): Date[] => {
    const week: Date[] = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates: Date[] = getWeekDates(currentWeek);
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const handleDragStart = (e: React.DragEvent, shiftType: any) => {
    setDraggedShift({ type: 'predefined', data: shiftType });
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (!draggedShift || !selectedEmployee) {
      toast.error('Please select an employee first');
      return;
    }
    const dateString = date.toISOString().split('T')[0];
    const existingShift = shifts.find(s =>
      s.employeeId === selectedEmployee &&
      s.date === dateString
    );
    if (existingShift) {
      toast.error('Shift already assigned for this date');
      return;
    }
    const newShift: Shift = {
      id: Date.now().toString(),
      type: draggedShift.data.type,
      startTime: draggedShift.data.startTime,
      endTime: draggedShift.data.endTime,
      employeeId: selectedEmployee,
      date: dateString,
      customName: draggedShift.data.customName
    };
    setShifts([...shifts, newShift]);
    setDraggedShift(null);
    toast.success('Shift assigned successfully');
  };

  const removeShift = (shiftId: string) => {
    setShifts(shifts.filter(s => s.id !== shiftId));
    toast.success('Shift removed');
  };

  const getShiftForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const localShifts = shifts.filter(s => s.employeeId === selectedEmployee && s.date === dateString);
    const fetchedShifts = employeeShifts.filter(s => s.date === dateString);
    return [...localShifts, ...fetchedShifts];
  };

  const getShiftColor = (type: string) => {
    const shiftType = shiftTypes.find(st => st.type === type);
    return shiftType ? shiftType.color : 'bg-gray-100 text-gray-800';
  };

  const saveShiftPlan = async () => {
    const newShifts = shifts.filter(s => !s._id); // Only local (unsaved) shifts
    if (newShifts.length === 0) {
      toast.error('No new shifts to save');
      return;
    }
    let successCount = 0;
    let errorCount = 0;
    for (const shift of newShifts) {
      const payload = {
        employeeId: shift.employeeId,
        managerId: user?.employeeId,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakTimeInMinutes: 0,
        isPublished: true
      };
      console.log('Saving shift with payload:',payload)
      try {
        const res = await fetch('http://localhost:5000/workDay/shifts/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          errorCount++;
          const error = await res.json();
          toast.error(error.error || 'Failed to assign shift');
        } else {
          successCount++;
        }
      } catch (err) {
        errorCount++;
        toast.error('Failed to assign shift');
      }
    }
    if (successCount > 0) {
      toast.success(`Shift plan saved! ${successCount} shifts assigned.`);
      setShifts([]); // Clear local shifts
      // Refresh employee shifts from backend
      if (selectedEmployee) {
        const res = await fetch(`http://localhost:5000/workDay/shifts/employee/${selectedEmployee}`);
        const data = await res.json();
        setEmployeeShifts(data);
      }
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} shifts failed to assign.`);
    }
  };

  const addCustomShift = () => {
    if (!customShift.name || !customShift.startTime || !customShift.endTime) {
      toast.error('Please fill all custom shift fields');
      return;
    }
    const customShiftType = {
      type: 'custom',
      name: customShift.name,
      startTime: customShift.startTime,
      endTime: customShift.endTime,
      color: 'bg-green-100 text-green-800',
      icon: Settings2,
      customName: customShift.name
    };
    setCustomShift({ name: '', startTime: '', endTime: '' });
    setIsCustomShiftOpen(false);
    toast.success('Custom shift created');
  };

  const selectedEmployeeData = employees.find(emp => emp._id === selectedEmployee);

  return (
    <div className="space-y-6">
      <UniversalBackButton />
      <div className="space-y-4">
        <div>
          <h1>Shift Management</h1>
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
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Select Employee</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an employee to assign shifts..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {employees.map((employee) => (
                  <SelectItem key={employee._id} value={employee._id}>
                    <div className="flex items-center space-x-2">
                      <span>
                        {employee.firstName} {employee.lastName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {employee.jobInfo.departmentId.name}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEmployeeData && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Selected:</strong> {selectedEmployeeData.firstName} {selectedEmployeeData.lastName} ({selectedEmployeeData.email})
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Available Shifts</span>
            </CardTitle>
            <Dialog open={isCustomShiftOpen} onOpenChange={setIsCustomShiftOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Custom Shift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Shift</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="shift-name">Shift Name</Label>
                    <Input
                      id="shift-name"
                      value={customShift.name}
                      onChange={(e) => setCustomShift({...customShift, name: e.target.value})}
                      placeholder="e.g., Weekend Shift"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={customShift.startTime}
                        onChange={(e) => setCustomShift({...customShift, startTime: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={customShift.endTime}
                        onChange={(e) => setCustomShift({...customShift, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button onClick={addCustomShift} className="w-full">
                    Create Shift
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shiftTypes.map((shiftType) => {
              const IconComponent = shiftType.icon;
              return (
                <div
                  key={shiftType.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, shiftType)}
                  className="cursor-grab active:cursor-grabbing border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${shiftType.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{shiftType.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {shiftType.startTime} - {shiftType.endTime}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            💡 Drag and drop shifts onto calendar days to assign them
          </p>
        </CardContent>
      </Card>
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
              <span className="text-sm text-muted-foreground px-4">
                {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                Next Week
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedEmployee ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Please select an employee to view their schedule</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, index) => {
                const dayShifts = getShiftForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={date.toISOString()}
                    className={`border rounded-lg p-3 min-h-[120px] ${
                      isToday ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, date)}
                  >
                    <div className="text-center mb-2">
                      <div className="text-sm font-medium">{weekDays[index]}</div>
                      <div className={`text-lg ${isToday ? 'font-bold text-primary' : ''}`}>
                        {date.getDate()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {dayShifts.map((shift) => (
                        <div
                          key={shift._id || shift.id}
                          className={`text-xs p-2 rounded ${getShiftColor(shift.type)} cursor-pointer`}
                          onClick={() => removeShift(shift.id!)}
                          title="Click to remove"
                        >
                          <div className="font-medium">
                            {shift.customName || shiftTypes.find(st => st.type === shift.type)?.name}
                          </div>
                          <div>{shift.startTime} - {shift.endTime}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      {selectedEmployee && shifts.filter(s => s.employeeId === selectedEmployee).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assignment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {shifts.filter(s => s.employeeId === selectedEmployee).length} shifts assigned to{' '}
                  <strong>{selectedEmployeeData?.firstName} {selectedEmployeeData?.lastName}</strong>
                </p>
              </div>
              <Button onClick={saveShiftPlan} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Shift Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
