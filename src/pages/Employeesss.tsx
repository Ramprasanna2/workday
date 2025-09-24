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
import { Users, Plus, Edit, Trash2, UserPlus, Eye, Filter, UserX, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { UniversalBackButton } from '../components/UniversalBackButton';

interface Department {
  _id: string;
  name: string;
  employeeCount: number;
}

interface Position {
  _id: string;
  title: string;
  departmentId: string | { _id: string; name: string; employeeCount: number }; // Handle both cases
  role: string;
  employeeCount: number;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  jobInfo: {
    positionId: {
      _id: string;
      title: string;
    };
    departmentId: {
      _id: string;
      name: string;
    };
    managerId?: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  contactDetails: {
    phone: string;
    alternatePhone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
      alternatePhone?: string;
    };
  };
  compensation?: {
    wage: number;
    payPeriod: string;
    deductions?: {
      tax?: number;
      socialSecurity?: number;
      medicare?: number;
      insurance?: number;
      retirement?: number;
    };
  };
  createdAt: string;
}

interface FilterOptions {
  departmentId: string;
  positionId: string;
  managerStatus: string;
  searchTerm: string;
}

interface EmployeeForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactDetails: {
    phone: string;
    alternatePhone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
      alternatePhone: string;
    };
  };
  jobInfo: {
    positionId: string;
    departmentId: string;
    managerId: string;
  };
  compensation: {
    wage: number;
    payPeriod: string;
    deductions: {
      tax: number;
      socialSecurity: number;
      medicare: number;
      insurance: number;
      retirement: number;
    };
  };
}

const EmployeeListPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [teamMembersDialog, setTeamMembersDialog] = useState<{open: boolean, employee?: Employee, teamMembers: Employee[]}>({
    open: false,
    teamMembers: []
  });

  const [filters, setFilters] = useState<FilterOptions>({
    departmentId: 'all',
    positionId: 'all',
    managerStatus: 'all',
    searchTerm: ''
  });

  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  const [employeeForm, setEmployeeForm] = useState<EmployeeForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contactDetails: {
      phone: '',
      alternatePhone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        alternatePhone: '',
      },
    },
    jobInfo: {
      positionId: '',
      departmentId: '',
      managerId: '',
    },
    compensation: {
      wage: 0,
      payPeriod: 'Annual',
      deductions: {
        tax: 0,
        socialSecurity: 0,
        medicare: 0,
        insurance: 0,
        retirement: 0,
      },
    },
  });

  // Add state for tab validation
  const [activeTab, setActiveTab] = useState('personal');

    // Add these new state variables after your existing state declarations:
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<EmployeeForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contactDetails: {
      phone: '',
      alternatePhone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        alternatePhone: '',
      },
    },
    jobInfo: {
      positionId: '',
      departmentId: '',
      managerId: '',
    },
    compensation: {
      wage: 0,
      payPeriod: 'Annual',
      deductions: {
        tax: 0,
        socialSecurity: 0,
        medicare: 0,
        insurance: 0,
        retirement: 0,
      },
    },
  });
  const [editActiveTab, setEditActiveTab] = useState('personal');
  
  // Add these new functions:
  
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    
    // Populate the edit form with existing employee data
    setEditForm({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      password: '', // Don't populate password for security
      contactDetails: {
        phone: employee.contactDetails?.phone || '',
        alternatePhone: employee.contactDetails?.alternatePhone || '',
        address: {
          street: employee.contactDetails?.address?.street || '',
          city: employee.contactDetails?.address?.city || '',
          state: employee.contactDetails?.address?.state || '',
          zipCode: employee.contactDetails?.address?.zipCode || '',
          country: employee.contactDetails?.address?.country || 'USA',
        },
        emergencyContact: {
          name: employee.contactDetails?.emergencyContact?.name || '',
          relationship: employee.contactDetails?.emergencyContact?.relationship || '',
          phone: employee.contactDetails?.emergencyContact?.phone || '',
          alternatePhone: employee.contactDetails?.emergencyContact?.alternatePhone || '',
        },
      },
      jobInfo: {
        positionId: employee.jobInfo?.positionId?._id || '',
        departmentId: employee.jobInfo?.departmentId?._id || '',
        managerId: employee.jobInfo?.managerId?._id || '',
      },
      compensation: {
        wage: employee.compensation?.wage || 0,
        payPeriod: employee.compensation?.payPeriod || 'Annual',
        deductions: {
          tax: employee.compensation?.deductions?.tax || 0,
          socialSecurity: employee.compensation?.deductions?.socialSecurity || 0,
          medicare: employee.compensation?.deductions?.medicare || 0,
          insurance: employee.compensation?.deductions?.insurance || 0,
          retirement: employee.compensation?.deductions?.retirement || 0,
        },
      },
    });
    
    setEditActiveTab('personal');
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateEmployee = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!editingEmployee) return;
    
    try {
      setLoading(true);
      
      // Validation
      if (!editForm.jobInfo.departmentId) {
        toast.error('Please select a department');
        return;
      }
      
      if (!editForm.jobInfo.positionId) {
        toast.error('Please select a position');
        return;
      }
  
      // Find the selected position to get the role
      const selectedPosition = positions.find(p => p._id === editForm.jobInfo.positionId);
      if (!selectedPosition) {
        toast.error('Invalid position selected');
        return;
      }
  
      // Validate position belongs to selected department
      const posDeptId = typeof selectedPosition.departmentId === 'string' 
        ? selectedPosition.departmentId 
        : selectedPosition.departmentId._id;
        
      if (posDeptId !== editForm.jobInfo.departmentId) {
        toast.error('Selected position does not belong to the selected department');
        return;
      }
  
      // Basic field validation
      if (!editForm.firstName || !editForm.lastName || !editForm.email) {
        toast.error('Please fill in all required fields');
        return;
      }
  
      // Create update data
      const updateData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        role: selectedPosition.role,
        contactDetails: editForm.contactDetails,
        jobInfo: {
          positionId: editForm.jobInfo.positionId,
          departmentId: editForm.jobInfo.departmentId,
          managerId: editForm.jobInfo.managerId || undefined
        },
        compensation: editForm.compensation
      };
  
      // Only include password if it's provided
      if (editForm.password && editForm.password.length >= 6) {
        (updateData as any).password = editForm.password;
      }
  
      console.log('Updating employee data:', updateData);
  
      const response = await fetch(`http://localhost:5000/workDay/employees/${editingEmployee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
  
      if (response.ok) {
        toast.success('Employee updated successfully');
        setIsEditDialogOpen(false);
        setEditingEmployee(null);
        resetEditForm();
        fetchEmployees();
        fetchDepartments();
        fetchPositions();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    } finally {
      setLoading(false);
    }
  };
  
  const resetEditForm = () => {
    setEditForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      contactDetails: {
        phone: '',
        alternatePhone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA',
        },
        emergencyContact: {
          name: '',
          relationship: '',
          phone: '',
          alternatePhone: '',
        },
      },
      jobInfo: {
        positionId: '',
        departmentId: '',
        managerId: '',
      },
      compensation: {
        wage: 0,
        payPeriod: 'Annual',
        deductions: {
          tax: 0,
          socialSecurity: 0,
          medicare: 0,
          insurance: 0,
          retirement: 0,
        },
      },
    });
    setEditActiveTab('personal');
  };
  
  const updateEditForm = (field: string, value: any) => {
    const fields = field.split('.');
    
    setEditForm(prevForm => {
      if (fields.length === 1) {
        return { ...prevForm, [field]: value };
      } else if (fields.length === 2) {
        return {
          ...prevForm,
          [fields[0]]: {
            ...(prevForm[fields[0] as keyof EmployeeForm] as any),
            [fields[1]]: value,
          },
        };
      } else if (fields.length === 3) {
        return {
          ...prevForm,
          [fields[0]]: {
            ...(prevForm[fields[0] as keyof EmployeeForm] as any),
            [fields[1]]: {
              ...((prevForm[fields[0] as keyof EmployeeForm] as any)[fields[1]] as any),
              [fields[2]]: value,
            },
          },
        };
      }
      return prevForm;
    });
  };
  
 

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchPositions();
    fetchManagers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, filters]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/workDay/employees/all');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/workDay/admin/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
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
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetch('http://localhost:5000/workDay/employees/managers');
      if (response.ok) {
        const data = await response.json();
        setManagers(data);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];

    if (filters.departmentId && filters.departmentId !== 'all') {
      filtered = filtered.filter(emp => emp.jobInfo.departmentId._id === filters.departmentId);
    }

    if (filters.positionId && filters.positionId !== 'all') {
      filtered = filtered.filter(emp => emp.jobInfo.positionId._id === filters.positionId);
    }

    if (filters.managerStatus === 'hasManager') {
      filtered = filtered.filter(emp => emp.jobInfo.managerId);
    } else if (filters.managerStatus === 'noManager') {
      filtered = filtered.filter(emp => !emp.jobInfo.managerId);
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.firstName.toLowerCase().includes(searchLower) ||
        emp.lastName.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.role.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEmployees(filtered);
  };

  const handleCreateEmployee = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validation - Check department first
      if (!employeeForm.jobInfo.departmentId) {
        toast.error('Please select a department');
        return;
      }
      
      // Then check position
      if (!employeeForm.jobInfo.positionId) {
        toast.error('Please select a position');
        return;
      }

      // Find the selected position to get the role
      const selectedPosition = positions.find(p => p._id === employeeForm.jobInfo.positionId);
      if (!selectedPosition) {
        toast.error('Invalid position selected');
        return;
      }

      // Validate position belongs to selected department
      const posDeptId = typeof selectedPosition.departmentId === 'string' 
        ? selectedPosition.departmentId 
        : selectedPosition.departmentId._id;
        
      if (posDeptId !== employeeForm.jobInfo.departmentId) {
        toast.error('Selected position does not belong to the selected department');
        return;
      }

      // Basic field validation
      if (!employeeForm.firstName || !employeeForm.lastName || !employeeForm.email || !employeeForm.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Create employee data with role from position
      const employeeData = {
        firstName: employeeForm.firstName,
        lastName: employeeForm.lastName,
        email: employeeForm.email,
        password: employeeForm.password,
        role: selectedPosition.role,
        contactDetails: employeeForm.contactDetails,
        jobInfo: {
          positionId: employeeForm.jobInfo.positionId,
          departmentId: employeeForm.jobInfo.departmentId,
          managerId: employeeForm.jobInfo.managerId || undefined
        },
        compensation: employeeForm.compensation
      };

      console.log('Sending employee data:', employeeData); // Debug log

      const response = await fetch('http://localhost:5000/workDay/employees/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (response.ok) {
        toast.success('Employee created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchEmployees();
        fetchDepartments(); // Refresh counts
        fetchPositions(); // Refresh counts
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create employee');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      const teamResponse = await fetch(`http://localhost:5000/workDay/employees/${employee._id}/team`);
      const teamMembers = await teamResponse.json();
      
      if (teamMembers.length > 0) {
        const shouldContinue = confirm(
          `This employee manages ${teamMembers.length} team member(s). ` +
          `You need to remove their manager assignment first. ` +
          `Would you like to remove this employee as manager from all their team members?`
        );
        
        if (!shouldContinue) return;
        
        const removeResponse = await fetch(`http://localhost:5000/workDay/employees/${employee._id}/remove-as-manager`, {
          method: 'PATCH',
        });
        
        if (!removeResponse.ok) {
          const error = await removeResponse.json();
          toast.error(error.message || 'Failed to remove manager assignment');
          return;
        }
        
        toast.success(`Removed manager assignment from ${teamMembers.length} employees`);
      }

      const response = await fetch(`http://localhost:5000/workDay/employees/${employee._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Employee deleted successfully');
        fetchEmployees();
        fetchDepartments();
        fetchPositions();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const handleViewTeamMembers = async (employee: Employee) => {
    try {
      const response = await fetch(`http://localhost:5000/workDay/employees/${employee._id}/team`);
      if (response.ok) {
        const teamMembers = await response.json();
        setTeamMembersDialog({
          open: true,
          employee,
          teamMembers
        });
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    }
  };

  const resetForm = () => {
    setEmployeeForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      contactDetails: {
        phone: '',
        alternatePhone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA',
        },
        emergencyContact: {
          name: '',
          relationship: '',
          phone: '',
          alternatePhone: '',
        },
      },
      jobInfo: {
        positionId: '',
        departmentId: '',
        managerId: '',
      },
      compensation: {
        wage: 0,
        payPeriod: 'Annual',
        deductions: {
          tax: 0,
          socialSecurity: 0,
          medicare: 0,
          insurance: 0,
          retirement: 0,
        },
      },
    });
  };

  const updateEmployeeForm = (field: string, value: any) => {
  const fields = field.split('.');
  
  setEmployeeForm(prevForm => {
    if (fields.length === 1) {
      return { ...prevForm, [field]: value };
    } else if (fields.length === 2) {
      return {
        ...prevForm,
        [fields[0]]: {
          ...(prevForm[fields[0] as keyof EmployeeForm] as any),
          [fields[1]]: value,
        },
      };
    } else if (fields.length === 3) {
      return {
        ...prevForm,
        [fields[0]]: {
          ...(prevForm[fields[0] as keyof EmployeeForm] as any),
          [fields[1]]: {
            ...((prevForm[fields[0] as keyof EmployeeForm] as any)[fields[1]] as any),
            [fields[2]]: value,
          },
        },
      };
    }
    return prevForm;
  });
};
  const clearFilters = () => {
    setFilters({
      departmentId: 'all',
      positionId: 'all',
      managerStatus: 'all',
      searchTerm: ''
    });
  };

  const getAvailablePositions = () => {
    if (!filters.departmentId || filters.departmentId === 'all') return positions;
    return positions.filter(pos => {
      // Handle both populated and non-populated departmentId
      const posDeptId = typeof pos.departmentId === 'string' 
        ? pos.departmentId 
        : pos.departmentId._id;
      
      return posDeptId === filters.departmentId;
    });
  };

  const getFormAvailablePositions = () => {
    if (!employeeForm.jobInfo.departmentId) return positions;
    return positions.filter(pos => pos.departmentId === employeeForm.jobInfo.departmentId);
  };

  return (
    <div className="space-y-6">
      <UniversalBackButton />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Directory</h1>
          <p className="text-muted-foreground">View and manage all employees</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Employee</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleCreateEmployee} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger 
                    value="contact" 
                    disabled={!employeeForm.firstName || !employeeForm.lastName}
                  >
                    Contact
                  </TabsTrigger>
                  <TabsTrigger 
                    value="job"
                    disabled={!employeeForm.firstName || !employeeForm.lastName || !employeeForm.contactDetails.phone}
                  >
                    Job Info
                  </TabsTrigger>
                  <TabsTrigger 
                    value="compensation"
                    disabled={!employeeForm.jobInfo.departmentId || !employeeForm.jobInfo.positionId}
                  >
                    Compensation
                  </TabsTrigger>
                  <TabsTrigger 
                    value="deductions"
                    disabled={!employeeForm.jobInfo.departmentId || !employeeForm.jobInfo.positionId}
                  >
                    Deductions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={employeeForm.firstName}
                        onChange={(e) => updateEmployeeForm('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={employeeForm.lastName}
                        onChange={(e) => updateEmployeeForm('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={employeeForm.email}
                      onChange={(e) => updateEmployeeForm('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={employeeForm.password}
                      onChange={(e) => updateEmployeeForm('password', e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={employeeForm.contactDetails.phone}
                        onChange={(e) => updateEmployeeForm('contactDetails.phone', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="alternatePhone">Alternate Phone</Label>
                      <Input
                        id="alternatePhone"
                        value={employeeForm.contactDetails.alternatePhone}
                        onChange={(e) => updateEmployeeForm('contactDetails.alternatePhone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Address</h3>
                    <div>
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        value={employeeForm.contactDetails.address.street}
                        onChange={(e) => updateEmployeeForm('contactDetails.address.street', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={employeeForm.contactDetails.address.city}
                          onChange={(e) => updateEmployeeForm('contactDetails.address.city', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={employeeForm.contactDetails.address.state}
                          onChange={(e) => updateEmployeeForm('contactDetails.address.state', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">Zip Code</Label>
                        <Input
                          id="zipCode"
                          value={employeeForm.contactDetails.address.zipCode}
                          onChange={(e) => updateEmployeeForm('contactDetails.address.zipCode', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={employeeForm.contactDetails.address.country}
                          onChange={(e) => updateEmployeeForm('contactDetails.address.country', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Emergency Contact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergencyName">Name</Label>
                        <Input
                          id="emergencyName"
                          value={employeeForm.contactDetails.emergencyContact.name}
                          onChange={(e) => updateEmployeeForm('contactDetails.emergencyContact.name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="relationship">Relationship</Label>
                        <Input
                          id="relationship"
                          value={employeeForm.contactDetails.emergencyContact.relationship}
                          onChange={(e) => updateEmployeeForm('contactDetails.emergencyContact.relationship', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergencyPhone">Phone</Label>
                        <Input
                          id="emergencyPhone"
                          value={employeeForm.contactDetails.emergencyContact.phone}
                          onChange={(e) => updateEmployeeForm('contactDetails.emergencyContact.phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyAlternatePhone">Alternate Phone</Label>
                        <Input
                          id="emergencyAlternatePhone"
                          value={employeeForm.contactDetails.emergencyContact.alternatePhone}
                          onChange={(e) => updateEmployeeForm('contactDetails.emergencyContact.alternatePhone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="job" className="space-y-4">
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={employeeForm.jobInfo.departmentId || ""}
                      onValueChange={(value) => {
                        console.log(value)
                        updateEmployeeForm('jobInfo.departmentId', value);
                        // Reset position when department changes
                        updateEmployeeForm('jobInfo.positionId', '');
                      }}
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
                    <Label htmlFor="position">Position *</Label>
                    <Select
                      value={employeeForm.jobInfo.positionId || ""}
                      onValueChange={(value) => {
                        updateEmployeeForm('jobInfo.positionId', value);
                      }}
                      disabled={!employeeForm.jobInfo.departmentId} // Keep disabled until department is selected
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !employeeForm.jobInfo.departmentId 
                            ? "Select department first" 
                            : "Select Position"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {positions
                          .filter(pos => {
                            // Handle both string and object departmentId
                            const posDeptId = typeof pos.departmentId === 'string' 
                              ? pos.departmentId 
                              : pos.departmentId._id;
                            return posDeptId === employeeForm.jobInfo.departmentId;
                          })
                          .map((position) => (
                            <SelectItem key={position._id} value={position._id}>
                              {position.title} - {position.role}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Show helper text */}
                    {!employeeForm.jobInfo.departmentId && (
                      <p className="text-sm text-muted-foreground">
                        Please select a department first to see available positions
                      </p>
                    )}
                    
                    {/* Show available positions count */}
                    {employeeForm.jobInfo.departmentId && (
                      <p className="text-sm text-muted-foreground">
                        {positions.filter(pos => {
                          const posDeptId = typeof pos.departmentId === 'string' 
                            ? pos.departmentId 
                            : pos.departmentId._id;
                          return posDeptId === employeeForm.jobInfo.departmentId;
                        }).length} positions available in selected department
                      </p>
                    )}
                  </div>

                  {/* Show selected role from position */}
                  {employeeForm.jobInfo.positionId && (
                    <div>
                      <Label>Role (from position)</Label>
                      <div className="p-2 bg-muted rounded-md">
                        <Badge variant="outline">
                          {positions.find(p => p._id === employeeForm.jobInfo.positionId)?.role || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="manager">Manager (Optional)</Label>
                    <Select
                      value={employeeForm.jobInfo.managerId || "none"}
                      onValueChange={(value) => {
                        updateEmployeeForm('jobInfo.managerId', value === 'none' ? '' : value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Manager (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Manager</SelectItem>
                        {managers.map((manager) => (
                          <SelectItem key={manager._id} value={manager._id}>
                            {manager.firstName} {manager.lastName} - {manager.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                 
                </TabsContent>

                <TabsContent value="compensation" className="space-y-4">
                  <div>
                    <Label htmlFor="wage">Wage/Salary *</Label>
                    <Input
                      id="wage"
                      type="number"
                      value={employeeForm.compensation.wage}
                      onChange={(e) => updateEmployeeForm('compensation.wage', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="payPeriod">Pay Period *</Label>
                    <Select
                      value={employeeForm.compensation.payPeriod}
                      onValueChange={(value) => updateEmployeeForm('compensation.payPeriod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Annual">Annual</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="deductions" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tax</Label>
                      <Input
                        type="number"
                        value={employeeForm.compensation.deductions.tax}
                        onChange={(e) => updateEmployeeForm('compensation.deductions.tax', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Social Security</Label>
                      <Input
                        type="number"
                        value={employeeForm.compensation.deductions.socialSecurity}
                        onChange={(e) => updateEmployeeForm('compensation.deductions.socialSecurity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Medicare</Label>
                      <Input
                        type="number"
                        value={employeeForm.compensation.deductions.medicare}
                        onChange={(e) => updateEmployeeForm('compensation.deductions.medicare', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Insurance</Label>
                      <Input
                        type="number"
                        value={employeeForm.compensation.deductions.insurance}
                        onChange={(e) => updateEmployeeForm('compensation.deductions.insurance', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Retirement</Label>
                      <Input
                        type="number"
                        value={employeeForm.compensation.deductions.retirement}
                        onChange={(e) => updateEmployeeForm('compensation.deductions.retirement', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Employee'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Name, email, or role..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={filters.departmentId}
                onValueChange={(value) => setFilters({ ...filters, departmentId: value, positionId: 'all' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name} ({dept.employeeCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="position">
                Position
                {!filters.departmentId && (
                  <span className="text-xs text-muted-foreground ml-1">
                    (Select department first)
                  </span>
                )}
              </Label>
              <Select
                value={filters.positionId}
                onValueChange={(value) => setFilters({ ...filters, positionId: value || '' })}
                
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    "All Positions"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {getAvailablePositions().map((position) => (
                    <SelectItem key={position._id} value={position._id}>
                      {position.title} ({position.employeeCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="managerStatus">Manager Status</Label>
              <Select
                value={filters.managerStatus}
                onValueChange={(value) => setFilters({ ...filters, managerStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="hasManager">Has Manager</SelectItem>
                  <SelectItem value="noManager">No Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                Total: {filteredEmployees.length} employees
              </Badge>
              {filters.managerStatus === 'noManager' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <UserX className="h-3 w-3" />
                  <span>Without Manager: {filteredEmployees.length}</span>
                </Badge>
              )}
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>
            {/* Add this Edit Employee Dialog after the Create Employee Dialog */}
            
            {/* Edit Employee Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Edit Employee - {editingEmployee?.firstName} {editingEmployee?.lastName}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleUpdateEmployee} className="space-y-6">
                  <Tabs value={editActiveTab} onValueChange={setEditActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="personal">Personal</TabsTrigger>
                      <TabsTrigger value="contact">Contact</TabsTrigger>
                      <TabsTrigger value="job">Job Info</TabsTrigger>
                      <TabsTrigger value="compensation">Compensation</TabsTrigger>
                      <TabsTrigger value="deductions">Deductions</TabsTrigger>
                    </TabsList>
      
                    <TabsContent value="personal" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editFirstName">First Name *</Label>
                          <Input
                            id="editFirstName"
                            value={editForm.firstName}
                            onChange={(e) => updateEditForm('firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="editLastName">Last Name *</Label>
                          <Input
                            id="editLastName"
                            value={editForm.lastName}
                            onChange={(e) => updateEditForm('lastName', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="editEmail">Email *</Label>
                        <Input
                          id="editEmail"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => updateEditForm('email', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="editPassword">
                          Password 
                          <span className="text-sm text-muted-foreground ml-1">
                            (Leave blank to keep current password)
                          </span>
                        </Label>
                        <Input
                          id="editPassword"
                          type="password"
                          value={editForm.password}
                          onChange={(e) => updateEditForm('password', e.target.value)}
                          placeholder="Enter new password or leave blank"
                          minLength={6}
                        />
                      </div>
                    </TabsContent>
      
                    <TabsContent value="contact" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editPhone">Phone *</Label>
                          <Input
                            id="editPhone"
                            value={editForm.contactDetails.phone}
                            onChange={(e) => updateEditForm('contactDetails.phone', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="editAlternatePhone">Alternate Phone</Label>
                          <Input
                            id="editAlternatePhone"
                            value={editForm.contactDetails.alternatePhone}
                            onChange={(e) => updateEditForm('contactDetails.alternatePhone', e.target.value)}
                          />
                        </div>
                      </div>
      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Address</h3>
                        <div>
                          <Label htmlFor="editStreet">Street</Label>
                          <Input
                            id="editStreet"
                            value={editForm.contactDetails.address.street}
                            onChange={(e) => updateEditForm('contactDetails.address.street', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="editCity">City</Label>
                            <Input
                              id="editCity"
                              value={editForm.contactDetails.address.city}
                              onChange={(e) => updateEditForm('contactDetails.address.city', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editState">State</Label>
                            <Input
                              id="editState"
                              value={editForm.contactDetails.address.state}
                              onChange={(e) => updateEditForm('contactDetails.address.state', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="editZipCode">Zip Code</Label>
                            <Input
                              id="editZipCode"
                              value={editForm.contactDetails.address.zipCode}
                              onChange={(e) => updateEditForm('contactDetails.address.zipCode', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editCountry">Country</Label>
                            <Input
                              id="editCountry"
                              value={editForm.contactDetails.address.country}
                              onChange={(e) => updateEditForm('contactDetails.address.country', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Emergency Contact</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="editEmergencyName">Name</Label>
                            <Input
                              id="editEmergencyName"
                              value={editForm.contactDetails.emergencyContact.name}
                              onChange={(e) => updateEditForm('contactDetails.emergencyContact.name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editRelationship">Relationship</Label>
                            <Input
                              id="editRelationship"
                              value={editForm.contactDetails.emergencyContact.relationship}
                              onChange={(e) => updateEditForm('contactDetails.emergencyContact.relationship', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="editEmergencyPhone">Phone</Label>
                            <Input
                              id="editEmergencyPhone"
                              value={editForm.contactDetails.emergencyContact.phone}
                              onChange={(e) => updateEditForm('contactDetails.emergencyContact.phone', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editEmergencyAlternatePhone">Alternate Phone</Label>
                            <Input
                              id="editEmergencyAlternatePhone"
                              value={editForm.contactDetails.emergencyContact.alternatePhone}
                              onChange={(e) => updateEditForm('contactDetails.emergencyContact.alternatePhone', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
      
                    <TabsContent value="job" className="space-y-4">
                      <div>
                        <Label htmlFor="editDepartment">Department *</Label>
                        <Select
                          value={editForm.jobInfo.departmentId || ""}
                          onValueChange={(value) => {
                            updateEditForm('jobInfo.departmentId', value);
                            // Reset position when department changes
                            updateEditForm('jobInfo.positionId', '');
                          }}
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
                        <Label htmlFor="editPosition">Position *</Label>
                        <Select
                          value={editForm.jobInfo.positionId || ""}
                          onValueChange={(value) => {
                            updateEditForm('jobInfo.positionId', value);
                          }}
                          disabled={!editForm.jobInfo.departmentId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              !editForm.jobInfo.departmentId 
                                ? "Select department first" 
                                : "Select Position"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {positions
                              .filter(pos => {
                                const posDeptId = typeof pos.departmentId === 'string' 
                                  ? pos.departmentId 
                                  : pos.departmentId._id;
                                return posDeptId === editForm.jobInfo.departmentId;
                              })
                              .map((position) => (
                                <SelectItem key={position._id} value={position._id}>
                                  {position.title} - {position.role}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        
                        {!editForm.jobInfo.departmentId && (
                          <p className="text-sm text-muted-foreground">
                            Please select a department first to see available positions
                          </p>
                        )}
                        
                        {editForm.jobInfo.departmentId && (
                          <p className="text-sm text-muted-foreground">
                            {positions.filter(pos => {
                              const posDeptId = typeof pos.departmentId === 'string' 
                                ? pos.departmentId 
                                : pos.departmentId._id;
                              return posDeptId === editForm.jobInfo.departmentId;
                            }).length} positions available in selected department
                          </p>
                        )}
                      </div>
      
                      {/* Show selected role from position */}
                      {editForm.jobInfo.positionId && (
                        <div>
                          <Label>Role (from position)</Label>
                          <div className="p-2 bg-muted rounded-md">
                            <Badge variant="outline">
                              {positions.find(p => p._id === editForm.jobInfo.positionId)?.role || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                      )}
      
                      <div>
                        <Label htmlFor="editManager">Manager (Optional)</Label>
                        <Select
                          value={editForm.jobInfo.managerId || "none"}
                          onValueChange={(value) => {
                            updateEditForm('jobInfo.managerId', value === 'none' ? '' : value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Manager (Optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Manager</SelectItem>
                            {managers
                              .filter(manager => manager._id !== editingEmployee?._id) // Don't allow self as manager
                              .map((manager) => (
                              <SelectItem key={manager._id} value={manager._id}>
                                {manager.firstName} {manager.lastName} - {manager.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
      
                    <TabsContent value="compensation" className="space-y-4">
                      <div>
                        <Label htmlFor="editWage">Wage/Salary *</Label>
                        <Input
                          id="editWage"
                          type="number"
                          value={editForm.compensation.wage}
                          onChange={(e) => updateEditForm('compensation.wage', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="editPayPeriod">Pay Period *</Label>
                        <Select
                          value={editForm.compensation.payPeriod}
                          onValueChange={(value) => updateEditForm('compensation.payPeriod', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Annual">Annual</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>

                    <TabsContent value="deductions" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tax</Label>
                          <Input
                            type="number"
                            value={editForm.compensation.deductions.tax}
                            onChange={(e) => updateEditForm('compensation.deductions.tax', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Social Security</Label>
                          <Input
                            type="number"
                            value={editForm.compensation.deductions.socialSecurity}
                            onChange={(e) => updateEditForm('compensation.deductions.socialSecurity', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Medicare</Label>
                          <Input
                            type="number"
                            value={editForm.compensation.deductions.medicare}
                            onChange={(e) => updateEditForm('compensation.deductions.medicare', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Insurance</Label>
                          <Input
                            type="number"
                            value={editForm.compensation.deductions.insurance}
                            onChange={(e) => updateEditForm('compensation.deductions.insurance', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Retirement</Label>
                          <Input
                            type="number"
                            value={editForm.compensation.deductions.retirement}
                            onChange={(e) => updateEditForm('compensation.deductions.retirement', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
      
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        resetEditForm();
                        setIsEditDialogOpen(false);
                        setEditingEmployee(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Employee'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Employees ({filteredEmployees.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Team Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.role}</Badge>
                  </TableCell>
                  <TableCell>{employee.jobInfo.departmentId?.name}</TableCell>
                  <TableCell>{employee.jobInfo.positionId?.title}</TableCell>
                  <TableCell>
                    {employee.jobInfo.managerId ? (
                      <span>{employee.jobInfo.managerId.firstName} {employee.jobInfo.managerId.lastName}</span>
                    ) : (
                      <Badge variant="secondary" className="flex items-center space-x-1 w-fit">
                        <UserX className="h-3 w-3" />
                        <span>No Manager</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {['Manager', 'Admin'].includes(employee.role) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewTeamMembers(employee)}
                      >
                        View Team
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm"
                        onClick={() => handleEditEmployee(employee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    {employees.length === 0 
                      ? 'No employees found.' 
                      : 'No employees match the current filters.'
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Team Members Dialog */}
      <Dialog open={teamMembersDialog.open} onOpenChange={(open) => setTeamMembersDialog({ ...teamMembersDialog, open })}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Team Members - {teamMembersDialog.employee?.firstName} {teamMembersDialog.employee?.lastName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {teamMembersDialog.teamMembers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembersDialog.teamMembers.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>{member.firstName} {member.lastName}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.role}</Badge>
                      </TableCell>
                      <TableCell>{member.jobInfo.positionId?.title}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                This employee doesn't manage any team members.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeListPage;