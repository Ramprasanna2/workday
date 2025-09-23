import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Clock,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";

// Define types matching your backend
interface Shift {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  isOpen: boolean;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  managerId: string;
  requestStatus: "none" | "pending" | "approved" | "rejected";
  requestedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reason?: string;
  location?: string;
  createdAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "none":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return AlertCircle;
    case "approved":
      return CheckCircle;
    case "rejected":
      return XCircle;
    default:
      return AlertCircle;
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

const formatTime = (timeString: string) => {
  return new Date(timeString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Add this helper function to refresh dashboard badge
const refreshShiftSwapBadge = () => {
  window.dispatchEvent(new CustomEvent('refreshShiftSwapBadge'));
};

export const ShiftSwapsPage = () => {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState<Shift[]>([]);
  const [availableSwaps, setAvailableSwaps] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    available: 0,
  });

  // Fetch my open requests
  const fetchMyRequests = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/workDay/shifts/employee/${user.employeeId}`
      );
      if (!res.ok) throw new Error("Failed to fetch my requests");
      const data: Shift[] = await res.json();
      // Filter only open shifts (isOpen: true)
      const openRequests = data.filter(shift => shift.isOpen);
      setMyRequests(openRequests);
      setCounts(prev => ({
        ...prev,
        pending: openRequests.filter(req => req.requestStatus === "pending").length,
        approved: openRequests.filter(req => req.requestStatus === "approved").length,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  // Fetch available swaps
  const fetchAvailableSwaps = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/workDay/shifts/open/manager/${user.managerId}`
      );
      if (!res.ok) throw new Error("Failed to fetch available swaps");
      const data: Shift[] = await res.json();
      // Filter out my own shifts and only show available ones
      const available = data.filter(
        shift => shift.employeeId._id !== user.employeeId && shift.isOpen
      );
      setAvailableSwaps(available);
      setCounts(prev => ({
        ...prev,
        available: available.length,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  useEffect(() => {
    if (user?.employeeId && user?.managerId) {
      setLoading(true);
      Promise.all([fetchMyRequests(), fetchAvailableSwaps()])
        .catch(err => setError(err instanceof Error ? err.message : "Unknown error"))
        .finally(() => setLoading(false));
    }
  }, [user?.employeeId, user?.managerId]);

  // Handle accepting a swap
  const handleAcceptSwap = async (shiftId: string) => {
    try {
      console.log(user.employeeId)
      const res = await fetch(
        `http://localhost:5000/workDay/shifts/request/${shiftId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: user.employeeId,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to approve swap");
      // Refresh both lists
      await fetchMyRequests();
      await fetchAvailableSwaps();
      
      // Refresh dashboard badge
      refreshShiftSwapBadge();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  // Handle canceling a request
  const handleCancelRequest = async (shiftId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/workDay/shifts/revoke/${shiftId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId: user.employeeId }),
        }
      );
      if (!res.ok) throw new Error("Failed to cancel request");
      await fetchMyRequests();
      
      // Refresh dashboard badge
      refreshShiftSwapBadge();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  if (loading) return <div className="p-4">Loading shift swaps...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Shift Swaps</h1>
          <p className="text-muted-foreground">
            Request shift swaps with your colleagues
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Approved Swaps</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.approved}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Available</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.available}</div>
            <p className="text-xs text-muted-foreground">
              Open requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for My Requests and Available Swaps */}
      <Tabs defaultValue="my-requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          <TabsTrigger value="available">Available Swaps</TabsTrigger>
        </TabsList>

        {/* My Requests Tab */}
        <TabsContent value="my-requests" className="space-y-4">
          {myRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3>No swap requests</h3>
                <p className="text-muted-foreground text-center">
                  You haven't made any shift swap requests yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            myRequests.map((request) => {
              const StatusIcon = getStatusIcon(request.requestStatus);
              return (
                <Card key={request._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <StatusIcon className="h-5 w-5" />
                          Shift Swap Request
                          <Badge className={getStatusColor(request.requestStatus)}>
                            {request.requestStatus.charAt(0).toUpperCase() +
                              request.requestStatus.slice(1)}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Created on {formatDate(request.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600">Your Shift</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(request.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatTime(request.startTime)} - {formatTime(request.endTime)}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {request.location || "Main Office"}
                      </div>
                    </div>
                    {request.reason && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Reason:</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.reason}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    {request.requestStatus === "none" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelRequest(request._id)}
                      >
                        Cancel Request
                      </Button>
                    )}
                    {request.requestStatus === "approved" && (
                      <Badge className="bg-green-100 text-green-800">
                        Swap Approved
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Available Swaps Tab */}
        <TabsContent value="available" className="space-y-4">
          {availableSwaps.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3>No available requests</h3>
                <p className="text-muted-foreground text-center">
                  There are no open shift swap requests from your colleagues right now.
                </p>
              </CardContent>
            </Card>
          ) : (
            availableSwaps.map((swap) => {
              const isPending = swap.requestStatus === "none";
              return (
                <Card key={swap._id}>
                  <CardHeader>
                    <CardTitle>
                      {formatDate(swap.date)} ({formatTime(swap.startTime)} - {formatTime(swap.endTime)})
                    </CardTitle>
                    <CardDescription>
                      Requested by: {swap.employeeId.firstName} {swap.employeeId.lastName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{swap.location || "Main Office"}</span>
                    </div>
                    {swap.reason && (
                      <div className="mt-2">
                        <h4 className="font-medium mb-1">Reason:</h4>
                        <p className="text-sm text-muted-foreground">
                          {swap.reason}
                        </p>
                      </div>
                    )}
                    <div className="mt-3">
                      <Badge
                        className={
                          isPending
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {swap.requestStatus.charAt(0).toUpperCase() +
                          swap.requestStatus.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleAcceptSwap(swap._id)}
                      disabled={!isPending}
                    >
                      {isPending ? "Accept Swap" : "Not Available"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftSwapsPage;

