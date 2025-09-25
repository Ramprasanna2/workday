import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  DollarSign, 
  CheckSquare,
  Bell,
  BarChart3,
  Settings,
  Home,
  RotateCcw,
  Menu,
  X,
  LogOut,
  Building,
  Briefcase // Add an icon for Recruitment
} from 'lucide-react';
import { cn } from '../components/ui/utils';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isCurrentlyClockedIn, setIsCurrentlyClockedIn] = useState(false);
  const [availableShiftSwapCount, setAvailableShiftSwapCount] = useState(0);
  const [missedCheckInCount, setMissedCheckInCount] = useState(0);
  const [pendingGoalsCount, setPendingGoalsCount] = useState(0);
  const [leaveRequestStatus, setLeaveRequestStatus] = useState<'none' | 'pending' | 'approved'>('none');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    if (!user?.employeeId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/workDay/notifications/employee/${user.employeeId}/unread-count`);
      if (response.ok) {
        const data = await response.json();
        setUnreadNotificationCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
    }
  };

  // Check if employee is currently clocked in
  const checkClockInStatus = async () => {
    if (!user?.employeeId) return;
    
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`http://localhost:5000/workDay/timeEntries/employee/${user.employeeId}/date/${today}`);
      if (response.ok) {
        const entries = await response.json();
        
        // Check if there's an entry today without clockOut (still clocked in)
        const todayEntry = entries.find((entry: any) => {
          const entryDate = new Date(entry.clockIn).toISOString().split('T')[0];
          return entryDate === today && entry.clockIn && !entry.clockOut;
        });
        
        setIsCurrentlyClockedIn(!!todayEntry);
      }
    } catch (error) {
      console.error('Error checking clock-in status:', error);
      setIsCurrentlyClockedIn(false);
    }
  };

  // Check available shift swaps count
  const checkAvailableShiftSwaps = async () => {
    if (!user?.managerId || !user?.employeeId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/workDay/shifts/open/manager/${user.managerId}`);
      if (response.ok) {
        const shifts = await response.json();
        // Filter out user's own shifts and count available swaps
        const availableSwaps = shifts.filter((shift: any) => 
          shift.employeeId._id !== user.employeeId && 
          shift.isOpen &&
          shift.requestStatus === "none" // Only available shifts
        );
        setAvailableShiftSwapCount(availableSwaps.length);
      }
    } catch (error) {
      console.error('Error checking available shift swaps:', error);
      setAvailableShiftSwapCount(0);
    }
  };

  // Helper function to calculate shift coverage
  const calculateShiftCoverage = (
    entries: any[], 
    shiftStart: Date, 
    shiftEnd: Date, 
    evaluationTime: Date
  ) => {
       
    // If no entries at all, definitely inadequate
    if (entries.length === 0) {
      return {
        isAdequate: false,
        reason: 'No check-in found',
        coveragePercent: 0,
        workedHours: 0,
        requiredHours: (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60)
      };
    }
    
    // Calculate total worked time from all entries
    let totalWorkedMinutes = 0;
    const shiftStartTime = shiftStart.getTime();
    const shiftEndTime = Math.min(shiftEnd.getTime(), evaluationTime.getTime());
    
    for (const entry of entries) {
      const clockInTime = new Date(entry.clockIn).getTime();
      let clockOutTime;
      
      if (entry.clockOut) {
        clockOutTime = new Date(entry.clockOut).getTime();
      } else if (evaluationTime < shiftEnd) {
        // Still ongoing - use current time as clock out
        clockOutTime = evaluationTime.getTime();
      } else {
        // Shift ended but no clock out - problematic
        return {
          isAdequate: false,
          reason: 'Never clocked out',
          coveragePercent: 0,
          workedHours: 0,
          requiredHours: (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60)
        };
      }
      
      // Calculate overlap with shift time
      const entryStart = Math.max(clockInTime, shiftStartTime);
      const entryEnd = Math.min(clockOutTime, shiftEndTime);
      
      if (entryEnd > entryStart) {
        const workedMinutesThisEntry = (entryEnd - entryStart) / (1000 * 60);
        totalWorkedMinutes += workedMinutesThisEntry;
        
        
      }
    }
    
    const totalWorkedHours = totalWorkedMinutes / 60;
    const totalShiftHours = (shiftEndTime - shiftStartTime) / (1000 * 60 * 60);
    const coveragePercent = (totalWorkedHours / totalShiftHours) * 100;
    
    // Consider adequate if worked at least 75% of the shift duration
    const isAdequate = coveragePercent >= 75;
    
    const result = {
      isAdequate,
      reason: isAdequate ? 'Adequate coverage' : `Only ${coveragePercent.toFixed(1)}% coverage`,
      coveragePercent: Math.round(coveragePercent),
      workedHours: Math.round(totalWorkedHours * 100) / 100,
      requiredHours: Math.round(totalShiftHours * 100) / 100
    };
    
     return result;
  };

  // Check for missed check-ins (but exclude if currently active)
  const checkMissedCheckIns = async () => {
    if (!user?.employeeId) return;
    
    try {
           
      // Get employee's shifts
      const shiftsResponse = await fetch(`http://localhost:5000/workDay/shifts/employee/${user.employeeId}`);
      if (!shiftsResponse.ok) {
        console.log('Failed to fetch shifts');
        return;
      }
      
      const shifts = await shiftsResponse.json();
           
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      let missedCount = 0;

      // Get today's time entries
      const todayEntriesResponse = await fetch(
        `http://localhost:5000/workDay/timeEntries/employee/${user.employeeId}/date/${today}`
      );
      
      let todayEntries = [];
      if (todayEntriesResponse.ok) {
        todayEntries = await todayEntriesResponse.json();
        console.log('Today\'s time entries:', todayEntries);
      }

      // Find if there's a current active shift
      const currentActiveShift = shifts.find((shift: any) => {
        const shiftDate = new Date(shift.date);
        const shiftStart = new Date(shift.startTime);
        const shiftEnd = new Date(shift.endTime);
        const shiftDateStr = shiftDate.toISOString().split('T')[0];
        
        return (
          !shift.isOpen &&
          shiftDateStr === today &&
          now >= shiftStart &&
          now <= shiftEnd
        );
      });

     
      // Check each shift for missed/incomplete check-ins
      for (const shift of shifts) {
        const shiftDate = new Date(shift.date);
        const shiftStart = new Date(shift.startTime);
        const shiftEnd = new Date(shift.endTime);
        const shiftDateStr = shiftDate.toISOString().split('T')[0];
        
               
        // Skip open shifts
        if (shift.isOpen) {
          console.log('Skipping open shift');
          continue;
        }
        
        if (shiftDateStr === today) {
          const gracePeriod = 15 * 60 * 1000;
          const shiftStartWithGrace = new Date(shiftStart.getTime() + gracePeriod);
          
          if (now > shiftStartWithGrace) {
            const coverage = calculateShiftCoverage(todayEntries, shiftStart, shiftEnd, now);
            console.log('Today\'s shift coverage:', coverage);
            
            // Don't count as missed if this is the current active shift and employee is clocked in
            const isCurrentShiftAndActive = (
              currentActiveShift?._id === shift._id && 
              isCurrentlyClockedIn
            );
            
            if (isCurrentShiftAndActive) {
              console.log('This is current active shift and employee is clocked in - not counting as missed');
            } else if (!coverage.isAdequate) {
              console.log('MISSED: Shift has inadequate coverage');
              missedCount++;
            }
          } else {
            console.log('Today\'s shift hasn\'t started yet');
          }
        } else if (shiftDate < now) {
          // Past shift logic
          try {
            const pastEntriesResponse = await fetch(
              `http://localhost:5000/workDay/timeEntries/employee/${user.employeeId}/date/${shiftDateStr}`
            );
            
            let pastEntries = [];
            if (pastEntriesResponse.ok) {
              pastEntries = await pastEntriesResponse.json();
            }
            
            const coverage = calculateShiftCoverage(pastEntries, shiftStart, shiftEnd, shiftEnd);
            
            if (!coverage.isAdequate) {
              console.log(`MISSED: Past shift ${shiftDateStr} has inadequate coverage`);
              missedCount++;
            }
          } catch (error) {
            console.error('Error checking past shift:', error);
            missedCount++;
          }
        }
      }
      
      console.log('Total missed/incomplete shifts (excluding current active):', missedCount);
      setMissedCheckInCount(missedCount);
    } catch (error) {
      console.error('Error checking missed check-ins:', error);
      setMissedCheckInCount(0);
    }
  };

  // Check pending goals count
  const checkPendingGoals = async () => {
    if (!user?.employeeId) return;
    
    try {
     
      
      const response = await fetch(`http://localhost:5000/workDay/goals/employee/${user.employeeId}`);
      if (response.ok) {
        const goals = await response.json();
        
        
        // Count goals that are not 100% completed (progress < 100)
        const pendingGoals = goals.filter((goal: any) => {
          const progress = goal.progress || 0; // Default to 0 if progress is undefined
          const isCompleted = progress >= 100;
          
                  
          return !isCompleted;
        });
        
       
        setPendingGoalsCount(pendingGoals.length);
      } else {
        console.log('Failed to fetch goals, status:', response.status);
        setPendingGoalsCount(0);
      }
    } catch (error) {
      console.error('Error checking pending goals:', error);
      setPendingGoalsCount(0);
    }
  };

  // Check leave request status
  const checkLeaveRequestStatus = async () => {
    if (!user?.employeeId) return;
    
    try {
     
      
      const response = await fetch(`http://localhost:5000/workDay/leaves/employee/${user.employeeId}`);
      console.log('Leave request response status:', response.status);
      
      if (response.ok) {
        const leaveRequests = await response.json();
       
        
        if (leaveRequests.length === 0) {
          console.log('No leave requests found');
          setLeaveRequestStatus('none');
          return;
        }
        
        // Get the most recent leave request
        const sortedRequests = leaveRequests.sort((a: any, b: any) => 
          new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime()
        );
        
        const latestRequest = sortedRequests[0];
       
        const now = new Date();
        const requestEndDate = new Date(latestRequest.endDate);
        
       
        
        // Updated logic based on your requirements:
        if (latestRequest.status === 'Pending') {
          console.log('Setting status to pending');
          setLeaveRequestStatus('pending');
        } else if (latestRequest.status === 'Approved') {
          // Show approved badge if the leave is current or recently ended (within 7 days)
          const daysSinceEnd = Math.floor((now.getTime() - requestEndDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceEnd <= 7) { // Show for current and up to 7 days after end
            console.log('Setting status to approved (recent/current leave)');
            setLeaveRequestStatus('approved');
          } else {
            console.log('Approved leave is too old, no badge');
            setLeaveRequestStatus('none');
          }
        } else if (latestRequest.status === 'Rejected') {
          console.log('Latest request is rejected, no badge');
          setLeaveRequestStatus('none');
        } else {
          console.log('Unknown status, no badge');
          setLeaveRequestStatus('none');
        }
      } else {
        console.log('Failed to fetch leave requests');
        const errorText = await response.text();
        console.log('Error:', errorText);
        setLeaveRequestStatus('none');
      }
    } catch (error) {
      console.error('Error checking leave request status:', error);
      setLeaveRequestStatus('none');
    }
  };

  // Check pending approvals count
  const checkPendingApprovals = async () => {
    if (!user?.employeeId || (user?.role !== 'Manager' && user?.role !== 'Admin')) return;
    
    try {
      console.log('=== CHECKING PENDING APPROVALS ===');
      console.log('Manager ID:', user.employeeId);
      
      let totalPendingCount = 0;
      
      // 1. Check pending leave requests
      try {
        const leaveResponse = await fetch(`http://localhost:5000/workDay/leaves/manager/${user.employeeId}/pending`);
        if (leaveResponse.ok) {
          const pendingLeaves = await leaveResponse.json();
          console.log('Pending leave requests:', pendingLeaves.length);
          totalPendingCount += pendingLeaves.length;
        }
      } catch (error) {
        console.error('Error fetching pending leave requests:', error);
      }
      
      // 2. Check pending shift swap requests
      try {
        const shiftResponse = await fetch(`http://localhost:5000/workDay/shifts/manager/${user.employeeId}/pending`);
        if (shiftResponse.ok) {
          const pendingShifts = await shiftResponse.json();
          console.log('Pending shift requests:', pendingShifts.length);
          totalPendingCount += pendingShifts.length;
        }
      } catch (error) {
        console.error('Error fetching pending shift requests:', error);
      }
      
      // 3. Check pending payslips (if manager needs to approve them)
      try {
        const payslipResponse = await fetch(`http://localhost:5000/workDay/payslips/manager/${user.employeeId}/pending`);
        if (payslipResponse.ok) {
          const pendingPayslips = await payslipResponse.json();
          console.log('Pending payslips:', pendingPayslips.length);
          totalPendingCount += pendingPayslips.length;
        }
      } catch (error) {
        console.error('Error fetching pending payslips:', error);
      }
      
      console.log('Total pending approvals:', totalPendingCount);
      setPendingApprovalsCount(totalPendingCount);
    } catch (error) {
      console.error('Error checking pending approvals:', error);
      setPendingApprovalsCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    checkClockInStatus();
    checkAvailableShiftSwaps();
    checkMissedCheckIns();
    checkPendingGoals();
    checkLeaveRequestStatus();
    checkPendingApprovals();
    
    // Refresh counts every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      checkClockInStatus();
      checkAvailableShiftSwaps();
      checkMissedCheckIns();
      checkPendingGoals();
      checkLeaveRequestStatus();
      checkPendingApprovals();
    }, 30000);
    
    // Listen for custom refresh events
    const handleRefreshBadge = () => {
      fetchUnreadCount();
    };
    
    const handleRefreshClockStatus = () => {
      checkClockInStatus();
    };

    const handleRefreshShiftSwaps = () => {
      checkAvailableShiftSwaps();
    };

    const handleRefreshMissedCheckIns = () => {
      checkMissedCheckIns();
    };

    const handleRefreshGoals = () => {
      checkPendingGoals();
    };

    const handleRefreshLeaveRequests = () => {
      checkLeaveRequestStatus();
    };

    const handleRefreshApprovals = () => {
      checkPendingApprovals();
    };
    
    window.addEventListener('refreshNotificationBadge', handleRefreshBadge);
    window.addEventListener('refreshClockInStatus', handleRefreshClockStatus);
    window.addEventListener('refreshShiftSwapBadge', handleRefreshShiftSwaps);
    window.addEventListener('refreshMissedCheckInBadge', handleRefreshMissedCheckIns);
    window.addEventListener('refreshGoalsBadge', handleRefreshGoals);
    window.addEventListener('refreshLeaveRequestBadge', handleRefreshLeaveRequests);
    window.addEventListener('refreshApprovalsBadge', handleRefreshApprovals);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshNotificationBadge', handleRefreshBadge);
      window.removeEventListener('refreshClockInStatus', handleRefreshClockStatus);
      window.removeEventListener('refreshShiftSwapBadge', handleRefreshShiftSwaps);
      window.removeEventListener('refreshMissedCheckInBadge', handleRefreshMissedCheckIns);
      window.removeEventListener('refreshGoalsBadge', handleRefreshGoals);
      window.removeEventListener('refreshLeaveRequestBadge', handleRefreshLeaveRequests);
      window.removeEventListener('refreshApprovalsBadge', handleRefreshApprovals);
    };
  }, [user?.employeeId, user?.managerId, user?.role]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  

  const getMenuItems = () => {
    const baseItems = [
      { 
        href: '/dashboard', 
        label: 'Dashboard', 
        icon: Home, 
        roles: ['Employee', 'Manager', 'Admin'] 
      },
    ];

    const employeeItems = [
      { 
        href: '/dashboard/shifts', 
        label: 'My Shifts', 
        icon: Calendar, 
        roles: ['Employee'],
        missedCount: missedCheckInCount
      },
      { 
        href: '/dashboard/my-goals', 
        label: 'My Goals', 
        icon: CheckSquare, 
        roles: ['Employee'],
        pendingGoalsCount: pendingGoalsCount
      },
      { 
        href: '/dashboard/leave-requests', 
        label: 'Leave Requests', 
        icon: FileText, 
        roles: ['Employee'], 
        leaveStatus: leaveRequestStatus // Fixed syntax - removed extra }
      },
      { 
        href: '/dashboard/attendance', 
        label: 'Attendance', 
        icon: Clock, 
        roles: ['Employee'],
        clockedIn: isCurrentlyClockedIn
      },
      { href: '/dashboard/payslips', label: 'Payslips', icon: DollarSign, roles: ['Employee'] },
      { 
        href: '/dashboard/shift-swaps', 
        label: 'Shift Swaps', 
        icon: RotateCcw, 
        roles: ['Employee'],
        swapCount: availableShiftSwapCount
      },
    ];

    const managerItems = [
      { href: '/dashboard/team-attendance', label: 'Team Attendance', icon: Clock, roles: ['Manager', 'Admin'] },
      { 
        href: '/dashboard/approvals', 
        label: 'Approvals', 
        icon: CheckSquare, 
        roles: ['Manager', 'Admin'],
        pendingCount: pendingApprovalsCount // Add pending approvals count
      },
      { href: '/dashboard/payroll', label: 'Payroll', icon: DollarSign, roles: ['Admin'] },
      { href: '/dashboard/reports', label: 'Reports', icon: BarChart3, roles: ['Manager', 'Admin'] },
      { href: '/dashboard/shift-management', label: 'Shift Management', icon: Calendar, roles: ['Manager', 'Admin'] },
       { href: '/dashboard/payslips', label: 'Payslips', icon: Calendar, roles: ['Manager', 'Admin'] },
    ];

    const adminItems = [
      { href: '/dashboard/employees', label: 'Employee Management', icon: Users, roles: ['Admin'] },
      { href: '/dashboard/goals', label: 'Goal Management', icon: CheckSquare, roles: ['Admin', 'Manager'] },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['Admin'] }, 
      { href: '/dashboard/employeees', label: 'Employee Create', icon: Users, roles: ['Admin'] },
      { href: '/dashboard/departments', label: 'Departments & Positions', icon: Building, roles: ['Admin'] },
      { href: '/dashboard/recruitment', label: 'Recruitment', icon: Briefcase, roles: ['Manager'] },
    ];

    const notificationItem = [
      { 
        href: '/dashboard/notifications', 
        label: 'Notifications', 
        icon: Bell, 
        roles: ['Employee', 'Manager', 'Admin'],
        badgeCount: unreadNotificationCount
      },
    ];

    const allItems = [...baseItems, ...employeeItems, ...managerItems, ...adminItems, ...notificationItem];
    
    return allItems.filter(item => 
      user && item.roles.includes(user.role)
    );
  };

  const menuItems = getMenuItems();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-sidebar/95 backdrop-blur-sm border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                WorkForce Pro
              </h2>
              <p className="text-sm text-sidebar-foreground/70 mt-1">
                Dashboard
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
                alt={user?.name} 
              />
              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4">
          <div className="space-y-2">
            {menuItems.map((item: any) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-11 rounded-lg transition-all duration-200",
                    active 
                      ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Link to={item.href} className="flex items-center w-full">
                    <Icon className="mr-3 h-4 w-4" />
                    <span>{item.label}</span>
                    
                    {/* Notification badge */}
                    {item.label === 'Notifications' && unreadNotificationCount > 0 && (
                      <Badge variant="destructive" className="ml-auto text-xs animate-pulse">
                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </Badge>
                    )}
                    
                    {/* Clock-in status badge for Attendance */}
                    {item.label === 'Attendance' && item.clockedIn && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto text-xs bg-green-100 text-green-800 hover:bg-green-200 animate-pulse border-green-200"
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                          Active
                        </div>
                      </Badge>
                    )}

                    {/* Shift Swap badge */}
                    {item.label === 'Shift Swaps' && availableShiftSwapCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200"
                      >
                        {availableShiftSwapCount > 99 ? '99+' : availableShiftSwapCount}
                      </Badge>
                    )}

                    {/* Missed Check-in badge for My Shifts */}
                    {item.label === 'My Shifts' && missedCheckInCount > 0 && !isCurrentlyClockedIn && (
                      <Badge 
                        variant="destructive" 
                        className="ml-auto text-xs bg-red-100 text-red-800 hover:bg-red-200 border-red-200 animate-pulse"
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                          {missedCheckInCount > 99 ? '99+' : missedCheckInCount}
                        </div>
                      </Badge>
                    )}

                    {/* Pending Goals badge for My Goals */}
                    {item.label === 'My Goals' && pendingGoalsCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
                      >
                        {pendingGoalsCount > 99 ? '99+' : pendingGoalsCount}
                      </Badge>
                    )}

                    {/* Leave Request Status badges */}
                    {item.label === 'Leave Requests' && item.leaveStatus === 'pending' && (
                      <Badge 
                        variant="destructive" 
                        className="ml-auto text-xs bg-red-100 text-red-800 hover:bg-red-200 border-red-200 animate-pulse"
                      >
                        P
                      </Badge>
                    )}

                    {item.label === 'Leave Requests' && item.leaveStatus === 'approved' && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto text-xs bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                      >
                        A
                      </Badge>
                    )}

                    {/* Pending Approvals badge for Approvals (Manager/Admin only) */}
                    {item.label === 'Approvals' && item.pendingCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="ml-auto text-xs bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 animate-pulse"
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                          {item.pendingCount > 99 ? '99+' : item.pendingCount}
                        </div>
                      </Badge>
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            onClick={logout}
            variant="outline"
            className="w-full justify-start h-11 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-background border-b px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">WorkForce Pro</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
                    alt={user?.name} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-sm">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSidebarOpen(true)}>
                Menu
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};