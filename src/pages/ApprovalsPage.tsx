import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, MessageSquare, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
}

interface ApprovalRequest {
  id: string;
  type: 'leave';
  employeeName: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  details: {
    startDate: string;
    endDate: string;
    leaveType: string;
    days: number;
  };
  reason: string;
  approverNotes?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeIcon = (type: string) => {
  return Calendar;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const ApprovalDetailDialog = ({ approval, onApprove, onReject }: { approval: ApprovalRequest; onApprove: (id: string, notes: string) => void; onReject: (id: string, notes: string) => void }) => {
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(approval.id, notes);
    } else if (action === 'reject') {
      onReject(approval.id, notes);
    }
    setNotes('');
    setAction(null);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Leave Request</DialogTitle>
        <DialogDescription>Review and approve or reject this request from {approval.employeeName}</DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Employee Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2">{approval.employeeName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Employee ID:</span>
              <span className="ml-2">{approval.employeeId._id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Request Date:</span>
              <span className="ml-2">{formatDate(approval.requestDate)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Priority:</span>
              <Badge className={getPriorityColor(approval.priority)} size="sm">
                {approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-3">Request Details</h4>
          <div className="space-y-2">
            <div>
              <strong>Leave Type:</strong> {approval.details.leaveType}
            </div>
            <div>
              <strong>Start Date:</strong> {formatDate(approval.details.startDate)}
            </div>
            <div>
              <strong>End Date:</strong> {formatDate(approval.details.endDate)}
            </div>
            <div>
              <strong>Duration:</strong> {approval.details.days} day(s)
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Reason</h4>
          <p className="text-sm text-muted-foreground">{approval.reason}</p>
        </div>
        {approval.status === 'pending' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Approval Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes or comments..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="destructive" onClick={() => setAction('reject')} disabled={action !== null}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={() => setAction('approve')} disabled={action !== null}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
            {action && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm mb-3">Are you sure you want to {action} this request?</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setAction(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>Confirm {action.charAt(0).toUpperCase() + action.slice(1)}</Button>
                </div>
              </div>
            )}
          </div>
        )}
        {approval.status !== 'pending' && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Decision</h4>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(approval.status)}>
                {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
              </Badge>
            </div>
            {approval.approverNotes && <p className="text-sm text-muted-foreground">{approval.approverNotes}</p>}
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export const ApprovalsPage = () => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [openShiftRequests, setOpenShiftRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const response = await fetch('http://localhost:5000/workDay/leaves');
        if (!response.ok) {
          throw new Error('Failed to fetch approvals');
        }
        const data = await response.json();
        const transformedData = data.map((item: any) => ({
          id: item._id,
          type: 'leave',
          employeeName: `${item.employeeId.firstName} ${item.employeeId.lastName}`,
          employeeId: item.employeeId,
          requestDate: new Date(item.createdAt).toISOString().split('T')[0],
          status: item.status.toLowerCase(),
          priority: 'medium',
          details: {
            startDate: new Date(item.startDate).toISOString().split('T')[0],
            endDate: new Date(item.endDate).toISOString().split('T')[0],
            leaveType: item.reason,
            days: item.days,
          },
          reason: item.reason,
          approverNotes: item.approverNotes || '',
        }));
        
        setApprovals(transformedData);
      } catch (error) {
        console.error('Error fetching approvals:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchOpenShiftRequests = async () => {
      if (!user?.employeeId) return;
      try {
        const res = await fetch(`http://localhost:5000/workDay/shifts/requests/manager/${user.employeeId}`);
        const data = await res.json();
        console.log("Fetched open shift requests:", data);
        setOpenShiftRequests(data);
      } catch (err) {
        console.error("Error fetching open shift requests:", err);
      }
    };

    fetchApprovals();
    fetchOpenShiftRequests();
    setLoading(false);
  }, [user]);

  const filteredApprovals = approvals.filter((approval) => {
    const statusMatch = filter === 'all' || approval.status === filter;
    const typeMatch = typeFilter === 'all' || approval.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;
  const approvedCount = approvals.filter((a) => a.status === 'approved').length;
  const rejectedCount = approvals.filter((a) => a.status === 'rejected').length;
  const highPriorityCount = approvals.filter((a) => a.priority === 'high' && a.status === 'pending').length;

 const handleApprove = async (id: string, notes: string) => {
  const confirmed = window.confirm("Are you sure you want to approve this request?");
  if (!confirmed) return;
  try {
    const response = await fetch(`http://localhost:5000/workDay/leaves/${id}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "Approved",
        approverNotes: notes,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to update leave request");
    }
    const updatedLeave = await response.json();
    setApprovals((prev) =>
      prev.map((approval) =>
        approval.id === id ? { ...approval, status: "approved", approverNotes: notes } : approval
      )
    );

    // Send notification to employee
    await fetch("http://localhost:5000/workDay/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: user.employeeId, // Replace with actual manager ID
        receiverId: updatedLeave.employeeId._id, // Employee who requested
        title: "Leave Approved",
        message: `Your leave request from ${updatedLeave.startDate} to ${updatedLeave.endDate} has been approved.`,
        type: "success",
        category: "leave",
      }),
    });
  } catch (error) {
    console.error("Error approving leave request:", error);
  }
};

const handleReject = async (id: string, notes: string) => {
  const confirmed = window.confirm("Are you sure you want to reject this request?");
  if (!confirmed) return;
  try {
    const response = await fetch(`http://localhost:5000/workDay/leaves/${id}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "Rejected",
        approverNotes: notes,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to update leave request");
    }
    const updatedLeave = await response.json();
    setApprovals((prev) =>
      prev.map((approval) =>
        approval.id === id ? { ...approval, status: "rejected", approverNotes: notes } : approval
      )
    );

    // Send notification to employee
    await fetch("http://localhost:5000/workDay/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: user.employeeId, // Replace with actual manager ID
        receiverId: updatedLeave.employeeId._id, // Employee who requested
        title: "Leave Rejected",
        message: `Your leave request from ${updatedLeave.startDate} to ${updatedLeave.endDate} has been rejected.`,
        type: "error",
        category: "leave",
      }),
    });
  } catch (error) {
    console.error("Error rejecting leave request:", error);
  }
};

// Approve Open Shift
  const handleApproveOpenShift = async (shiftId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/workDay/shifts/request/approve/${shiftId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId: user.employeeId }),
      });
      if (!res.ok) throw new Error("Failed to approve open shift");
      // Optionally update UI
      setOpenShiftRequests((prev) => prev.filter((shift) => shift._id !== shiftId));
    } catch (err) {
      console.error("Error approving open shift:", err);
    }
  };

  // Reject Open Shift
  const handleRejectOpenShift = async (shiftId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/workDay/shifts/request/reject/${shiftId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId: user.employeeId }),
      });
      if (!res.ok) throw new Error("Failed to reject open shift");
      setOpenShiftRequests((prev) => prev.filter((shift) => shift._id !== shiftId));
    } catch (err) {
      console.error("Error rejecting open shift:", err);
    }
  };

  if (loading) {
    return <div>Loading approvals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Approvals Dashboard</h1>
          <p className="text-muted-foreground">Review and manage employee requests requiring approval</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>High Priority</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">Urgent requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filter Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="type-filter">Request Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="leave">Leave Requests</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Filter className="h-12 w-12 text-muted-foreground mb-4" />
              <h3>No requests found</h3>
              <p className="text-muted-foreground text-center">No requests match the current filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredApprovals.map((approval) => {
            const TypeIcon = getTypeIcon(approval.type);
            return (
              <Card key={approval.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Leave Request</CardTitle>
                        <CardDescription>
                          {approval.employeeName} • Submitted {formatDate(approval.requestDate)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(approval.priority)} size="sm">
                        {approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)}
                      </Badge>
                      <Badge className={getStatusColor(approval.status)}>
                        {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{approval.reason}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Employee ID: {approval.employeeId._id}</div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <ApprovalDetailDialog
                          approval={approval}
                          onApprove={handleApprove}
                          onReject={handleReject}
                        />
                      </Dialog>
                      {approval.status === 'pending' && (
                        <>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(approval.id, "")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(approval.id, "")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Open Shift Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle>Open Shift Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {openShiftRequests.length === 0 ? (
            <div className="text-muted-foreground">No open shift requests pending approval.</div>
          ) : (
            openShiftRequests.map((shift) => (
              <div key={shift._id} className="border-b py-3 flex justify-between items-center">
                <div>
                  <div>
                    <strong>Employee:</strong> {shift.requestedBy?.firstName} {shift.requestedBy?.lastName}
                  </div>
                  <div>
                    <strong>Date:</strong> {new Date(shift.date).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Time:</strong> {new Date(shift.startTime).toLocaleTimeString()} - {new Date(shift.endTime).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => handleApproveOpenShift(shift._id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleRejectOpenShift(shift._id)}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
