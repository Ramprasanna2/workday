import React, { useState, useEffect } from 'react';
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

// Define interfaces for our data
interface Shift {
  start: string;
  end: string;
  status: string;
}

interface Goal {
  _id: string;
  title: string;
  status: string;
  progress: number;
}

interface LeaveBalance {
  annual: number;
  sick: number;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  createdAt: string;
  icon: 'Target' | 'CheckCircle' | 'AlertCircle' | 'FileText';
}

interface DashboardStats {
  teamSize?: number;
  pendingApprovals?: number;
  todayAttendance?: number;
  teamLeaveRequests?: number;
  assignedGoals?: number;
  completedGoals?: number;
  totalEmployees?: number;
  activeShifts?: number;
  payrollDue?: number;
  todayShift?: Shift;
  leaveBalance?: LeaveBalance;
  thisWeekHours?: number;
  activeGoals?: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch notifications for all roles
        console.log("fffffff - About to fetch notifications");
        const notificationsRes = await fetch('http://localhost:5000/workDay/notifications');
        console.log("fffffff - Notifications response status:", notificationsRes.status);
        
        if (!notificationsRes.ok) {
          console.error("fffffff - Notifications request failed:", notificationsRes.status, notificationsRes.statusText);
          const errorText = await notificationsRes.text();
          console.error("fffffff - Error response:", errorText.substring(0, 200));
          setNotifications([]);
        } else {
          const notificationsData = await notificationsRes.json();
          setNotifications(notificationsData);
        }
        console.log("fffffff - Current user:", user)
        // Fetch data based on user role
        if (user?.role === 'Employee') {
          console.log("fffffff - Fetching Employee data for employeeId:", user.employeeId);
          const [shiftRes, leaveRes, timeRes, goalsRes] = await Promise.all([
            fetch(`http://localhost:5000/workDay/shifts/employee/${user.employeeId}`),
            fetch(`http://localhost:5000/workDay/leaves/employee/${user.employeeId}`),
            fetch(`http://localhost:5000/workDay/timeEntries/employee/${user.employeeId}`),
            fetch(`http://localhost:5000/workDay/goals/employee/${user.employeeId}`)
          ]);

          console.log("fffffff - Employee API responses:", {
            shifts: shiftRes.status,
            leaves: leaveRes.status,
            timeEntries: timeRes.status,
            goals: goalsRes.status
          });

          const shiftData = shiftRes.ok ? await shiftRes.json() : [];
          const leaveData = leaveRes.ok ? await leaveRes.json() : [];
          const timeData = timeRes.ok ? await timeRes.json() : [];
          const goalsData = goalsRes.ok ? await goalsRes.json() : [];

          console.log("fffffff - Employee data fetched:", {
            shifts: Array.isArray(shiftData) ? shiftData.length : 0,
            leaves: Array.isArray(leaveData) ? leaveData.length : 0,
            timeEntries: Array.isArray(timeData) ? timeData.length : 0,
            goals: Array.isArray(goalsData) ? goalsData.length : 0
          });

          // Calculate this week's hours from time entries
          const thisWeekHours = Array.isArray(timeData) ? 
            timeData.reduce((total: number, entry: any) => total + (entry.totalHours || 0), 0) : 0;

          setStats({
            todayShift: Array.isArray(shiftData) && shiftData.length > 0 ? shiftData[0] : null,
            leaveBalance: { annual: 20, sick: 10 }, // Default values
            thisWeekHours,
            activeGoals: Array.isArray(goalsData) ? goalsData.length : 0
          });
        }
        else if (user?.role === 'Manager') {
          console.log("fffffff - Fetching Manager data for employeeId:", user.employeeId);
          const [teamRes, approvalsRes, attendanceRes, goalsRes] = await Promise.all([
            fetch(`http://localhost:5000/workDay/admin/employees/manager/${user.employeeId}/team`),
            fetch(`http://localhost:5000/workDay/leaves/manager/${user.employeeId}/pending`),
            fetch(`http://localhost:5000/workDay/timeEntries/all`),
            fetch(`http://localhost:5000/workDay/goals/assigned/${user.employeeId}`)
          ]);

          console.log("fffffff - Manager API responses:", {
            team: teamRes.status,
            approvals: approvalsRes.status,
            attendance: attendanceRes.status,
            goals: goalsRes.status
          });

          const teamData = teamRes.ok ? await teamRes.json() : [];
          const approvalsData = approvalsRes.ok ? await approvalsRes.json() : [];
          const attendanceData = attendanceRes.ok ? await attendanceRes.json() : [];
          const goalsData = goalsRes.ok ? await goalsRes.json() : [];

          console.log("fffffff - Manager data fetched:", {
            teamSize: Array.isArray(teamData) ? teamData.length : 0,
            approvals: Array.isArray(approvalsData) ? approvalsData.length : 0,
            attendance: Array.isArray(attendanceData) ? attendanceData.length : 0,
            goals: Array.isArray(goalsData) ? goalsData.length : 0
          });

          // Calculate today's attendance from time entries
          const todayAttendance = Array.isArray(attendanceData) ? 
            attendanceData.filter((entry: any) => {
              const entryDate = new Date(entry.clockIn).toDateString();
              const today = new Date().toDateString();
              return entryDate === today && entry.clockOut;
            }).length : 0;

          setStats({
            teamSize: Array.isArray(teamData) ? teamData.length : 0,
            pendingApprovals: Array.isArray(approvalsData) ? approvalsData.length : 0,
            todayAttendance,
            assignedGoals: Array.isArray(goalsData) ? goalsData.length : 0,
            completedGoals: Array.isArray(goalsData) ? goalsData.filter((goal: Goal) => goal.status === 'completed').length : 0
          });
        }
        else if (user?.role === 'Admin') {
          console.log("fffffff - Fetching Admin data");
          const [employeesRes, shiftsRes, approvalsRes, payrollRes] = await Promise.all([
            fetch('http://localhost:5000/workDay/employees/all'),
            fetch('http://localhost:5000/workDay/shifts'),
            fetch('http://localhost:5000/workDay/leaves'),
            fetch('http://localhost:5000/workDay/payslips')
          ]);

          console.log("fffffff - Admin API responses:", {
            employees: employeesRes.status,
            shifts: shiftsRes.status,
            approvals: approvalsRes.status,
            payroll: payrollRes.status
          });

          const employeesData = employeesRes.ok ? await employeesRes.json() : [];
          const shiftsData = shiftsRes.ok ? await shiftsRes.json() : [];
          const approvalsData = approvalsRes.ok ? await approvalsRes.json() : [];
          const payrollData = payrollRes.ok ? await payrollRes.json() : [];

          console.log("fffffff - Admin data fetched:", {
            employees: Array.isArray(employeesData) ? employeesData.length : 0,
            shifts: Array.isArray(shiftsData) ? shiftsData.length : 0,
            approvals: Array.isArray(approvalsData) ? approvalsData.length : 0,
            payroll: Array.isArray(payrollData) ? payrollData.length : 0
          });

          setStats({
            totalEmployees: Array.isArray(employeesData) ? employeesData.length : 0,
            activeShifts: Array.isArray(shiftsData) ? shiftsData.length : 0,
            pendingApprovals: Array.isArray(approvalsData) ? approvalsData.filter((leave: any) => leave.status === 'Pending').length : 0,
            payrollDue: Array.isArray(payrollData) ? payrollData.filter((payslip: any) => payslip.status === 'draft').length : 0
          });
        }
        
