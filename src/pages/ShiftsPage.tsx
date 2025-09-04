import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";

interface Shift {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakTimeInMinutes: number;
  isOpen: boolean;
  employeeId: string;
  managerId: string;
  status?: "upcoming" | "completed" | "in-progress" | "open";
  requestStatus?: "none" | "pending" | "approved" | "rejected";
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "in-progress":
      return "bg-yellow-100 text-yellow-800";
    case "open":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ShiftsPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/workDay/shifts/employee/${user.employeeId}`
        );
        if (!res.ok) throw new Error("Failed to fetch shifts");
        const data = await res.json();
        const now = new Date();
        const processed = data.map((shift: Shift) => {
          const shiftDate = new Date(shift.date);
          const start = new Date(shift.startTime);
          const end = new Date(shift.endTime);
          let status: Shift["status"] = "upcoming";
          if (shift.isOpen) {
            status = "open";
          } else if (shiftDate < new Date(now.setHours(0, 0, 0, 0))) {
            status = "completed";
          } else if (now >= start && now <= end) {
            status = "in-progress";
          }
          return { ...shift, status };
        });
        setShifts(processed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShifts();
  }, [user.employeeId]);

  const openShift = async (shiftId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/workDay/shifts/open/${shiftId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ employeeId: user.employeeId }),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to open shift");
      }
      const updatedShift = await res.json();
      setShifts((prev) =>
        prev.map((shift) =>
          shift._id === updatedShift._id ? updatedShift : shift
        )
      );
      alert("Shift opened successfully ✅");
    } catch (err: any) {
      console.error("Error opening shift:", err.message);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <p>Loading shifts...</p>;

  const upcomingShifts = shifts.filter((s) => s.status === "upcoming");
  const completedShifts = shifts.filter((s) => s.status === "completed");
  const openShifts = shifts.filter((s) => s.status === "open");

  const totalHoursThisWeek = shifts.reduce((total, shift) => {
    const start = new Date(shift.startTime);
    const end = new Date(shift.endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return total + hours;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Shifts</h1>
          <p className="text-muted-foreground">
            View your work schedule and upcoming shifts
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHoursThisWeek}h</div>
            <p className="text-xs text-muted-foreground">
              Total scheduled hours
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Upcoming Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingShifts.length}</div>
            <p className="text-xs text-muted-foreground">In the next 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Open Shifts</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openShifts.length}</div>
            <p className="text-xs text-muted-foreground">Available to claim</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
        </TabsList>

        {/* Upcoming Shifts */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingShifts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p>No upcoming shifts</p>
              </CardContent>
            </Card>
          ) : (
            upcomingShifts.map((shift) => (
              <Card key={shift._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {formatDate(shift.date)}
                        <Badge className={getStatusColor(shift.status!)}>
                          {shift.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {new Date(shift.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(shift.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition"
                      disabled={shift.isOpen}
                      onClick={() => {
                        const confirmed = window.confirm(
                          "Are you sure you want to open this shift? Once opened, it will be available for other employees."
                        );
                        if (confirmed) {
                          openShift(shift._id);
                        }
                      }}
                    >
                      {shift.isOpen ? "Already Opened" : "Open Shift"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Main Office</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Completed Shifts */}
        <TabsContent value="completed" className="space-y-4">
          {completedShifts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p>No completed shifts</p>
              </CardContent>
            </Card>
          ) : (
            completedShifts.map((shift) => (
              <Card key={shift._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {formatDate(shift.date)}
                    <Badge className={getStatusColor(shift.status!)}>
                      {shift.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Main Office</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Open Shifts */}
        <TabsContent value="open" className="space-y-4">
          {openShifts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p>No open shifts</p>
              </CardContent>
            </Card>
          ) : (
            openShifts.map((shift) => (
              <Card key={shift._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {formatDate(shift.date)}
                    <Badge className={getStatusColor(shift.status!)}>
                      Open
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Main Office</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This shift is open for others to claim.
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftsPage;