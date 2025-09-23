import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Target, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { UniversalBackButton } from '../components/UniversalBackButton';

type ModuleStatus = 'Pending' | 'Completed';

interface ModuleItem {
  id: string;      // local id for UI list handling
  name: string;
  status: ModuleStatus;
}

interface Goal {
  _id: string;
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  dueDate: Date;
  status: 'Pending' | 'Ongoing' | 'Completed';
  assignedBy: string;
  createdAt: Date;
  updatedAt: Date;
  modules: ModuleItem[];         // ⬅️ added
}

interface Employee {
   _id: string;
  firstName: string;
  lastName: string;
  name: string; // full name for display
  email: string;
  role: "Employee" | "Manager" | "Admin";

  jobInfo: {
    positionId: {
      _id: string;
      title: string;
    } | string; // populated or just ID

    departmentId: {
      _id: string;
      name: string;
    } | string; // populated or just ID

    managerId?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | string; // populated or just ID

    hireDate: string; // ISO date string when fetched from API
  };

  compensation: {
    wage: number;
    payPeriod: "Annual" | "Monthly";
  };

  leaveBalances: {
    annual: number;
    sick: number;
  };

  createdAt: string;
  updatedAt: string;

}

interface GoalsByEmployee {
  [employeeId: string]: Goal[];
}

interface EmployeesById {
  [id: string]: Employee;
}

export const GoalManagementPage: React.FC = () => {
  const { user } = useAuth();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [employeesById, setEmployeesById] = useState<EmployeesById>({});
  const [goalsByEmployee, setGoalsByEmployee] = useState<GoalsByEmployee>({});
const allGoals: Goal[] = Object.values(goalsByEmployee).flat() as Goal[];
  
  // NEW: modules state for the dialog
  const [modules, setModules] = useState<Array<{ id: string; name: string }>>([
    { id: `${Date.now()}-0`, name: '' },
  ]);
  

  // fetching goals for employee
useEffect(() => {
  const fetchGoals = async () => {
    try {
      if (!user?.employeeId) return;
      const res = await fetch(`http://localhost:5000/workDay/goals/assigned/${user.employeeId}`);
      if (!res.ok) throw new Error("Failed to fetch goals");
      const data: Goal[] = await res.json();

      // HashMap grouping
      const grouped: GoalsByEmployee = {};
      data.forEach(goal => {
        if (!grouped[goal.employeeId]) grouped[goal.employeeId] = [];
        grouped[goal.employeeId].push(goal);
      });

     
      setGoalsByEmployee(grouped);
    } catch (err) {
      console.error("Error fetching goals:", err);
    }
  };

  fetchGoals();
}, [user,goalsByEmployee]);

//fetching Team Members for manager
useEffect(() => {
  const fetchEmployees = async () => {
    try {
      if (!user?.employeeId) return;
      const res = await fetch(`http://localhost:5000/workDay/employees/${user.employeeId}/team`);
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data: Employee[] = await res.json();

      // Build employees map
      const empMap: EmployeesById = {};
      data.forEach(emp => {
        emp.name=`${emp.firstName} ${emp.lastName}`
        empMap[emp._id] = emp;
      });

      setEmployees(data);
      setEmployeesById(empMap);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  fetchEmployees();
}, [user]);


  const addModuleRow = () => {
    setModules((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, name: '' }]);
  };

  const removeModuleRow = (id: string) => {
    setModules((prev) => (prev.length <= 1 ? prev : prev.filter((m) => m.id !== id)));
  };

  const updateModuleName = (id: string, name: string) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));
  };

  const handleCreateGoal = async () => {
  if (!goalTitle || !goalDescription || !selectedEmployee || !dueDate) return;

  // at least one non-empty module
  const cleanedModules = modules
    .map((m) => m.name.trim())
    .filter(Boolean);

  if (cleanedModules.length === 0) return;

  const selectedEmp = employeesById[selectedEmployee];
  if (!selectedEmp) return;

  const modulePayload = cleanedModules.map((name) => ({
    name,
    status: "Pending",
  }));

  try {
    const res = await fetch("http://localhost:5000/workDay/goals/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: selectedEmployee, // from dropdown
        assignedBy: user?.employeeId, // logged-in manager
        title: goalTitle,
        description: goalDescription,
        dueDate,
        modules: modulePayload, 
      }),
    });

    if (!res.ok) throw new Error("Failed to create goal");
    const savedGoal: Goal = await res.json();
    console.log(selectedEmp.name,selectedEmp.firstName)
    console.log(savedGoal);
    savedGoal.employeeName = selectedEmp.name;
console.log(savedGoal);
   setGoalsByEmployee((prev) => {
  const updated = { ...prev };
  if (!updated[savedGoal.employeeId]) {
    updated[savedGoal.employeeId] = [];
  }
  updated[savedGoal.employeeId] = [...updated[savedGoal.employeeId], savedGoal];
  return updated;
});

    // Reset form
    setGoalTitle("");
    setGoalDescription("");
    setSelectedEmployee("");
    setDueDate(undefined);
    setModules([{ id: `${Date.now()}-0`, name: "" }]);
    setIsCreateDialogOpen(false);
  } catch (err) {
    console.error("Error creating goal:", err);
  }
};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Ongoing': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Completed': return 'bg-green-100 text-green-800 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <AlertCircle className="h-4 w-4" />;
      case 'Ongoing': return <Clock className="h-4 w-4" />;
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredGoals = allGoals.filter(goal => {
  const matchStatus =
    filterStatus === "all" ||
    goal.status.toLowerCase() === filterStatus.toLowerCase(); // ✅ FIXED

  const matchEmployee =
    selectedEmployee === "all" || goal.employeeId === selectedEmployee;

  return matchStatus && matchEmployee;
});


  const stats = {
  total: allGoals.length,
  pending: allGoals.filter(g => g.status === "Pending").length,
  ongoing: allGoals.filter(g => g.status === "Ongoing").length,
  completed: allGoals.filter(g => g.status === "Completed").length,
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <UniversalBackButton />
          <div>
            <h1 className="text-3xl font-bold">Goal Management</h1>
            <p className="text-muted-foreground">
              Assign and track goals for your team members
            </p>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Assign New Goal</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign New Goal</DialogTitle>
              <DialogDescription>
                Create and assign a goal to one of your team members.
              </DialogDescription>
            </DialogHeader>
            

            <div className="space-y-4">
              {/* Employee */}
              <div>
                <Label htmlFor="employee">Select Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee._id} value={employee._id}>
                        {employee.name} - {employee.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Enter goal title"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Describe the goal and expectations"
                  rows={3}
                />
              </div>

              {/* Due Date */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* MODULES - NEW */}
              <div className="space-y-2">
                <Label>Modules</Label>
                <div className="space-y-2">
                  {modules.map((m, idx) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <Input
                        value={m.name}
                        onChange={(e) => updateModuleName(m.id, e.target.value)}
                        placeholder={`Module ${idx + 1} name`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeModuleRow(m.id)}
                        disabled={modules.length <= 1}
                        className="shrink-0"
                        aria-label="Remove module"
                        title="Remove module"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="secondary" onClick={addModuleRow} className="mt-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>

              {/* Submit */}
              <Button onClick={handleCreateGoal} className="w-full">
                Assign Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.ongoing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Goals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
  <div>
    <CardTitle>Assigned Goals</CardTitle>
    <CardDescription>Track progress of all assigned goals</CardDescription>
  </div>

  <div className="flex items-center gap-2">
    {/* Status Filter */}
    <Select value={filterStatus} onValueChange={setFilterStatus}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Filter by Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="ongoing">Ongoing</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
      </SelectContent>
    </Select>

    {/* Employee Filter */}
    <Select
      value={selectedEmployee}
      onValueChange={setSelectedEmployee}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Filter by Employee" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Employees</SelectItem>
        {employees.map(emp => (
          <SelectItem key={emp._id} value={emp._id}>
            {emp.firstName} {emp.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Goal</TableHead>
                {/* Priority column removed */}
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGoals.map((goal) => (
                <TableRow key={goal._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{(employeesById[goal.employeeId]).name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{goal.title}</div>
                      <div className="text-sm text-muted-foreground">{goal.description}</div>
                      {/* Optional: quick glance of modules */}
                      {goal.modules?.length ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Modules: {goal.modules.map(m => m.name).join(', ')}
                        </div>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${getStatusColor(goal.status)} flex items-center space-x-1 w-fit`}>
                      {getStatusIcon(goal.status)}
                      <span>{goal.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(goal.dueDate, 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {format(goal.updatedAt, 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredGoals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No goals found for the selected filter.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