        console.log("fffffff - Dashboard data fetching completed successfully");
      } catch (error) {
        console.error('fffffff - Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
        console.log("fffffff - Dashboard loading completed");
      }
    };
   console.log("dash:",user)
    
      fetchData();
    
  }, [user]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.name}!`;
  };

  const renderEmployeeDashboard = () => {
    if (loading) return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Shift</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.todayShift?.start || '09:00'} - {stats.todayShift?.end || '17:00'}
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="outline" className="mt-1">{stats.todayShift?.status || 'Scheduled'}</Badge>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeGoals || 0}</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leaveBalance?.annual || 0} days</div>
            <p className="text-xs text-muted-foreground">Available this year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeekHours || 0}h</div>
            <p className="text-xs text-muted-foreground">Hours worked</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderManagerDashboard = () => {
    if (loading) return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamSize || 0}</div>
            <p className="text-xs text-muted-foreground">Direct reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedGoals || 0}</div>
            <p className="text-xs text-muted-foreground">{stats.completedGoals || 0} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAttendance || 0}/{stats.teamSize || 0}</div>
            <p className="text-xs text-muted-foreground">Present today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals || 0}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAdminDashboard = () => {
    if (loading) return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeShifts || 0}</div>
            <p className="text-xs text-muted-foreground">Currently scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals || 0}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll Due</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.payrollDue || 0} days</div>
            <p className="text-xs text-muted-foreground">Next processing</p>
          </CardContent>
        </Card>
      </div>
    );
  };

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

  const getIconForNotification = (icon: string) => {
    switch (icon) {
      case 'Target': return <Target className="h-5 w-5 text-blue-500" />;
      case 'CheckCircle': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'AlertCircle': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'FileText': return <FileText className="h-5 w-5 text-blue-500" />;
      default: return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;

    return `${Math.floor(seconds)} second${seconds === 1 ? '' : 's'} ago`;
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
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-full">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4 mt-1 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              notifications.slice(0, 4).map((notification) => (
                <div key={notification._id} className="flex items-center space-x-3">
                  {getIconForNotification(notification.icon)}
                  <div>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(notification.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
