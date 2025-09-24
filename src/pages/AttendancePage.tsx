import React, { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { UniversalBackButton } from '../components/UniversalBackButton';
import {
  Clock,
  Play,
  Square,
  Coffee,
  Calendar,
  MapPin,
  Timer
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  totalHours: number;
  status: 'present' | 'absent' | 'late' | 'early-leave';
  overtimeHours?: number;
}

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);

  // Format hours to display properly
  const formatHours = (hours: number) => {
    const rounded = parseFloat(hours.toFixed(2));
    return rounded > 0 ? `${rounded}h` : '0h';
  };

  // Fetch attendance records for the logged-in employee
  const fetchAttendance = async () => {
    try {
      const res = await fetch(`http://localhost:5000/workDay/timeEntries/employee/${user.employeeId}`);
      if (!res.ok) throw new Error("Failed to fetch attendance records");

      const data = await res.json();
      // Map backend data to AttendanceRecord
      const mappedData = data.map((entry: any) => ({
        id: entry._id,
        date: entry.clockIn ? new Date(entry.clockIn).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        clockIn: entry.clockIn ? new Date(entry.clockIn).toTimeString().substring(0, 5) : '--:--',
        clockOut: entry.clockOut ? new Date(entry.clockOut).toTimeString().substring(0, 5) : undefined,
        totalHours: entry.totalHours || 0,
        overtimeHours: entry.overtimeHours || 0,
        status: entry.status || 'present'
      }));

      setAttendanceHistory(mappedData);

      // Set today's record if it exists
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = mappedData.find(record => record.date === today);
      if (todayEntry) {
        setTodayRecord(todayEntry);
        setIsClockedIn(!!todayEntry.clockIn && !todayEntry.clockOut);
      } else {
        setTodayRecord(null);
        setIsClockedIn(false);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  // Initial fetch and set up timer
  useEffect(() => {
    fetchAttendance();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.employeeId]);

  const getCurrentTimeString = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentDateString = () => {
    return currentTime.toISOString().split('T')[0];
  };

  // Add this helper function to refresh dashboard badge
  const refreshClockInStatus = () => {
    window.dispatchEvent(new CustomEvent('refreshClockInStatus'));
  };

  // Update handleClockIn function
  const handleClockIn = async () => {
    const now = new Date();

    try {
      const res = await fetch('http://localhost:5000/workDay/timeEntries/clockin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user.employeeId,
          managerId: user.managerId,
          clockIn: now.toISOString(),
          status: 'present'
        })
      });

      if (!res.ok) throw new Error("Failed to clock in");
      await fetchAttendance(); // Refresh data after clock-in

      // Refresh dashboard badge status
      refreshClockInStatus();
    } catch (error) {
      console.error("Error clocking in:", error);
    }
  };

  // Update handleClockOut function
  const handleClockOut = async () => {
    if (!todayRecord) return;
    const now = new Date();

    try {
      // Calculate total hours
      const clockInTime = new Date(todayRecord.date + 'T' + todayRecord.clockIn + ':00');
      const clockOutTime = now;
      const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      // Round off to 2 decimal places
      const roundedTotalHours = parseFloat(totalHours.toFixed(2));
      const overtimeHours = totalHours > 8 ? parseFloat((totalHours - 8).toFixed(2)) : 0;
      const roundedOvertimeHours = parseFloat(overtimeHours.toFixed(2));

      // Send clock-out data to backend
      const res = await fetch(`http://localhost:5000/workDay/timeEntries/clockout/${todayRecord.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clockOut: now.toISOString(),
          totalHours: roundedTotalHours,
          overtimeHours: roundedOvertimeHours
        })
      });

      if (!res.ok) throw new Error("Failed to clock out");
      await fetchAttendance(); // Refresh data after clock-out

      // Refresh dashboard badge status
      refreshClockInStatus();
    } catch (error) {
      console.error("Error clocking out:", error);
    }
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const variants = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      'early-leave': 'bg-orange-100 text-orange-800'
    } as const;
    
    return (
      <Badge className={variants[status]}>
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  const calculateWeeklyHours = () => {
    const thisWeek = attendanceHistory
      .filter(record => {
        const recordDate = new Date(record.date);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return recordDate >= weekStart;
      })
      .reduce((total, record) => total + record.totalHours, 0);

    return parseFloat(thisWeek.toFixed(2));
  };

  const calculateMonthlyHours = () => {
    const thisMonth = attendanceHistory
      .filter(record => {
        const recordDate = new Date(record.date);
        const now = new Date();
        return recordDate.getMonth() === now.getMonth() &&
               recordDate.getFullYear() === now.getFullYear();
      })
      .reduce((total, record) => total + record.totalHours, 0);

    return parseFloat(thisMonth.toFixed(2));
  };

  return (
    <div className="space-y-6">
      <UniversalBackButton />

      <div>
        <h1 className="text-3xl font-bold">Attendance Tracking</h1>
        <p className="text-muted-foreground">
          Track your daily attendance with clock-in/out and break management.
        </p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Current Status</span>
            </CardTitle>
            <CardDescription>
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-mono">
                {getCurrentTimeString()}
              </div>

              <div className="space-y-2">
                {!isClockedIn ? (
                  <Button onClick={handleClockIn} size="lg" className="w-full">
                    <Play className="mr-2 h-5 w-5" />
                    Clock In
                  </Button>
                ) : (
                  <Button onClick={handleClockOut} size="lg" variant="destructive" className="w-full">
                    <Square className="mr-2 h-5 w-5" />
                    Clock Out
                  </Button>
                )}
              </div>
              {todayRecord && (
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Clock In:</span>
                    <span>{todayRecord.clockIn}</span>
                  </div>
                  {todayRecord.clockOut && (
                    <div className="flex justify-between text-sm">
                      <span>Clock Out:</span>
                      <span>{todayRecord.clockOut}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Total Hours:</span>
                    <span>{formatHours(todayRecord.totalHours)}</span>
                  </div>
                  {todayRecord.overtimeHours && todayRecord.overtimeHours > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Overtime:</span>
                      <span>{formatHours(todayRecord.overtimeHours)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatHours(calculateWeeklyHours())}</div>
              <p className="text-xs text-muted-foreground">
                Hours worked this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatHours(calculateMonthlyHours())}</div>
              <p className="text-xs text-muted-foreground">
                Hours worked this month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>
            Your recent attendance records and time tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>{record.clockIn}</TableCell>
                    <TableCell>{record.clockOut || 'Still working'}</TableCell>
                    <TableCell>{formatHours(record.totalHours)}</TableCell>
                    <TableCell>{formatHours(record.overtimeHours || 0)}</TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};