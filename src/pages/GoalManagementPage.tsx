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
import { CalendarIcon, Plus, Target, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { UniversalBackButton } from '../components/UniversalBackButton';

interface Goal {
  id: string;
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Ongoing' | 'Completed';
  assignedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

export const GoalManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - In real app, this would come from API
  useEffect(() => {
    const mockEmployees: Employee[] = [
      { id: '1', name: 'John Smith', email: 'john@company.com', department: 'Engineering', role: 'employee' },
      { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', department: 'Engineering', role: 'employee' },
      { id: '3', name: 'Mike Chen', email: 'mike@company.com', department: 'Engineering', role: 'employee' },
      { id: '4', name: 'Emily Davis', email: 'emily@company.com', department: 'Marketing', role: 'employee' },
      { id: '5', name: 'Alex Wilson', email: 'alex@company.com', department: 'Sales', role: 'employee' },
    ];

    const mockGoals: Goal[] = [
      {
        id: '1',
        title: 'Complete React Training Module',
        description: 'Finish the advanced React training course and pass the certification exam',
        employeeId: '1',
        employeeName: 'John Smith',
        dueDate: new Date('2024-12-15'),
        priority: 'High',
        status: 'Ongoing',
        assignedBy: user?.name || 'Manager',
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-10'),
      },
      {
        id: '2',
        title: 'Improve Database Performance',
        description: 'Optimize database queries and reduce response time by 30%',
        employeeId: '2',
        employeeName: 'Sarah Johnson',
        dueDate: new Date('2024-12-20'),
        priority: 'Medium',
        status: 'Pending',
        assignedBy: user?.name || 'Manager',
        createdAt: new Date('2024-11-05'),
        updatedAt: new Date('2024-11-05'),
      },
      {
        id: '3',
        title: 'Lead Code Review Sessions',
        description: 'Conduct weekly code review sessions for junior developers',
        employeeId: '3',
        employeeName: 'Mike Chen',
        dueDate: new Date('2024-12-31'),
        priority: 'Medium',
        status: 'Completed',
        assignedBy: user?.name || 'Manager',
        createdAt: new Date('2024-10-15'),
        updatedAt: new Date('2024-11-08'),
      },
    ];

    setEmployees(mockEmployees);
    setGoals(mockGoals);
  }, [user]);

  const handleCreateGoal = () => {
    if (!goalTitle || !goalDescription || !selectedEmployee || !dueDate) {
      return;
    }

    const selectedEmp = employees.find(emp => emp.id === selectedEmployee);
    if (!selectedEmp) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: goalTitle,
      description: goalDescription,
      employeeId: selectedEmployee,
      employeeName: selectedEmp.name,
      dueDate,
      priority,
      status: 'Pending',
      assignedBy: user?.name || 'Manager',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setGoals(prev => [...prev, newGoal]);
    
    // Reset form
    setGoalTitle('');
    setGoalDescription('');
    setSelectedEmployee('');
    setDueDate(undefined);
    setPriority('Medium');
    setIsCreateDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Ongoing': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Completed': return 'bg-green-100 text-green-800 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'Medium': return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'Low': return 'bg-green-100 text-green-800 hover:bg-green-100';
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

  const filteredGoals = filterStatus === 'all' 
    ? goals 
    : goals.filter(goal => goal.status.toLowerCase() === filterStatus);

  const stats = {
    total: goals.length,
    pending: goals.filter(g => g.status === 'Pending').length,
    ongoing: goals.filter(g => g.status === 'Ongoing').length,
    completed: goals.filter(g => g.status === 'Completed').length,
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
              <div>
                <Label htmlFor="employee">Select Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Enter goal title"
                />
              </div>
              
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
              
              <div className="grid grid-cols-2 gap-4">
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
                
                <div>
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(value: 'Low' | 'Medium' | 'High') => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGoals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{goal.employeeName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{goal.title}</div>
                      <div className="text-sm text-muted-foreground">{goal.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getPriorityColor(goal.priority)}>
                      {goal.priority}
                    </Badge>
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