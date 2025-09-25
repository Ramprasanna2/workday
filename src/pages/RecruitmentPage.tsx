import React, { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { UserCheck, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Candidate {
  _id: string;
  name: string;
  email: string;
  role: string;
  experience: string;
  status: string;
  atsScore: number;
}

interface Department {
  _id: string;
  name: string;
  employeeCount: number;
}

interface Position {
  _id: string;
  title: string;
  departmentId: string | { _id: string; name: string; employeeCount: number };
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

interface EmployeeForm {
  firstName: string;
  lastName: string;
  employeeId:string;
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

export const RecruitmentPage: React.FC = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [isCreateEmployeeDialogOpen, setIsCreateEmployeeDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

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
      payPeriod: 'Monthly',
      deductions: {
        tax: 0,
        socialSecurity: 0,
        medicare: 0,
        insurance: 0,
        retirement: 0,
      },
    },
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [candidatesRes, deptsRes, positionsRes, managersRes] = await Promise.all([
          axios.get('http://localhost:5000/workDay/candidates'),
          axios.get('http://localhost:5000/workDay/admin/departments'),
          axios.get('http://localhost:5000/workDay/admin/positions'),
          axios.get('http://localhost:5000/workDay/employees/managers'),
        ]);
        const filteredCandidates = candidatesRes.data.filter(
          (c: Candidate) => c.employeeId === user?.employeeId
        );
        setCandidates(filteredCandidates);
        setDepartments(deptsRes.data);
        setPositions(positionsRes.data);
        setManagers(managersRes.data);
      } catch (error) {
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    if (user?.employeeId) fetchData();
  }, [user?.employeeId]);

  const handleAcceptCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setEmployeeForm({
      firstName: candidate.name.split(' ')[0] || '',
      lastName: candidate.name.split(' ')[1] || '',
      email: candidate.email,
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
        payPeriod: 'Monthly',
        deductions: {
          tax: 0,
          socialSecurity: 0,
          medicare: 0,
          insurance: 0,
          retirement: 0,
        },
      },
    });
    setIsCreateEmployeeDialogOpen(true);
  };

  const updateForm = (field: string, value: any) => {
    const fields = field.split('.');
    setEmployeeForm((prev) => {
      if (fields.length === 1) {
        return { ...prev, [field]: value };
      } else if (fields.length === 2) {
        return {
          ...prev,
          [fields[0]]: {
            ...(prev[fields[0] as keyof EmployeeForm] as any),
            [fields[1]]: value,
          },
        };
      } else if (fields.length === 3) {
        return {
          ...prev,
          [fields[0]]: {
            ...(prev[fields[0] as keyof EmployeeForm] as any),
            [fields[1]]: {
              ...((prev[fields[0] as keyof EmployeeForm] as any)[fields[1]] as any),
              [fields[2]]: value,
            },
          },
        };
      } else if (fields.length === 4) {
        return {
          ...prev,
          [fields[0]]: {
            ...(prev[fields[0] as keyof EmployeeForm] as any),
            [fields[1]]: {
              ...((prev[fields[0] as keyof EmployeeForm] as any)[fields[1]] as any),
              [fields[2]]: {
                ...((prev[fields[0] as keyof EmployeeForm] as any)[fields[1]][fields[2]] as any),
                [fields[3]]: value,
              },
            },
          },
        };
      }
      return prev;
    });
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validation
      if (!employeeForm.jobInfo.departmentId) {
        toast.error('Please select a department');
        return;
      }

      if (!employeeForm.jobInfo.positionId) {
        toast.error('Please select a position');
        return;
      }

      const selectedPosition = positions.find(p => p._id === employeeForm.jobInfo.positionId);
      if (!selectedPosition) {
        toast.error('Invalid position selected');
        return;
      }

      const posDeptId = typeof selectedPosition.departmentId === 'string'
        ? selectedPosition.departmentId
        : selectedPosition.departmentId._id;

      if (posDeptId !== employeeForm.jobInfo.departmentId) {
        toast.error('Selected position does not belong to the selected department');
        return;
      }

      if (!employeeForm.firstName || !employeeForm.lastName || !employeeForm.email || !employeeForm.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      const payload = {
        ...employeeForm,
        role: selectedPosition.role,
      };

      const response = await axios.post('http://localhost:5000/workDay/employees/create', payload);
      if (response.status === 201) {
        toast.success('Employee created successfully!');
        setIsCreateEmployeeDialogOpen(false);
        await axios.post(`http://localhost:5000/workDay/candidates/${selectedCandidate?._id}/status`, {
          status: 'Selected',
        });
        setCandidates((prev) =>
          prev.map((c) =>
            c._id === selectedCandidate?._id ? { ...c, status: 'Selected' } : c
          )
        );
      }
    } catch (error) {
      toast.error('Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidate Management</h1>
          <p className="text-muted-foreground">Manage and review your candidates</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/recruiting/onboarding')}>
          <UserCheck className="h-4 w-4 mr-2" />
          Onboarding Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Candidates ({candidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-8">No candidates found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ATS Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate._id}>
                    <TableCell>
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-xs text-muted-foreground">{candidate.experience}</div>
                    </TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{candidate.role}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          candidate.status === 'Shortlisted'
                            ? 'bg-green-100 text-green-800'
                            : candidate.status === 'Selected'
                            ? 'bg-blue-100 text-blue-800'
                            : candidate.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : ''
                        }
                      >
                        {candidate.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{candidate.atsScore}%</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleAcceptCandidate(candidate)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                          disabled={candidate.status === 'Selected'}
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={async () =>
                            await axios.post(`http://localhost:5000/workDay/candidates/${candidate._id}/status`, {
                              status: 'Rejected',
                            })
                          }
                          className="bg-red-500 hover:bg-red-600 text-white"
                          disabled={candidate.status === 'Rejected'}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateEmployeeDialogOpen} onOpenChange={setIsCreateEmployeeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Employee from Candidate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEmployee} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    <Label>First Name</Label>
                    <Input
                      value={employeeForm.firstName}
                      onChange={(e) => updateForm('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={employeeForm.lastName}
                      onChange={(e) => updateForm('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={employeeForm.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={employeeForm.contactDetails.phone}
                      onChange={(e) => updateForm('contactDetails.phone', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Alternate Phone</Label>
                    <Input
                      value={employeeForm.contactDetails.alternatePhone}
                      onChange={(e) => updateForm('contactDetails.alternatePhone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address</h3>
                  <div>
                    <Label>Street</Label>
                    <Input
                      value={employeeForm.contactDetails.address.street}
                      onChange={(e) => updateForm('contactDetails.address.street', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={employeeForm.contactDetails.address.city}
                        onChange={(e) => updateForm('contactDetails.address.city', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        value={employeeForm.contactDetails.address.state}
                        onChange={(e) => updateForm('contactDetails.address.state', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Zip Code</Label>
                      <Input
                        value={employeeForm.contactDetails.address.zipCode}
                        onChange={(e) => updateForm('contactDetails.address.zipCode', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input
                        value={employeeForm.contactDetails.address.country}
                        onChange={(e) => updateForm('contactDetails.address.country', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={employeeForm.contactDetails.emergencyContact.name}
                        onChange={(e) => updateForm('contactDetails.emergencyContact.name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Input
                        value={employeeForm.contactDetails.emergencyContact.relationship}
                        onChange={(e) => updateForm('contactDetails.emergencyContact.relationship', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={employeeForm.contactDetails.emergencyContact.phone}
                        onChange={(e) => updateForm('contactDetails.emergencyContact.phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Alternate Phone</Label>
                      <Input
                        value={employeeForm.contactDetails.emergencyContact.alternatePhone}
                        onChange={(e) => updateForm('contactDetails.emergencyContact.alternatePhone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="job" className="space-y-4">
                <div>
                  <Label>Department</Label>
                  <Select
                    value={employeeForm.jobInfo.departmentId}
                    onValueChange={(value) => {
                      updateForm('jobInfo.departmentId', value);
                      updateForm('jobInfo.positionId', '');
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
                  <Label>Position</Label>
                  <Select
                    value={employeeForm.jobInfo.positionId}
                    onValueChange={(value) => updateForm('jobInfo.positionId', value)}
                    disabled={!employeeForm.jobInfo.departmentId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions
                        .filter(
                          (pos) =>
                            (typeof pos.departmentId === 'string'
                              ? pos.departmentId
                              : pos.departmentId._id) === employeeForm.jobInfo.departmentId
                        )
                        .map((pos) => (
                          <SelectItem key={pos._id} value={pos._id}>
                            {pos.title} - {pos.role}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Manager (Optional)</Label>
                  <Select
                    value={employeeForm.jobInfo.managerId || 'none'}
                    onValueChange={(value) => updateForm('jobInfo.managerId', value === 'none' ? '' : value)}
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
                  <Label>Wage/Salary</Label>
                  <Input
                    type="number"
                    value={employeeForm.compensation.wage}
                    onChange={(e) => updateForm('compensation.wage', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <Label>Pay Period</Label>
                  <Select
                    value={employeeForm.compensation.payPeriod}
                    onValueChange={(value) => updateForm('compensation.payPeriod', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
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
                      onChange={(e) => updateForm('compensation.deductions.tax', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Social Security</Label>
                    <Input
                      type="number"
                      value={employeeForm.compensation.deductions.socialSecurity}
                      onChange={(e) => updateForm('compensation.deductions.socialSecurity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Medicare</Label>
                    <Input
                      type="number"
                      value={employeeForm.compensation.deductions.medicare}
                      onChange={(e) => updateForm('compensation.deductions.medicare', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Insurance</Label>
                    <Input
                      type="number"
                      value={employeeForm.compensation.deductions.insurance}
                      onChange={(e) => updateForm('compensation.deductions.insurance', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Retirement</Label>
                    <Input
                      type="number"
                      value={employeeForm.compensation.deductions.retirement}
                      onChange={(e) => updateForm('compensation.deductions.retirement', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateEmployeeDialogOpen(false)}
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
  );
};

export default RecruitmentPage;
