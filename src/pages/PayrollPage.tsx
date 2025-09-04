import React, { useState } from 'react';
import { Download, DollarSign, TrendingUp, Users, Calendar, FileText, Edit, Eye, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface EmployeePayroll {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  payPeriod: string;
  hoursWorked: number;
  regularHours: number;
  overtimeHours: number;
  hourlyRate: number;
  overtimeRate: number;
  grossPay: number;
  deductions: {
    tax: number;
    socialSecurity: number;
    medicare: number;
    insurance: number;
    retirement: number;
  };
  netPay: number;
  bonuses: number;
  status: 'draft' | 'pending' | 'approved' | 'paid';
  payDate: string;
}

const mockPayrollData: EmployeePayroll[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'John Smith',
    department: 'Customer Service',
    position: 'Representative',
    payPeriod: 'Jan 1-15, 2024',
    hoursWorked: 80,
    regularHours: 72,
    overtimeHours: 8,
    hourlyRate: 25.00,
    overtimeRate: 37.50,
    grossPay: 2100.00,
    deductions: {
      tax: 315.00,
      socialSecurity: 130.20,
      medicare: 30.45,
      insurance: 125.00,
      retirement: 105.00
    },
    netPay: 1394.35,
    bonuses: 200.00,
    status: 'approved',
    payDate: '2024-01-16'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: 'Alice Johnson',
    department: 'Sales',
    position: 'Sales Associate',
    payPeriod: 'Jan 1-15, 2024',
    hoursWorked: 80,
    regularHours: 80,
    overtimeHours: 0,
    hourlyRate: 22.00,
    overtimeRate: 33.00,
    grossPay: 1760.00,
    deductions: {
      tax: 264.00,
      socialSecurity: 109.12,
      medicare: 25.52,
      insurance: 125.00,
      retirement: 88.00
    },
    netPay: 1148.36,
    bonuses: 0,
    status: 'pending',
    payDate: '2024-01-16'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: 'Bob Wilson',
    department: 'IT',
    position: 'Developer',
    payPeriod: 'Jan 1-15, 2024',
    hoursWorked: 80,
    regularHours: 76,
    overtimeHours: 4,
    hourlyRate: 35.00,
    overtimeRate: 52.50,
    grossPay: 2870.00,
    deductions: {
      tax: 430.50,
      socialSecurity: 177.94,
      medicare: 41.62,
      insurance: 150.00,
      retirement: 143.50
    },
    netPay: 1926.44,
    bonuses: 500.00,
    status: 'draft',
    payDate: '2024-01-16'
  }
];

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
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const PayrollDetailDialog = ({ payroll }: { payroll: EmployeePayroll }) => {
  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Payroll Details - {payroll.employeeName}</DialogTitle>
        <DialogDescription>
          Pay period: {payroll.payPeriod}
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
              <span className="text-muted-foreground">Department:</span>
              <span className="ml-2">{payroll.department}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Position:</span>
              <span className="ml-2">{payroll.position}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Pay Date:</span>
              <span className="ml-2">{payroll.payDate}</span>
            </div>
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
                <TableCell>{formatCurrency(payroll.hourlyRate)}</TableCell>
                <TableCell className="text-right">{formatCurrency(payroll.regularHours * payroll.hourlyRate)}</TableCell>
              </TableRow>
              {payroll.overtimeHours > 0 && (
                <TableRow>
                  <TableCell>Overtime Hours</TableCell>
                  <TableCell>{payroll.overtimeHours}</TableCell>
                  <TableCell>{formatCurrency(payroll.overtimeRate)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(payroll.overtimeHours * payroll.overtimeRate)}</TableCell>
                </TableRow>
              )}
              {payroll.bonuses > 0 && (
                <TableRow>
                  <TableCell>Bonuses</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="text-right">{formatCurrency(payroll.bonuses)}</TableCell>
                </TableRow>
              )}
              <TableRow className="font-medium bg-muted/50">
                <TableCell>Gross Pay</TableCell>
                <TableCell>{payroll.hoursWorked}</TableCell>
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
                <TableCell>Federal Tax</TableCell>
                <TableCell className="text-right">-{formatCurrency(payroll.deductions.tax)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Social Security</TableCell>
                <TableCell className="text-right">-{formatCurrency(payroll.deductions.socialSecurity)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Medicare</TableCell>
                <TableCell className="text-right">-{formatCurrency(payroll.deductions.medicare)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Health Insurance</TableCell>
                <TableCell className="text-right">-{formatCurrency(payroll.deductions.insurance)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>401(k) Retirement</TableCell>
                <TableCell className="text-right">-{formatCurrency(payroll.deductions.retirement)}</TableCell>
              </TableRow>
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

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Payroll
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Generate Payslip
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export const PayrollPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filteredPayroll = mockPayrollData.filter(payroll => {
    const matchesSearch = payroll.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payroll.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payroll.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || payroll.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const totalGrossPay = mockPayrollData.reduce((sum, payroll) => sum + payroll.grossPay, 0);
  const totalNetPay = mockPayrollData.reduce((sum, payroll) => sum + payroll.netPay, 0);
  const totalEmployees = mockPayrollData.length;
  const averagePay = totalNetPay / totalEmployees;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage employee payroll and compensation
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Payroll
          </Button>
          <Button>
            Process Payroll
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
            <p className="text-xs text-muted-foreground">
              Current pay period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Net Pay</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalNetPay)}</div>
            <p className="text-xs text-muted-foreground">
              After deductions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Average Pay</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averagePay)}</div>
            <p className="text-xs text-muted-foreground">
              Per employee
            </p>
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
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>
            Current pay period: January 1-15, 2024
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayroll.map((payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payroll.employeeName}</div>
                      <div className="text-sm text-muted-foreground">{payroll.employeeId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{payroll.department}</TableCell>
                  <TableCell>
                    <div>{payroll.hoursWorked}h</div>
                    {payroll.overtimeHours > 0 && (
                      <div className="text-sm text-muted-foreground">
                        +{payroll.overtimeHours}h OT
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(payroll.grossPay)}</TableCell>
                  <TableCell>{formatCurrency(payroll.netPay)}</TableCell>
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
                      
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
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