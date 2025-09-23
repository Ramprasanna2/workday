import React, { useState ,useEffect} from 'react';
import { Bell, CheckCircle, XCircle, AlertCircle, Info, Calendar, User, Clock, Trash2, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'system';
  category: 'leave' | 'shift' | 'payroll' | 'system' | 'announcement';
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  relatedId?: string;
  sender?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Leave Request Approved',
    message: 'Your vacation leave request for January 22-24 has been approved by your manager.',
    type: 'success',
    category: 'leave',
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
    sender: 'Manager Alice Johnson'
  },
  {
    id: '2',
    title: 'Shift Swap Request',
    message: 'Bob Smith has requested to swap shifts with you for January 20th. Please review and respond.',
    type: 'info',
    category: 'shift',
    timestamp: '2024-01-15T09:15:00Z',
    read: false,
    actionRequired: true,
    relatedId: 'swap-123'
  },
  {
    id: '3',
    title: 'Payslip Available',
    message: 'Your payslip for the period January 1-15 is now available for download.',
    type: 'info',
    category: 'payroll',
    timestamp: '2024-01-14T16:00:00Z',
    read: true
  },
  {
    id: '4',
    title: 'System Maintenance',
    message: 'Scheduled system maintenance will occur this Sunday from 2:00 AM to 4:00 AM EST.',
    type: 'warning',
    category: 'system',
    timestamp: '2024-01-14T12:00:00Z',
    read: false
  },
  {
    id: '5',
    title: 'New Company Policy',
    message: 'Updated remote work policy is now in effect. Please review the new guidelines in the employee handbook.',
    type: 'info',
    category: 'announcement',
    timestamp: '2024-01-13T14:30:00Z',
    read: true,
    sender: 'HR Department'
  },
  {
    id: '6',
    title: 'Overtime Request Denied',
    message: 'Your overtime request for January 17th has been denied due to budget constraints.',
    type: 'error',
    category: 'shift',
    timestamp: '2024-01-13T11:45:00Z',
    read: false,
    sender: 'Manager Alice Johnson'
  },
  {
    id: '7',
    title: 'Birthday Celebration',
    message: 'Don\'t forget about the team birthday celebration for Carol this Friday at 3 PM in the break room!',
    type: 'info',
    category: 'announcement',
    timestamp: '2024-01-12T08:00:00Z',
    read: true,
    sender: 'Team Lead'
  },
  {
    id: '8',
    title: 'Time Clock Reminder',
    message: 'Remember to clock in and out properly. Recent timesheet shows missing clock-out on January 10th.',
    type: 'warning',
    category: 'system',
    timestamp: '2024-01-11T17:30:00Z',
    read: false,
    sender: 'HR System'
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CheckCircle;
    case 'error':
      return XCircle;
    case 'warning':
      return AlertCircle;
    case 'info':
      return Info;
    case 'system':
      return Bell;
    default:
      return Info;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-600 bg-green-100';
    case 'error':
      return 'text-red-600 bg-red-100';
    case 'warning':
      return 'text-yellow-600 bg-yellow-100';
    case 'info':
      return 'text-blue-600 bg-blue-100';
    case 'system':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'leave':
      return Calendar;
    case 'shift':
      return Clock;
    case 'payroll':
      return User;
    case 'system':
      return Bell;
    case 'announcement':
      return Info;
    default:
      return Info;
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    leaveUpdates: true,
    shiftChanges: true,
    payrollAlerts: true,
    systemAnnouncements: false
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how you receive notifications and updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-4">Delivery Methods</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-4">Notification Types</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="leave-updates">Leave Request Updates</Label>
                <p className="text-sm text-muted-foreground">Status changes for leave requests</p>
              </div>
              <Switch
                id="leave-updates"
                checked={settings.leaveUpdates}
                onCheckedChange={(checked) => handleSettingChange('leaveUpdates', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="shift-changes">Shift Changes</Label>
                <p className="text-sm text-muted-foreground">Shift swaps and schedule updates</p>
              </div>
              <Switch
                id="shift-changes"
                checked={settings.shiftChanges}
                onCheckedChange={(checked) => handleSettingChange('shiftChanges', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="payroll-alerts">Payroll Alerts</Label>
                <p className="text-sm text-muted-foreground">Payslip availability and payroll updates</p>
              </div>
              <Switch
                id="payroll-alerts"
                checked={settings.payrollAlerts}
                onCheckedChange={(checked) => handleSettingChange('payrollAlerts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="system-announcements">System Announcements</Label>
                <p className="text-sm text-muted-foreground">Company-wide announcements and updates</p>
              </div>
              <Switch
                id="system-announcements"
                checked={settings.systemAnnouncements}
                onCheckedChange={(checked) => handleSettingChange('systemAnnouncements', checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Save Preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const NotificationsPage = () => {
const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const {user}=useAuth();
  const userId = user.employeeId; // Replace with actual logged-in user ID

  useEffect(() => {
    // Fetch notifications for the logged-in user (employee or manager)
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:5000/workDay/notifications/employee/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        // Convert _id to id for frontend consistency
        setNotifications(data.map((n: any) => ({
          ...n,
          id: n._id,
        })));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, [userId]);

  // Add this function to refresh the parent dashboard
  const refreshDashboardBadge = () => {
    // Dispatch custom event to refresh dashboard
    window.dispatchEvent(new CustomEvent('refreshNotificationBadge'));
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/workDay/notifications/${id}/read`, { method: "POST" });
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      // Refresh dashboard badge
      refreshDashboardBadge();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`http://localhost:5000/workDay/notifications/markAllRead/${userId}`, { method: "PUT" });
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      // Refresh dashboard badge
      refreshDashboardBadge();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/workDay/notifications/${id}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Filtering logic
  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : !n.read
  );

  // Summary counts
  const unreadCount = notifications.filter(n => !n.read).length;
  const todayCount = notifications.filter(n => {
    const today = new Date();
    const notifDate = new Date(n.timestamp);
    return notifDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with important messages and alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              New notifications
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <p className="text-xs text-muted-foreground">
              Received today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              All notifications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" onClick={() => setFilter('all')}>
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" onClick={() => setFilter('unread')}>
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3>No notifications</h3>
                <p className="text-muted-foreground text-center">
                  You're all caught up! No new notifications to display.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              const CategoryIcon = getCategoryIcon(notification.category);
              
              return (
                <Card 
                  key={notification.id}
                  className={`transition-all ${!notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                          <NotificationIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-base">{notification.title}</CardTitle>
                            {!notification.read && (
                              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                New
                              </Badge>
                            )}
                            {notification.actionRequired && (
                              <Badge variant="destructive">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            <div className="flex items-center space-x-2 mt-1">
                              <CategoryIcon className="h-3 w-3" />
                              <span>{notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(notification.timestamp)}</span>
                              {notification.sender && (
                                <>
                                  <span>•</span>
                                  <span>from {notification.sender}</span>
                                </>
                              )}
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{notification.message}</p>
                    
                    {notification.actionRequired && (
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm">
                          Take Action
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
        
        <TabsContent value="unread" className="space-y-4">
          {filteredNotifications.filter(n => !n.read).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3>All caught up!</h3>
                <p className="text-muted-foreground text-center">
                  You have no unread notifications.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.filter(n => !n.read).map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              const CategoryIcon = getCategoryIcon(notification.category);
              
              return (
                <Card 
                  key={notification.id}
                  className="transition-all border-l-4 border-l-primary bg-primary/5"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                          <NotificationIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-base">{notification.title}</CardTitle>
                            <Badge variant="secondary" className="bg-primary text-primary-foreground">
                              New
                            </Badge>
                            {notification.actionRequired && (
                              <Badge variant="destructive">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            <div className="flex items-center space-x-2 mt-1">
                              <CategoryIcon className="h-3 w-3" />
                              <span>{notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(notification.timestamp)}</span>
                              {notification.sender && (
                                <>
                                  <span>•</span>
                                  <span>from {notification.sender}</span>
                                </>
                              )}
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{notification.message}</p>
                    
                    {notification.actionRequired && (
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm">
                          Take Action
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};