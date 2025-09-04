import React, { useState } from 'react';
import { Download, Eye, DollarSign, TrendingUp, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

interface Payslip {
  id: string;
  payPeriod: string;
  payDate: string;
  grossPay: number;
  netPay: number;
  hoursWorked: number;
  hourlyRate: number;
  overtime: number;
  overtimeRate: number;
  deductions: {
    tax: number;
    socialSecurity: number;
    medicare: number;
    healthInsurance: number;
    retirement: number;
  };
  bonuses: number;
  status: 'paid' | 'pending' | 'processing';
}

const mockPayslips: Payslip[] = [
  {
    id: '1',
    payPeriod: 'Jan 1 - Jan 15, 2024',
    payDate: '2024-01-16',
    grossPay: 2400.00,
    netPay: 1852.50,
    hoursWorked: 80,
    hourlyRate: 25.00,
    overtime: 8,
    overtimeRate: 37.50,
    deductions: {
      tax: 360.00,
      socialSecurity: 148.80,
      medicare: 34.80,
      healthInsurance: 125.00,
      retirement: 120.00
    },
    bonuses: 200.00,
    status: 'paid'
  },
  {
    id: '2',
    payPeriod: 'Dec 16 - Dec 31, 2023',
    payDate: '2024-01-02',
    grossPay: 2200.00,
    netPay: 1698.50,
    hoursWorked: 72,
    hourlyRate: 25.00,
    overtime: 4,
    overtimeRate: 37.50,
    deductions: {
      tax: 330.00,
      socialSecurity: 136.40,
      medicare: 31.90,
      healthInsurance: 125.00,
      retirement: 110.00
    },
    bonuses: 350.00,
    status: 'paid'
  },
  {
    id: '3',
    payPeriod: 'Dec 1 - Dec 15, 2023',
    payDate: '2023-12-16',
    grossPay: 2000.00,
    netPay: 1545.00,
    hoursWorked: 80,
    hourlyRate: 25.00,
    overtime: 0,
    overtimeRate: 37.50,
    deductions: {
      tax: 300.00,
      socialSecurity: 124.00,
      medicare: 29.00,
      healthInsurance: 125.00,
      retirement: 100.00
    },
    bonuses: 0,
    status: 'paid'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const PayslipDetailDialog = ({ payslip }: { payslip: Payslip }) => {
  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Payslip Details</DialogTitle>
        <DialogDescription>
          Pay period: {payslip.payPeriod}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Employee Info */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Employee Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Employee ID:</span>
              <span className="ml-2">EMP001</span>
            </div>
            <div>
              <span className="text-muted-foreground">Department:</span>
              <span className="ml-2">Customer Service</span>
            </div>
            <div>
              <span className="text-muted-foreground">Pay Date:</span>
              <span className="ml-2">{formatDate(payslip.payDate)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Pay Period:</span>
              <span className="ml-2">{payslip.payPeriod}</span>
            </div>
          </div>
        </div>

        {/* Earnings */}
        <div>
          <h4 className="font-medium mb-3">Earnings</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Hours/Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Regular Pay</TableCell>
                <TableCell>{payslip.hoursWorked}h @ {formatCurrency(payslip.hourlyRate)}/hr</TableCell>
                <TableCell className="text-right">{formatCurrency(payslip.hoursWorked * payslip.hourlyRate)}</TableCell>
              </TableRow>
              {payslip.overtime > 0 && (
                <TableRow>
                  <TableCell>Overtime Pay</TableCell>
                  <TableCell>{payslip.overtime}h @ {formatCurrency(payslip.overtimeRate)}/hr</TableCell>
                  <TableCell className="text-right">{formatCurrency(payslip.overtime * payslip.overtimeRate)}</TableCell>
                </TableRow>
              )}
              {payslip.bonuses > 0 && (
                <TableRow>
                  <TableCell>Bonus/Commission</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="text-right">{formatCurrency(payslip.bonuses)}</TableCell>
                </TableRow>
              )}
              <TableRow className="font-medium">
                <TableCell>Gross Pay</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">{formatCurrency(payslip.grossPay)}</TableCell>
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
                <TableCell className="text-right">-{formatCurrency(payslip.deductions.tax)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Social Security</TableCell>
                <TableCell className="text-right">-{formatCurrency(payslip.deductions.socialSecurity)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Medicare</TableCell>
                <TableCell className="text-right">-{formatCurrency(payslip.deductions.medicare)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Health Insurance</TableCell>
                <TableCell className="text-right">-{formatCurrency(payslip.deductions.healthInsurance)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>401(k) Retirement</TableCell>
                <TableCell className="text-right">-{formatCurrency(payslip.deductions.retirement)}</TableCell>
              </TableRow>
              <TableRow className="font-medium">
                <TableCell>Total Deductions</TableCell>
                <TableCell className="text-right">
                  -{formatCurrency(
                    Object.values(payslip.deductions).reduce((sum, val) => sum + val, 0)
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Net Pay */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Net Pay</h4>
            <span className="text-2xl font-bold text-primary">{formatCurrency(payslip.netPay)}</span>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export const PayslipsPage = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  
  const currentYearPayslips = mockPayslips.filter(payslip => 
    payslip.payDate.startsWith(selectedYear)
  );
  
  const totalEarnings = mockPayslips.reduce((sum, payslip) => sum + payslip.netPay, 0);
  const averagePayslip = totalEarnings / mockPayslips.length;
  const totalHours = mockPayslips.reduce((sum, payslip) => sum + payslip.hoursWorked, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Payslips</h1>
          <p className="text-muted-foreground">
            View and download your pay stubs and earnings history
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Year to date
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Average Pay</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averagePayslip)}</div>
            <p className="text-xs text-muted-foreground">
              Per pay period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Hours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}h</div>
            <p className="text-xs text-muted-foreground">
              Hours worked
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Payslips</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPayslips.length}</div>
            <p className="text-xs text-muted-foreground">
              Available documents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payslips List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payslips</CardTitle>
          <CardDescription>
            Your latest pay stubs and earnings statements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPayslips.map((payslip) => (
              <div key={payslip.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{payslip.payPeriod}</h4>
                    <p className="text-sm text-muted-foreground">
                      Paid on {formatDate(payslip.payDate)} • {payslip.hoursWorked} hours
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(payslip.netPay)}</div>
                    <Badge className={getStatusColor(payslip.status)}>
                      {payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <PayslipDetailDialog payslip={payslip} />
                    </Dialog>
                    
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};