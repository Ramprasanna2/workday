import React, { useState } from 'react';
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
  LogOut
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Manager': return 'bg-blue-100 text-blue-800';
      case 'Employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      { href: '/dashboard/shifts', label: 'My Shifts', icon: Calendar, roles: ['Employee'] },
      { href: '/dashboard/my-goals', label: 'My Goals', icon: CheckSquare, roles: ['Employee'] },
      { href: '/dashboard/leave-requests', label: 'Leave Requests', icon: FileText, roles: ['Employee'] },
      { href: '/dashboard/attendance', label: 'Attendance', icon: Clock, roles: ['Employee'] },
      { href: '/dashboard/payslips', label: 'Payslips', icon: DollarSign, roles: ['Employee'] },
      { href: '/dashboard/shift-swaps', label: 'Shift Swaps', icon: RotateCcw, roles: ['Employee'] },
    ];

    const managerItems = [
      { href: '/dashboard/team-attendance', label: 'Team Attendance', icon: Clock, roles: ['Manager', 'Admin'] },
      { href: '/dashboard/approvals', label: 'Approvals', icon: CheckSquare, roles: ['Manager', 'Admin'] },
      { href: '/dashboard/payroll', label: 'Payroll', icon: DollarSign, roles: ['Manager', 'Admin'] },
      { href: '/dashboard/reports', label: 'Reports', icon: BarChart3, roles: ['Manager', 'Admin'] },
    ];

    const adminItems = [
      { href: '/dashboard/employees', label: 'Employee Management', icon: Users, roles: ['Admin'] },
      { href: '/dashboard/shift-management', label: 'Shift Management', icon: Calendar, roles: ['Admin'] },
      { href: '/dashboard/goals', label: 'Goal Management', icon: CheckSquare, roles: ['Admin', 'Manager'] },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['Admin'] },
    ];

    const notificationItem = [
      { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, roles: ['Employee', 'Manager', 'Admin'] },
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
              <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${getRoleBadgeColor(user?.role || '')}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
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
                    {item.label === 'Notifications' && (
                      <Badge variant="destructive" className="ml-auto text-xs">
                        3
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