import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Download, CheckCircle, XCircle, AlertCircle, MapPin, Activity, Edit2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Present':
      return 'bg-green-100 text-green-800';
    case 'Absent':
      return 'bg-red-100 text-red-800';
    case 'Late':
      return 'bg-yellow-100 text-yellow-800';
    case 'On Leave':
      return 'bg-blue-100 text-blue-800';
    case 'No Shift Today':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Present':
      return CheckCircle;
    case 'Absent':
      return XCircle;
    case 'Late':
      return AlertCircle;
    case 'On Leave':
      return Clock;
    case 'No Shift Today':
      return Calendar;
    default:
      return AlertCircle;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const DailyAttendanceView = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [shiftSchedules, setShiftSchedules] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [todayStatus, setTodayStatus] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const today = new Date().toISOString().split('T')[0];

  // Fetch team members managed by this manager
  useEffect(() => {
    fetch(`http://localhost:5000/workDay/employees/${user.employeeId}/team`)
      .then(res => res.json())
      .then((data)=>{setTeamMembers(data);
        console.log("user")
        console.log(data);
      });
  }, [user.employeeId]);

  // Fetch today's shifts for team
  useEffect(() => {
    fetch(`http://localhost:5000/workDay/shifts/date/${today}`)
      .then(res => res.json())
      .then((data)=>{setShiftSchedules(data);
        console.log(data);
      });
  }, [today]);

  // Fetch attendance records for team
  useEffect(() => {
    fetch(`http://localhost:5000/workDay/timeEntries/all`)
      .then(res => res.json())
      .then((data)=>{setAttendanceRecords(data);
       console.log(data);
      });
  }, []);

  // Fetch leave requests for today
  useEffect(() => {
    fetch(`http://localhost:5000/workDay/leaves`)
      .then(res => res.json())
      .then(data => {
        
        setLeaveRequests(data.filter((leave: any) =>
          leave.status === "Approved" &&
          new Date(leave.startDate) <= new Date(today) &&
          new Date(leave.endDate) >= new Date(today)
        ));
      });
  }, [today]);

  // Calculate today's status for each team member
  useEffect(() => {
  if (!teamMembers.length) return;
  const today = new Date().toISOString().split('T')[0];

  Promise.all(
    teamMembers.map(async (member) => {
      // Fetch today's shift for this employee
      const shiftRes = await fetch(`http://localhost:5000/workDay/shifts/employee/${member._id}/date/${today}`);
      const shifts = await shiftRes.json();

      // Fetch today's attendance for this employee
      const attRes = await fetch(`http://localhost:5000/workDay/timeentries/employee/${member._id}/date/${today}`);
      const attendance = await attRes.json();
     
      // Fetch approved leave request for this employee for today
      const leaveRes = await fetch(`http://localhost:5000/workDay/leaves/employee/${member._id}/date/${today}`);
      const leaves = await leaveRes.json();
      
      // Determine status
      if (!shifts.length) {
        return {
          ...member,
          status: "No Shift Today",
          details: "",
          department: member.department?.name || "",
          clockIn: null,
          clockOut: null,
          totalHours: 0,
          location: "",
          notes: ""
        };
      }

      if (!attendance.length) {
        if (leaves.length) {
          return {
            ...member,
            status: "On Leave",
            details: leaves[0].reason,
            department: member.department?.name || "",
            clockIn: null,
            clockOut: null,
            totalHours: 0,
            location: "",
            notes: leaves[0].reason
          };
        }
        return {
          ...member,
          status: "Absent",
          details: "",
          department: member.department?.name || "",
          clockIn: null,
          clockOut: null,
          totalHours: 0,
          location: "",
          notes: ""
        };
      }

      // Check for late arrival
      const shift = shifts[0];
      const scheduledStart = new Date(`${today}T${shift.startTime}`);
      const actualClockIn = new Date(attendance[0].clockIn);
      let status = "Present";
      let details = "";
      if (actualClockIn > scheduledStart) {
        const lateMinutes = Math.round((actualClockIn.getTime() - scheduledStart.getTime()) / (1000 * 60));
        status = "Late";
        details = `Late by ${lateMinutes} min`;
      }

      // Calculate total hours if multiple attendance records
      let totalHours = 0;
      let clockIn: Date | null = null;
      let clockOut: Date | null = null;

      if (attendance.length) {
        // Sum all hours and get earliest clockIn/latest clockOut
        // Find the earliest clockIn in the attendance array
        clockIn = attendance
          .map((entry: any) => entry.clockIn)
          .filter(Boolean)
          .map((dt: string) => new Date(dt))
          .sort((a, b) => a.getTime() - b.getTime())[0] || null;

        clockOut = attendance[0].clockOut ? new Date(attendance[0].clockOut) : null;

        attendance.forEach((entry: any) => {
          if (entry.totalHours) totalHours += entry.totalHours;
          if (entry.clockOut && (!clockOut || new Date(entry.clockOut) > clockOut)) clockOut = new Date(entry.clockOut);
        });
      }

      return {
        ...member,
        status,
        details,
        department: member.department?.name || "",
        clockIn: clockIn ? clockIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        clockOut: clockOut ? clockOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        totalHours: Math.round(totalHours * 1000) / 1000,
        location: attendance[0]?.location || "",
        notes: attendance[0]?.notes || ""
      };
    })
  ).then(statusArr => setTodayStatus(statusArr));
}, [teamMembers, today]);

  // Filtering
  const filteredRecords = todayStatus.filter(record => {
    const matchesSearch = record.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status.toLowerCase() === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Summary counts
  const presentCount = todayStatus.filter(r => r.status === 'Present').length;
  const absentCount = todayStatus.filter(r => r.status === 'Absent').length;
  const lateCount = todayStatus.filter(r => r.status === 'Late').length;
  const leaveCount = todayStatus.filter(r => r.status === 'On Leave').length;
  const noShiftCount = todayStatus.filter(r => r.status === 'No Shift Today').length;
  const totalEmployees = teamMembers.length;
  const attendanceRate = totalEmployees ? Math.round((presentCount / totalEmployees) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Employees</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Managed by you</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Present</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <p className="text-xs text-muted-foreground">{attendanceRate}% attendance rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Late Arrivals</CardTitle>
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
            <p className="text-xs text-muted-foreground">{Math.round((lateCount / totalEmployees) * 100)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Absent</CardTitle>
            <XCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <p className="text-xs text-muted-foreground">{Math.round((absentCount / totalEmployees) * 100)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>On Leave</CardTitle>
            <Clock className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{leaveCount}</div>
            <p className="text-xs text-muted-foreground">Approved leave today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter Attendance</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {filteredRecords.length} of {totalEmployees}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-10">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Present">✅ Present</SelectItem>
                <SelectItem value="Absent">❌ Absent</SelectItem>
                <SelectItem value="Late">⚠️ Late</SelectItem>
                <SelectItem value="On Leave">🛌 On Leave</SelectItem>
                <SelectItem value="No Shift Today">📅 No Shift</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {/* Dynamically list departments */}
                {[...new Set(teamMembers.map(m => m.department?.name).filter(Boolean))].map(dep => (
                  <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Team Attendance - {formatDate(today)}</CardTitle>
          <CardDescription>Real-time attendance tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const StatusIcon = getStatusIcon(record.status);
                  return (
                    <TableRow key={record._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${record.firstName || ''}${record.lastName || ''}`} 
                              alt={record.firstName + ' ' + record.lastName}
                            />
                            <AvatarFallback>
                              {(record.firstName?.[0] || '') + (record.lastName?.[0] || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{record.firstName} {record.lastName}</div>
                            <div className="text-sm text-muted-foreground">{record._id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/30">
                          {record.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.clockIn ? (
                          <span className="font-mono bg-green-50 text-green-700 px-2 py-1 rounded text-sm">
                            {record.clockIn}
                          </span>
                        ) : (
                          <span className="text-muted-foreground bg-gray-50 px-2 py-1 rounded text-sm">--:--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.clockOut ? (
                          <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                            {record.clockOut}
                          </span>
                        ) : (
                          <span className="text-muted-foreground bg-gray-50 px-2 py-1 rounded text-sm">--:--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.totalHours > 0 ? (
                          <span className="font-bold">{record.totalHours}h</span>
                        ) : (
                          <span className="text-muted-foreground">0h</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(record.status)} flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{record.details || record.notes || '-'}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">No attendance records found</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const TeamAttendancePage = () => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Team Attendance Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Monitor and manage team attendance with real-time tracking and analytics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
          <Button className="bg-gradient-to-r from-primary to-purple-600 shadow-lg">
            <Activity className="h-4 w-4 mr-2" />
            Live Monitor
          </Button>
        </div>
      </div>
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-1 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="daily" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary rounded-lg font-medium">
            <Clock className="h-4 w-4 mr-2" />
            Daily View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-6">
          <DailyAttendanceView />
        </TabsContent>
      </Tabs>
    </div>
  );
};
