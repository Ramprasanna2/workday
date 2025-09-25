import React, { useState, useEffect } from 'react';
import { Eye, DollarSign, TrendingUp, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';

interface Payslip {
  _id: string;
  employeeId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  grossPay: number;
  netPay: number;
  hoursWorked: number;
  hourlyRate: number;
  overtimeHours: number;
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
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
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
          Pay period: {formatDate(payslip.payPeriodStart)} - {formatDate(payslip.payPeriodEnd)}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        {/* Employee Info */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Employee Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Employee ID:</span>
              <span className="ml-2">{payslip.employeeId}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Pay Date:</span>
              <span className="ml-2">{formatDate(payslip.payDate)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Pay Period:</span>
              <span className="ml-2">
                {formatDate(payslip.payPeriodStart)} - {formatDate(payslip.payPeriodEnd)}
              </span>
            </div>
          </div>
        </div>
        {/* Earnings */}
        <div>
          <h4 className="font-medium mb-3">Earnings</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours/Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Regular Pay</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payslip.hoursWorked}h @ {formatCurrency(payslip.hourlyRate)}/hr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {formatCurrency(payslip.hoursWorked * payslip.hourlyRate)}
                  </td>
                </tr>
                {payslip.overtimeHours > 0 && (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">Overtime Pay</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payslip.overtimeHours}h @ {formatCurrency(payslip.overtimeRate)}/hr
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {formatCurrency(payslip.overtimeHours * payslip.overtimeRate)}
                    </td>
                  </tr>
                )}
                {payslip.bonuses > 0 && (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">Bonus/Commission</td>
                    <td className="px-6 py-4 whitespace-nowrap">-</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {formatCurrency(payslip.bonuses)}
                    </td>
                  </tr>
                )}
                <tr className="font-medium">
                  <td className="px-6 py-4 whitespace-nowrap">Gross Pay</td>
                  <td className="px-6 py-4 whitespace-nowrap"></td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {formatCurrency(payslip.grossPay)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Deductions */}
        <div>
          <h4 className="font-medium mb-3">Deductions</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Federal Tax</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    -{formatCurrency(payslip.deductions.tax)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Social Security</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    -{formatCurrency(payslip.deductions.socialSecurity)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Medicare</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    -{formatCurrency(payslip.deductions.medicare)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Health Insurance</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    -{formatCurrency(payslip.deductions.healthInsurance)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">401(k) Retirement</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    -{formatCurrency(payslip.deductions.retirement)}
                  </td>
                </tr>
                <tr className="font-medium">
                  <td className="px-6 py-4 whitespace-nowrap">Total Deductions</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    -{formatCurrency(Object.values(payslip.deductions).reduce((sum, val) => sum + val, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Net Pay */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Net Pay</h4>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(payslip.netPay)}
            </span>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export const PayslipsPage = () => {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayslips = async () => {
      if (!user?.employeeId) return;
      try {
        const response = await fetch(
          `http://localhost:5000/workDay/payslips/employee/${user.employeeId}`
        );
        const data = await response.json();
        setPayslips(data);
      } catch (error) {
        console.error('Error fetching payslips:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, [user?.employeeId]);

  const totalEarnings = payslips.reduce((sum, payslip) => sum + payslip.netPay, 0);
  const averagePayslip = payslips.length > 0 ? totalEarnings / payslips.length : 0;

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Payslips</h1>
          <p className="text-muted-foreground">
            View and download your pay stubs and earnings history
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Average Pay</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averagePayslip)}</div>
            <p className="text-xs text-muted-foreground">Per pay period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Payslips</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payslips.length}</div>
            <p className="text-xs text-muted-foreground">Available documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payslips */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payslips</CardTitle>
          <CardDescription>Your latest pay stubs and earnings statements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payslips.length > 0 ? (
              payslips.map((payslip) => (
                <div key={payslip._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {formatDate(payslip.payPeriodStart)} - {formatDate(payslip.payPeriodEnd)}
                      </h4>
                      
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(payslip.netPay)}</div>
                      <Badge className={getStatusColor(payslip.status)}>
                        {payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1)}
                      </Badge>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <PayslipDetailDialog payslip={payslip} />
                    </Dialog>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No payslips found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
