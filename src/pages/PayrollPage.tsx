import React, { useState, useEffect } from 'react';
import {
  Download,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Eye,
  Search,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

// Updated interface for Indian payroll
interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  jobInfo: {
    departmentId: {
      _id: string;
      name: string;
    };
    positionId: {
      title: string;
    };
  };
}

interface IndianDeductions {
  tax: number;
  pf: number;
  professionalTax: number;
  hra: number;
  medicalAllowance: number;
  specialAllowance: number;
  insurance?: number;
  retirement?: number;
}

interface EmployeePayroll {
  _id: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  position?: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  regularHours: number;
  overtimeHours: number;
  wage: number;
  overtimeRate: number;
  grossPay: number;
  deductions: IndianDeductions;
  netPay: number;
  finalBill: number;
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'paid':
      return 'bg-blue-100 text-blue-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN');
};

const PayrollDetailDialog = ({ payroll }: { payroll: EmployeePayroll }) => {
  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Payroll Details - {payroll.employeeName}</DialogTitle>
        <DialogDescription>
          Pay period: {formatDate(payroll.payPeriodStart)} to {formatDate(payroll.payPeriodEnd)}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        {/* Employee Info */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Employee Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Employee ID:</span>
              <span className="ml-2">{payroll.employeeId}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2">{payroll.employeeName}</span>
            </div>
            {payroll.department && (
              <div>
                <span className="text-muted-foreground">Department:</span>
                <span className="ml-2">{payroll.department}</span>
              </div>
            )}
            {payroll.position && (
              <div>
                <span className="text-muted-foreground">Position:</span>
                <span className="ml-2">{payroll.position}</span>
              </div>
            )}
          </div>
        </div>
        {/* Hours & Earnings */}
        <div>
          <h4 className="font-medium mb-3">Hours & Earnings</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Regular Hours</TableCell>
                <TableCell>{payroll.regularHours}</TableCell>
                <TableCell>{formatCurrency(payroll.wage)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(payroll.regularHours * payroll.wage)}
                </TableCell>
              </TableRow>
              {payroll.overtimeHours > 0 && (
                <TableRow>
                  <TableCell>Overtime Hours</TableCell>
                  <TableCell>{payroll.overtimeHours}</TableCell>
                  <TableCell>{formatCurrency(payroll.overtimeRate)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(payroll.overtimeHours * payroll.overtimeRate)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="font-medium bg-muted/50">
                <TableCell>Gross Pay</TableCell>
                <TableCell>{payroll.regularHours + payroll.overtimeHours}</TableCell>
                <TableCell>-</TableCell>
                <TableCell className="text-right">{formatCurrency(payroll.grossPay)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        {/* Deductions */}
        <div>
          <h4 className="font-medium mb-3">Deductions</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Income Tax</TableCell>
                <TableCell className="text-right">-{formatCurrency(payroll.deductions.tax)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Provident Fund (PF)</TableCell>
                <TableCell className="text-right">-{formatCurrency(payroll.deductions.pf)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Professional Tax</TableCell>
                <TableCell className="text-right">-{formatCurrency(payroll.deductions.professionalTax)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>House Rent Allowance (HRA)</TableCell>
                <TableCell className="text-right">-{formatCurrency(payroll.deductions.hra)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Medical Allowance</TableCell>
                <TableCell className="text-right">-{formatCurrency(payroll.deductions.medicalAllowance)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Special Allowance</TableCell>
                <TableCell className="text-right">-{formatCurrency(payroll.deductions.specialAllowance)}</TableCell>
              </TableRow>
              {payroll.deductions.insurance && (
                <TableRow>
                  <TableCell>Insurance</TableCell>
                  <TableCell className="text-right">-{formatCurrency(payroll.deductions.insurance)}</TableCell>
                </TableRow>
              )}
              {payroll.deductions.retirement && (
                <TableRow>
                  <TableCell>Retirement</TableCell>
                  <TableCell className="text-right">-{formatCurrency(payroll.deductions.retirement)}</TableCell>
                </TableRow>
              )}
              <TableRow className="font-medium bg-muted/50">
                <TableCell>Total Deductions</TableCell>
                <TableCell className="text-right">
                  -{formatCurrency(Object.values(payroll.deductions).reduce((sum, val) => sum + val, 0))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        {/* Net Pay */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Net Pay</h4>
            <span className="text-2xl font-bold text-primary">{formatCurrency(payroll.netPay)}</span>
          </div>
        </div>
        {/* Final Bill */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Final Bill</h4>
            <span className="text-2xl font-bold text-primary">{formatCurrency(payroll.finalBill)}</span>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export const PayrollPage = () => {
  const [payrollData, setPayrollData] = useState<EmployeePayroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payrollRes, employeesRes] = await Promise.all([
          fetch('http://localhost:5000/workDay/payslips'),
          fetch('http://localhost:5000/workDay/employees/all'),
        ]);
        const payrollData = await payrollRes.json();
        const employeesData = await employeesRes.json();

        // Extract unique departments
        const uniqueDepartments = Array.from(
          new Set(employeesData.map((emp: Employee) => emp.jobInfo.departmentId.name))
        );
        setDepartments(uniqueDepartments);

        const enrichedPayrollData = payrollData.map((payroll: EmployeePayroll) => {
          const employee = employeesData.find((emp: Employee) => emp._id === payroll.employeeId);
          return {
            ...payroll,
            employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
            department: employee ? employee.jobInfo.departmentId.name : 'Unknown',
            position: employee ? employee.jobInfo.positionId.title : 'Unknown',
          };
        });
        setPayrollData(enrichedPayrollData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPayroll = payrollData.filter((payroll) => {
    const matchesSearch =
      payroll.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payroll.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || payroll.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const totalGrossPay = payrollData.reduce((sum, payroll) => sum + payroll.grossPay, 0);
  const totalNetPay = payrollData.reduce((sum, payroll) => sum + payroll.netPay, 0);
  const totalEmployees = payrollData.length;
  const averagePay = totalNetPay / totalEmployees;

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:5000/workDay/payslips/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setPayrollData((prev) =>
          prev.map((payroll) =>
            payroll._id === id ? { ...payroll, status: newStatus } : payroll
          )
        );
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      const response = await fetch('http://localhost:5000/workDay/payslips/generate-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payPeriodStart: new Date(new Date().setDate(1)).toISOString(),
          payPeriodEnd: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        alert('Payroll generated successfully!');
        // Refresh data
        const [payrollRes, employeesRes] = await Promise.all([
          fetch('http://localhost:5000/workDay/payslips'),
          fetch('http://localhost:5000/workDay/employees/all'),
        ]);
        const payrollData = await payrollRes.json();
        const employeesData = await employeesRes.json();
        const enrichedPayrollData = payrollData.map((payroll: EmployeePayroll) => {
          const employee = employeesData.find((emp: Employee) => emp._id === payroll.employeeId);
          return {
            ...payroll,
            employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
            department: employee ? employee.jobInfo.departmentId.name : 'Unknown',
            position: employee ? employee.jobInfo.positionId.title : 'Unknown',
          };
        });
        setPayrollData(enrichedPayrollData);
      } else {
        alert('Failed to generate payroll');
      }
    } catch (error) {
      console.error('Error generating payroll:', error);
      alert('Error generating payroll');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Employee ID',
      'Employee Name',
      'Department',
      'Position',
      'Pay Period',
      'Regular Hours',
      'Overtime Hours',
      'Wage',
      'Gross Pay',
      'Net Pay',
      'Final Bill',
      'Status',
    ];
    const csvRows = filteredPayroll.map((payroll) => [
      payroll.employeeId,
      payroll.employeeName,
      payroll.department,
      payroll.position,
      `${formatDate(payroll.payPeriodStart)} to ${formatDate(payroll.payPeriodEnd)}`,
      payroll.regularHours,
      payroll.overtimeHours,
      formatCurrency(payroll.wage),
      formatCurrency(payroll.grossPay),
      formatCurrency(payroll.netPay),
      formatCurrency(payroll.finalBill),
      payroll.status,
    ]);
    const csvContent = [
      headers.join(','),
      ...csvRows.map((row) => row.join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'payroll_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Manage employee payroll and compensation</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export Payroll
          </Button>
          <Button onClick={handleGeneratePayroll}>
            Generate Payroll
          </Button>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Gross Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGrossPay)}</div>
            <p className="text-xs text-muted-foreground">Current pay period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Net Pay</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalNetPay)}</div>
            <p className="text-xs text-muted-foreground">After deductions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Average Pay</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averagePay)}</div>
            <p className="text-xs text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>
      </div>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>Current pay period</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead>Regular Hours</TableHead>
                <TableHead>Overtime Hours</TableHead>
                <TableHead>Wage</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Final Bill</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayroll.map((payroll) => {
                const finalBill = (payroll.overtimeHours * payroll.overtimeRate) + payroll.netPay;
                return (
                  <TableRow key={payroll._id}>
                    <TableCell>
                      <div className="font-medium">{payroll.employeeName}</div>
                      <div className="text-sm text-muted-foreground">{payroll.employeeId}</div>
                    </TableCell>
                    <TableCell>
                      {formatDate(payroll.payPeriodStart)} to {formatDate(payroll.payPeriodEnd)}
                    </TableCell>
                    <TableCell>{payroll.regularHours}h</TableCell>
                    <TableCell>{payroll.overtimeHours}h</TableCell>
                    <TableCell>{formatCurrency(payroll.wage)}</TableCell>
                    <TableCell>{formatCurrency(payroll.grossPay)}</TableCell>
                    <TableCell>{formatCurrency(payroll.netPay)}</TableCell>
                    <TableCell>{formatCurrency(finalBill)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payroll.status)}>
                        {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <PayrollDetailDialog payroll={payroll} />
                        </Dialog>
                        {payroll.status === 'draft' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleStatusChange(payroll._id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleStatusChange(payroll._id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
