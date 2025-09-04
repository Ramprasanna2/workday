import React, { useState } from 'react';
import { Settings, Users, Clock, Bell, Shield, Database, Mail, Palette, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    companyName: 'WorkForce Pro',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    language: 'en',
    currency: 'USD'
  });

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Basic company settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={settings.companyName}
                onChange={(e) => handleSettingChange('companyName', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (EST)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CST)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MST)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PST)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-format">Date Format</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange('dateFormat', value)}>
                <SelectTrigger id="date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="time-format">Time Format</Label>
              <Select value={settings.timeFormat} onValueChange={(value) => handleSettingChange('timeFormat', value)}>
                <SelectTrigger id="time-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AttendanceSettings = () => {
  const [attendanceSettings, setAttendanceSettings] = useState({
    autoClockOut: true,
    autoClockOutTime: '23:59',
    gracePeriod: '5',
    overtimeThreshold: '40',
    breakTime: '30',
    requireGeoLocation: false,
    allowMobileClockIn: true,
    roundingRules: 'nearest_15'
  });

  const handleToggle = (key: string, value: boolean) => {
    setAttendanceSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInputChange = (key: string, value: string) => {
    setAttendanceSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clock In/Out Settings</CardTitle>
          <CardDescription>
            Configure how employees track their time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-clock-out">Automatic Clock Out</Label>
              <p className="text-sm text-muted-foreground">Automatically clock out employees at end of day</p>
            </div>
            <Switch
              id="auto-clock-out"
              checked={attendanceSettings.autoClockOut}
              onCheckedChange={(checked) => handleToggle('autoClockOut', checked)}
            />
          </div>
          
          {attendanceSettings.autoClockOut && (
            <div>
              <Label htmlFor="auto-clock-out-time">Auto Clock Out Time</Label>
              <Input
                id="auto-clock-out-time"
                type="time"
                value={attendanceSettings.autoClockOutTime}
                onChange={(e) => handleInputChange('autoClockOutTime', e.target.value)}
                className="w-32"
              />
            </div>
          )}
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grace-period">Grace Period (minutes)</Label>
              <Input
                id="grace-period"
                type="number"
                value={attendanceSettings.gracePeriod}
                onChange={(e) => handleInputChange('gracePeriod', e.target.value)}
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Late threshold before marking as late
              </p>
            </div>
            
            <div>
              <Label htmlFor="overtime-threshold">Overtime Threshold (hours/week)</Label>
              <Input
                id="overtime-threshold"
                type="number"
                value={attendanceSettings.overtimeThreshold}
                onChange={(e) => handleInputChange('overtimeThreshold', e.target.value)}
                placeholder="40"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="require-geo">Require Geolocation</Label>
              <p className="text-sm text-muted-foreground">Employees must be at approved locations to clock in</p>
            </div>
            <Switch
              id="require-geo"
              checked={attendanceSettings.requireGeoLocation}
              onCheckedChange={(checked) => handleToggle('requireGeoLocation', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="mobile-clock">Allow Mobile Clock In</Label>
              <p className="text-sm text-muted-foreground">Enable clock in/out from mobile devices</p>
            </div>
            <Switch
              id="mobile-clock"
              checked={attendanceSettings.allowMobileClockIn}
              onCheckedChange={(checked) => handleToggle('allowMobileClockIn', checked)}
            />
          </div>
          
          <div>
            <Label htmlFor="rounding-rules">Time Rounding Rules</Label>
            <Select value={attendanceSettings.roundingRules} onValueChange={(value) => handleInputChange('roundingRules', value)}>
              <SelectTrigger id="rounding-rules">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Rounding</SelectItem>
                <SelectItem value="nearest_15">Round to nearest 15 minutes</SelectItem>
                <SelectItem value="nearest_30">Round to nearest 30 minutes</SelectItem>
                <SelectItem value="up_15">Round up to 15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end">
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const NotificationSettings = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    leaveRequestNotifications: true,
    attendanceAlerts: true,
    payrollNotifications: true,
    systemUpdates: false,
    notificationHours: {
      start: '08:00',
      end: '18:00'
    }
  });

  const handleToggle = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTimeChange = (period: 'start' | 'end', value: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      notificationHours: {
        ...prev.notificationHours,
        [period]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Configure system-wide notification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-4">Delivery Methods</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => handleToggle('pushNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => handleToggle('smsNotifications', checked)}
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
                  <Label htmlFor="leave-notifications">Leave Request Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify managers about leave requests</p>
                </div>
                <Switch
                  id="leave-notifications"
                  checked={notificationSettings.leaveRequestNotifications}
                  onCheckedChange={(checked) => handleToggle('leaveRequestNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="attendance-alerts">Attendance Alerts</Label>
                  <p className="text-sm text-muted-foreground">Alert about late arrivals and absences</p>
                </div>
                <Switch
                  id="attendance-alerts"
                  checked={notificationSettings.attendanceAlerts}
                  onCheckedChange={(checked) => handleToggle('attendanceAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="payroll-notifications">Payroll Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify about payroll processing</p>
                </div>
                <Switch
                  id="payroll-notifications"
                  checked={notificationSettings.payrollNotifications}
                  onCheckedChange={(checked) => handleToggle('payrollNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="system-updates">System Updates</Label>
                  <p className="text-sm text-muted-foreground">Notify about system maintenance and updates</p>
                </div>
                <Switch
                  id="system-updates"
                  checked={notificationSettings.systemUpdates}
                  onCheckedChange={(checked) => handleToggle('systemUpdates', checked)}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-4">Notification Hours</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notification-start">Start Time</Label>
                <Input
                  id="notification-start"
                  type="time"
                  value={notificationSettings.notificationHours.start}
                  onChange={(e) => handleTimeChange('start', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="notification-end">End Time</Label>
                <Input
                  id="notification-end"
                  type="time"
                  value={notificationSettings.notificationHours.end}
                  onChange={(e) => handleTimeChange('end', e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Notifications will only be sent during these hours (except emergency alerts)
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SecuritySettings = () => {
  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: {
      minLength: '8',
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiry: '90'
    },
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginAttempts: '5',
    ipWhitelist: ''
  });

  const handleToggle = (key: string, value: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordPolicyChange = (key: string, value: string | boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      passwordPolicy: {
        ...prev.passwordPolicy,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
          <CardDescription>
            Set requirements for user passwords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="min-length">Minimum Password Length</Label>
            <Input
              id="min-length"
              type="number"
              min="6"
              max="20"
              value={securitySettings.passwordPolicy.minLength}
              onChange={(e) => handlePasswordPolicyChange('minLength', e.target.value)}
              className="w-24"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="require-uppercase">Require Uppercase Letters</Label>
              <Switch
                id="require-uppercase"
                checked={securitySettings.passwordPolicy.requireUppercase}
                onCheckedChange={(checked) => handlePasswordPolicyChange('requireUppercase', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="require-numbers">Require Numbers</Label>
              <Switch
                id="require-numbers"
                checked={securitySettings.passwordPolicy.requireNumbers}
                onCheckedChange={(checked) => handlePasswordPolicyChange('requireNumbers', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="require-special">Require Special Characters</Label>
              <Switch
                id="require-special"
                checked={securitySettings.passwordPolicy.requireSpecialChars}
                onCheckedChange={(checked) => handlePasswordPolicyChange('requireSpecialChars', checked)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="password-expiry">Password Expiry (days)</Label>
            <Input
              id="password-expiry"
              type="number"
              min="30"
              max="365"
              value={securitySettings.passwordPolicy.passwordExpiry}
              onChange={(e) => handlePasswordPolicyChange('passwordExpiry', e.target.value)}
              className="w-24"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Set to 0 for no expiry
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication & Access</CardTitle>
          <CardDescription>
            Configure authentication and access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="two-factor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
            </div>
            <Switch
              id="two-factor"
              checked={securitySettings.twoFactorAuth}
              onCheckedChange={(checked) => handleToggle('twoFactorAuth', checked)}
            />
          </div>
          
          <div>
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input
              id="session-timeout"
              type="number"
              min="5"
              max="480"
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
              className="w-24"
            />
          </div>
          
          <div>
            <Label htmlFor="login-attempts">Max Login Attempts</Label>
            <Input
              id="login-attempts"
              type="number"
              min="3"
              max="10"
              value={securitySettings.loginAttempts}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAttempts: e.target.value }))}
              className="w-24"
            />
          </div>
          
          <div>
            <Label htmlFor="ip-whitelist">IP Whitelist</Label>
            <Textarea
              id="ip-whitelist"
              placeholder="Enter IP addresses or ranges, one per line"
              value={securitySettings.ipWhitelist}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to allow access from any IP
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="attendance">
          <AttendanceSettings />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};