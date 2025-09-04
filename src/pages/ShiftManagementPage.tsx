import React, { useState } from 'react';
import { Plus, Calendar, Clock, Users, Edit, Trash2, Copy, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useForm } from 'react-hook-form';

interface Shift {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  department: string;
  location: string;
  requiredStaff: number;
  assignedStaff: string[];
  description?: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdDate: string;
}

interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  department: string;
  location: string;
  requiredStaff: number;
  daysOfWeek: string[];
  description?: string;
}

const mockShifts: Shift[] = [
  {
    id: '1',
    title: 'Morning Customer Service',
    date: '2024-01-16',
    startTime: '08:00',
    endTime: '16:00',
    duration: 8,
    department: 'Customer Service',
    location: 'Main Office - Floor 3',
    requiredStaff: 5,
    assignedStaff: ['John Smith', 'Alice Johnson', 'Bob Wilson', 'Carol Davis', 'Dave Brown'],
    description: 'Regular morning shift for customer service operations',
    status: 'scheduled',
    createdBy: 'Manager Alice',
    createdDate: '2024-01-10'
  },
  {
    id: '2',
    title: 'Evening Sales Support',
    date: '2024-01-16',
    startTime: '14:00',
    endTime: '22:00',
    duration: 8,
    department: 'Sales',
    location: 'Main Office - Floor 2',
    requiredStaff: 3,
    assignedStaff: ['Eve Wilson', 'Frank Miller'],
    description: 'Evening sales support and lead follow-up',
    status: 'scheduled',
    createdBy: 'Manager Bob',
    createdDate: '2024-01-11'
  },
  {
    id: '3',
    title: 'Night IT Maintenance',
    date: '2024-01-15',
    startTime: '22:00',
    endTime: '06:00',
    duration: 8,
    department: 'IT',
    location: 'Server Room',
    requiredStaff: 2,
    assignedStaff: ['Tech Lead Sarah', 'IT Support Mike'],
    description: 'Scheduled maintenance and system updates',
    status: 'completed',
    createdBy: 'IT Manager',
    createdDate: '2024-01-08'
  }
];

const mockShiftTemplates: ShiftTemplate[] = [
  {
    id: '1',
    name: 'Standard Day Shift',
    startTime: '09:00',
    endTime: '17:00',
    duration: 8,
    department: 'Customer Service',
    location: 'Main Office',
    requiredStaff: 4,
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    description: 'Standard business hours shift'
  },
  {
    id: '2',
    name: 'Weekend Coverage',
    startTime: '10:00',
    endTime: '18:00',
    duration: 8,
    department: 'Customer Service',
    location: 'Main Office',
    requiredStaff: 2,
    daysOfWeek: ['Saturday', 'Sunday'],
    description: 'Weekend customer support coverage'
  },
  {
    id: '3',
    name: 'Night Security',
    startTime: '22:00',
    endTime: '06:00',
    duration: 8,
    department: 'Security',
    location: 'All Areas',
    requiredStaff: 1,
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    description: 'Overnight security coverage'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

const CreateShiftDialog = () => {
  const form = useForm({
    defaultValues: {
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      department: '',
      location: '',
      requiredStaff: 1,
      description: ''
    }
  });

  const onSubmit = (data: any) => {
    console.log('Create shift:', data);
    // Handle form submission
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Create New Shift</DialogTitle>
        <DialogDescription>
          Add a new shift to the schedule
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shift Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Morning Customer Service" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requiredStaff"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Needed</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Customer Service">Customer Service</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Main Office - Floor 3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add any additional details..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">
              Create Shift
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

const ShiftManagementView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filteredShifts = mockShifts.filter(shift => {
    const matchesSearch = shift.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shift.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shift.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || shift.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const scheduledCount = mockShifts.filter(s => s.status === 'scheduled').length;
  const activeCount = mockShifts.filter(s => s.status === 'active').length;
  const totalStaffAssigned = mockShifts.reduce((sum, shift) => sum + shift.assignedStaff.length, 0);
  const understaffedShifts = mockShifts.filter(s => s.assignedStaff.length < s.requiredStaff).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Scheduled Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledCount}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Active Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently ongoing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Staff Assigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaffAssigned}</div>
            <p className="text-xs text-muted-foreground">
              Total assignments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Understaffed</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{understaffedShifts}</div>
            <p className="text-xs text-muted-foreground">
              Need more staff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search shifts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Customer Service">Customer Service</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shifts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Schedule</CardTitle>
          <CardDescription>
            Manage and oversee all scheduled shifts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shift Details</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Staffing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{shift.title}</div>
                      <div className="text-sm text-muted-foreground">{shift.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{formatDate(shift.date)}</div>
                      <div className="text-sm text-muted-foreground">
                        {shift.startTime} - {shift.endTime} ({shift.duration}h)
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{shift.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        shift.assignedStaff.length < shift.requiredStaff ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {shift.assignedStaff.length}/{shift.requiredStaff}
                      </span>
                      {shift.assignedStaff.length < shift.requiredStaff && (
                        <Badge variant="destructive" className="text-xs">
                          Understaffed
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {shift.assignedStaff.slice(0, 2).join(', ')}
                      {shift.assignedStaff.length > 2 && ` +${shift.assignedStaff.length - 2} more`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(shift.status)}>
                      {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const ShiftTemplatesView = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shift Templates</CardTitle>
          <CardDescription>
            Create and manage reusable shift templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockShiftTemplates.map((template) => (
              <Card key={template.id} className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>
                    {template.startTime} - {template.endTime} ({template.duration}h)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Department:</span>
                      <span className="ml-2">{template.department}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Staff Required:</span>
                      <span className="ml-2">{template.requiredStaff}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Days:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.daysOfWeek.map((day) => (
                          <Badge key={day} variant="secondary" className="text-xs">
                            {day.slice(0, 3)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {template.description && (
                      <div>
                        <span className="text-muted-foreground">Description:</span>
                        <p className="text-xs mt-1">{template.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Copy className="h-3 w-3 mr-1" />
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Template Card */}
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center h-full py-8">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <h4 className="font-medium">Create Template</h4>
                <p className="text-sm text-muted-foreground text-center">
                  Add a new shift template for quick scheduling
                </p>
                <Button variant="outline" className="mt-3">
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ShiftManagementPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Shift Management</h1>
          <p className="text-muted-foreground">
            Create, assign, and manage work shifts across departments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Shift
              </Button>
            </DialogTrigger>
            <CreateShiftDialog />
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="shifts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shifts">Shift Schedule</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="shifts">
          <ShiftManagementView />
        </TabsContent>
        
        <TabsContent value="templates">
          <ShiftTemplatesView />
        </TabsContent>
      </Tabs>
    </div>
  );
};