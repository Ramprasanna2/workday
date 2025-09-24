import React, { useState, useEffect, useCallback } from 'react';
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

// Interfaces for API data
interface AttendanceRecord {
  _id: string;
  clockIn: string;
  clockOut?: string;
  totalHours: number;
  overtimeHours?: number;
  status: string;
}

interface Shift {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: string;
}

interface LeaveRequest {
  _id: string;
  status: string;
  days: number;
  employeeId: { _id: string };
}

interface Goal {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
}

interface DashboardData {
  attendance: AttendanceRecord[];
  shifts: Shift[];
  leaves: LeaveRequest[];
  goals: Goal[];
  notifications: Notification[];
  payslips: any[];
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    attendance: [],
    shifts: [],
    leaves: [],
    goals: [],
    notifications: [],
    payslips: []
  });
  const [loading, setLoading] = useState(true);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.name}!`;
  };

  // Custom hook for dashboard data fetching
  const fetchDashboardData = useCallback(async () => {
    if (!user?.employeeId) return;

    try {
      setLoading(true);
      
      const apiCalls = [
        fetch(`http://localhost:5000/workDay/timeEntries/employee/${user.employeeId}`).catch(() => ({ json: () => [] })),
        fetch(`http://localhost:5000/workDay/shifts/employee/${user.employeeId}`).catch(() => ({ json: () => [] })),
        fetch(`http://localhost:5000/workDay/leaves`).catch(() => ({ json: () => [] })),
        fetch(`http://localhost:5000/workDay/goals/assigned/${user.employeeId}`).catch(() => ({ json: () => [] })),
        fetch(`http://localhost:5000/workDay/notifications/${user.employeeId}`).catch(() => ({ json: () => [] })),
        fetch(`http://localhost:5000/workDay/payslips/employee/${user.employeeId}`).catch(() => ({ json: () => [] }))
      ];

      const responses = await Promise.all(apiCalls);
      
      const [
        attendanceRes,
        shiftsRes,
        leavesRes,
        goalsRes,
        notificationsRes,
        payslipsRes
      ] = responses;

      const data = await Promise.all([
        attendanceRes.ok ? attendanceRes.json() : [],
        shiftsRes.ok ? shiftsRes.json() : [],
        leavesRes.ok ? leavesRes.json() : [],
        goalsRes.ok ? goalsRes.json() : [],
        notificationsRes.ok ? notificationsRes.json() : [],
        payslipsRes.ok ? payslipsRes.json() : []
      ]);

      setDashboardData({
        attendance: data[0] || [],
        shifts: data[1] || [],
        leaves: (data[2] || []).filter((leave: LeaveRequest) => 
          leave.employeeId._id === user.employeeId
        ),
        goals: data[3] || [],
        notifications: data[4] || [],
        payslips: data[5] || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error
      setDashboardData({
        attendance: [],
        shifts: [],
        leaves: [],
        goals: [],
        notifications: [],
        payslips: []
      });
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    // Listen for custom events to refresh data
    const handleRefresh = () => fetchDashboardData();
    window.addEventListener('refreshClockInStatus', handleRefresh);
    window.addEventListener('refreshLeaveRequestBadge', handleRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshClockInStatus', handleRefresh);
      window.removeEventListener('refreshLeaveRequestBadge', handleRefresh);
    };
  }, [fetchDashboardData]);

  // Calculate metrics from real data
  const calculateMetrics = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = getThisWeekRange();
    
    // Today's shift
    const todayShift = dashboardData.shifts.find(shift => 
      shift.date.split('T')[0] === today
    );
    
    // Weekly hours
    const weeklyHours = dashboardData.attendance
      .filter(att => {
        const attDate = new Date(att.clockIn);
        return attDate >= thisWeek.start && attDate <= thisWeek.end;
      })
      .reduce((sum, att) => sum + att.totalHours, 0);
    
    // Leave balance (simplified - you might want to calculate this properly)
    const leaveBalance = Math.max(0, 30 - dashboardData.leaves
      .filter(leave => leave.status === 'approved')
      .reduce((sum, leave) => sum + leave.days, 0));
    
    // Active goals
    const activeGoals = dashboardData.goals.filter(goal => 
      goal.status === 'Ongoing' || goal.status === 'Pending'
    ).length;
    
    // Completed goals this quarter
    const quarterStart = getQuarterStart();
    const completedGoals = dashboardData.goals.filter(goal => 
      goal.status === 'Completed' && new Date(goal.createdAt) >= quarterStart
    ).length;

    return {
      todayShift,
      weeklyHours: Math.round(weeklyHours * 100) / 100,
      leaveBalance,
      activeGoals,
      completedGoals
    };
  };

  // Helper functions
  const getThisWeekRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
    return { start: startOfWeek, end: endOfWeek };
  };

  const getQuarterStart = () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    return new Date(now.getFullYear(), quarter * 3, 1);
  };

  const metrics = calculateMetrics();

  const renderEmployeeDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Shift</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? '...' : metrics.todayShift ? 
              `${metrics.todayShift.startTime} - ${metrics.todayShift.endTime}` : 
              'No shift today'
            }
          </div>
          <p className="text-xs text-muted-foreground">
            <Badge variant="outline" className="mt-1">
              {metrics.todayShift?.status || 'Unscheduled'}
            </Badge>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? '...' : metrics.activeGoals}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.completedGoals} completed this quarter
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? '...' : `${metrics.leaveBalance} days`}
          </div>
          <p className="text-xs text-muted-foreground">Available this year</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? '...' : `${metrics.weeklyHours}h`}
          </div>
          <p className="text-xs text-muted-foreground">Hours worked</p>
        </CardContent>
      </Card>
    </div>
  );

  const getQuickActions = () => {
    return [
      { label: 'My Shifts', href: '/dashboard/shifts', variant: 'default' as const },
      { label: 'My Goals', href: '/dashboard/my-goals', variant: 'outline' as const },
      { label: 'Attendance', href: '/dashboard/attendance', variant: 'outline' as const },
      { label: 'Notifications', href: '/dashboard/notifications', variant: 'outline' as const },
    ];
  };

  // Generate recent activity from real data
  const getRecentActivity = () => {
    const activities = [];
    
    // Add recent goals
    dashboardData.goals
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2)
      .forEach(goal => {
        activities.push({
          icon: Target,
          color: 'text-blue-500',
          message: `Goal assigned: ${goal.title}`,
          timestamp: getRelativeTime(goal.createdAt)
        });
      });

    // Add recent notifications
    dashboardData.notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2)
      .forEach(notification => {
        activities.push({
          icon: getNotificationIcon(notification.type),
          color: getNotificationColor(notification.type),
          message: notification.message,
          timestamp: getRelativeTime(notification.createdAt)
        });
      });

    // Add recent leaves
    const recentLeave = dashboardData.leaves
      .sort((a, b) => new Date(b._id).getTime() - new Date(a._id).getTime())[0];
    
    if (recentLeave) {
      activities.push({
        icon: CheckCircle,
        color: recentLeave.status === 'approved' ? 'text-green-500' : 'text-yellow-500',
        message: `Leave request ${recentLeave.status}`,
        timestamp: 'Recently'
      });
    }

    return activities.slice(0, 4);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'goal': return Target;
      case 'leave': return Calendar;
      case 'shift': return Clock;
      case 'payroll': return FileText;
      default: return AlertCircle;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'goal': return 'text-blue-500';
      case 'leave': return 'text-green-500';
      case 'shift': return 'text-yellow-500';
      case 'payroll': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const recentActivities = getRecentActivity();

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
      {renderEmployeeDashboard()}

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
              <div className="text-center text-muted-foreground">Loading activities...</div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${activity.color}`} />
                    <div>
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground">No recent activities</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};