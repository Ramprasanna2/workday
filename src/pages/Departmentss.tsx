import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Building, Plus, Trash2, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { UniversalBackButton } from '../components/UniversalBackButton';

interface Department {
  _id: string;
  name: string;
  employeeCount: number;
  createdAt: string;
}

interface Position {
  _id: string;
  title: string;
  departmentId: string;
  role: string;
  description?: string;
  employeeCount: number;
  createdAt: string;
  department?: {
    _id: string;
    name: string;
  };
}

const DepartmentPositionPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);

  const [newDepartment, setNewDepartment] = useState({ name: '' });
  const [newPosition, setNewPosition] = useState({
    title: '',
    departmentId: '',
    role: 'Employee',
    description: '',
  });

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/workDay/admin/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('http://localhost:5000/workDay/admin/positions');
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast.error('Failed to fetch positions');
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/workDay/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDepartment),
      });

      if (response.ok) {
        toast.success('Department created successfully');
        setNewDepartment({ name: '' });
        setIsDepartmentDialogOpen(false);
        fetchDepartments();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create department');
      }
    } catch (error) {
      console.error('Error creating department:', error);
      toast.error('Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/workDay/admin/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPosition),
      });

      if (response.ok) {
        toast.success('Position created successfully');
        setNewPosition({ title: '', departmentId: '', role: 'Employee', description: '' });
        setIsPositionDialogOpen(false);
        fetchPositions();
        fetchDepartments();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create position');
      }
    } catch (error) {
      console.error('Error creating position:', error);
      toast.error('Failed to create position');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/workDay/admin/departments/${departmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Department deleted successfully');
        fetchDepartments();
        fetchPositions();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    }
  };

  const handleDeletePosition = async (positionId: string) => {
    if (!confirm('Are you sure you want to delete this position? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/workDay/admin/positions/${positionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Position deleted successfully');
        fetchPositions();
        fetchDepartments();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete position');
      }
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error('Failed to delete position');
    }
  };

  return (
    <div className="space-y-6">
      <UniversalBackButton />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department & Position Management</h1>
          <p className="text-muted-foreground">Manage organizational structure and roles</p>
        </div>
      </div>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="departments" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Departments</span>
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Positions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Departments ({departments.length})</span>
                </CardTitle>
                <Dialog open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Department</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateDepartment} className="space-y-4">
                      <div>
                        <Label htmlFor="departmentName">Department Name *</Label>
                        <Input
                          id="departmentName"
                          value={newDepartment.name}
                          onChange={(e) => setNewDepartment({ name: e.target.value })}
                          placeholder="Enter department name"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsDepartmentDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Creating...' : 'Create Department'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Department Name</TableHead>
                    <TableHead className="w-[150px] text-center">Employee Count</TableHead>
                    <TableHead className="w-[200px] text-center">Created Date</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((department) => (
                    <TableRow key={department._id}>
                      <TableCell className="font-medium">{department.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-medium">
                          {department.employeeCount} employees
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(department.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDepartment(department._id)}
                          disabled={department.employeeCount > 0}
                          title={department.employeeCount > 0 ? 'Cannot delete department with employees' : 'Delete department'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {departments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No departments found. Create your first department to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Positions ({positions.length})</span>
                </CardTitle>
                <Dialog open={isPositionDialogOpen} onOpenChange={setIsPositionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Position
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Position</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreatePosition} className="space-y-4">
                      <div>
                        <Label htmlFor="positionTitle">Position Title *</Label>
                        <Input
                          id="positionTitle"
                          value={newPosition.title}
                          onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                          placeholder="Enter position title"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="positionDepartment">Department *</Label>
                        <Select
                          value={newPosition.departmentId || undefined}
                          onValueChange={(value) => setNewPosition({ ...newPosition, departmentId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept._id} value={dept._id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="positionRole">Role *</Label>
                        <Select
                          value={newPosition.role}
                          onValueChange={(value) => setNewPosition({ ...newPosition, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Employee">Employee</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="Supervisor">Supervisor</SelectItem>
                            <SelectItem value="Team Lead">Team Lead</SelectItem>
                            <SelectItem value="Director">Director</SelectItem>
                            <SelectItem value="Executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="positionDescription">Description</Label>
                        <Textarea
                          id="positionDescription"
                          value={newPosition.description}
                          onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
                          placeholder="Enter position description (optional)"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsPositionDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !newPosition.departmentId}>
                          {loading ? 'Creating...' : 'Create Position'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Position Title</TableHead>
                    <TableHead className="w-[150px]">Department</TableHead>
                    <TableHead className="w-[120px] text-center">Role</TableHead>
                    <TableHead className="w-[120px] text-center">Employee Count</TableHead>
                    <TableHead className="w-[250px]">Description</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position) => (
                    <TableRow key={position._id}>
                      <TableCell className="font-medium">{position.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {position.department?.name || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{position.role}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-medium">
                          {position.employeeCount} employees
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={position.description}>
                          {position.description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePosition(position._id)}
                          disabled={position.employeeCount > 0}
                          title={position.employeeCount > 0 ? 'Cannot delete position with employees' : 'Delete position'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {positions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No positions found. Create your first position to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DepartmentPositionPage;