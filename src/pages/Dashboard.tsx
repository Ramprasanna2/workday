import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Calendar, 
  FileText, 
  Users, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Target
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.name}!`;
  };

  const employeeStats = {
    todayShift: { start: '09:00', end: '17:00', status: 'scheduled' },
    leaveBalance: 12,
    pendingRequests: 2,
    thisWeekHours: 32,
    activeGoals: 3,
    completedGoals: 2,
  };

  const managerStats = {
    teamSize: 15,
    pendingApprovals: 5,
    todayAttendance: 12,
    teamLeaveRequests: 3,
    assignedGoals: 8,
    completedGoals: 5,
  };

  const adminStats = {
    totalEmployees: 156,
    activeShifts: 45,
    pendingApprovals: 12,
    payrollDue: 3,
  };

  const renderEmployeeDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Shift</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {employeeStats.todayShift.start} - {employeeStats.todayShift.end}
          </div>
          <p className="text-xs text-muted-foreground">
            <Badge variant="outline" className="mt-1">Scheduled</Badge>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{employeeStats.activeGoals}</div>
          <p className="text-xs text-muted-foreground">{employeeStats.completedGoals} completed this quarter</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{employeeStats.leaveBalance} days</div>
          <p className="text-xs text-muted-foreground">Available this year</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{employeeStats.thisWeekHours}h</div>
          <p className="text-xs text-muted-foreground">Hours worked</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderManagerDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Size</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{managerStats.teamSize}</div>
          <p className="text-xs text-muted-foreground">Direct reports</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assigned Goals</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{managerStats.assignedGoals}</div>
          <p className="text-xs text-muted-foreground">{managerStats.completedGoals} completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{managerStats.todayAttendance}/{managerStats.teamSize}</div>
          <p className="text-xs text-muted-foreground">Present today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{managerStats.pendingApprovals}</div>
          <p className="text-xs text-muted-foreground">Require attention</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminStats.totalEmployees}</div>
          <p className="text-xs text-muted-foreground">Active employees</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminStats.activeShifts}</div>
          <p className="text-xs text-muted-foreground">Currently scheduled</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminStats.pendingApprovals}</div>
          <p className="text-xs text-muted-foreground">Across all departments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payroll Due</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminStats.payrollDue} days</div>
          <p className="text-xs text-muted-foreground">Next processing</p>
        </CardContent>
      </Card>
    </div>
  );

  const getQuickActions = () => {
    switch (user?.role) {
      case 'Employee':
        return [
          { label: 'Clock In/Out', href: '/dashboard/attendance', variant: 'default' as const },
          { label: 'My Goals', href: '/dashboard/my-goals', variant: 'outline' as const },
          { label: 'Request Leave', href: '/dashboard/leave-requests', variant: 'outline' as const },
          { label: 'View Schedule', href: '/dashboard/shifts', variant: 'outline' as const },
        ];
      case 'Manager':
        return [
          { label: 'Assign Goals', href: '/dashboard/goals', variant: 'default' as const },
          { label: 'Review Approvals', href: '/dashboard/approvals', variant: 'outline' as const },
          { label: 'Team Attendance', href: '/dashboard/team-attendance', variant: 'outline' as const },
          { label: 'View Reports', href: '/dashboard/reports', variant: 'outline' as const },
        ];
      case 'Admin':
        return [
          { label: 'Manage Employees', href: '/dashboard/employees', variant: 'default' as const },
          { label: 'Goal Management', href: '/dashboard/goals', variant: 'outline' as const },
          { label: 'Shift Management', href: '/dashboard/shift-management', variant: 'outline' as const },
          { label: 'Process Payroll', href: '/dashboard/payroll', variant: 'outline' as const },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">{getWelcomeMessage()}</h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your workforce today.
        </p>
      </div>

      {/* Stats Cards */}
      {user?.role === 'Employee' && renderEmployeeDashboard()}
      {user?.role === 'Manager' && renderManagerDashboard()}
      {user?.role === 'Admin' && renderAdminDashboard()}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts for your role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {getQuickActions().map((action, index) => (
              <Button key={index} asChild variant={action.variant}>
                <Link to={action.href}>
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user?.role === 'Employee' && (
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">New goal assigned: Complete React Training Module</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            )}
            {user?.role === 'Manager' && (
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">John Smith completed their mentorship goal</p>
                  <p className="text-xs text-muted-foreground">30 minutes ago</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Your leave request has been approved</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">New shift assignment available</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Monthly payslip generated</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};