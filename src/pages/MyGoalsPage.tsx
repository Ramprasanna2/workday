import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { format } from 'date-fns';
import { 
  Target, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Eye,
  Edit,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { UniversalBackButton } from '../components/UniversalBackButton';

interface Goal {
  _id: string;
  title: string;
  description: string;
  employeeId: string;
  employeeName?: string;  // you can populate this in backend if needed
  dueDate: Date;
  status: 'Pending' | 'Ongoing' | 'Completed';
  assignedBy: string;
  createdAt: Date;
  updatedAt: Date;
  modules: ModuleItem[];
  notes?: string;
  progress?: number;
}

interface ModuleItem {
  _id: string;
  name: string;
  status: 'Pending' | 'Completed';
}

type ModuleStatus = 'Pending' | 'Completed';

interface Employee {
   _id: string;
  firstName: string;
  lastName: string;
  name: string; // full name for display
  email: string;
  role: "Employee" | "Manager" | "Admin";

  jobInfo: {
    positionId: {
      _id: string;
      title: string;
    } | string; // populated or just ID

    departmentId: {
      _id: string;
      name: string;
    } | string; // populated or just ID

    managerId?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | string; // populated or just ID

    hireDate: string; // ISO date string when fetched from API
  };

  compensation: {
    wage: number;
    payPeriod: "Annual" | "Monthly";
  };

  leaveBalances: {
    annual: number;
    sick: number;
  };
  managerName:string;
  createdAt: string;
  updatedAt: string;

}

export const MyGoalsPage: React.FC = () => {
  const { user } = useAuth();
  const [employee,setEmployee]=useState<Employee | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'Pending' | 'Ongoing' | 'Completed'>('Pending');
  const [updateNotes, setUpdateNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data for current user's goals
  useEffect(() => {
  const fetchEmployeeGoals = async () => {
    if (!user?.employeeId) return;

    try {
      const response = await fetch(`http://localhost:5000/workDay/goals/employee/${user.employeeId}`); 
      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }
      const data: Goal[] = await response.json();
      console.log(data);
      setGoals(data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const fetchEmployee =async () => {
    if (!user?.employeeId) return;

    try {
      const response = await fetch(`http://localhost:5000/workDay/employees/employee/${user.employeeId}`); 
      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }
      const data: Employee = await response.json();
      data.name=`${data.firstName} ${data.lastName}`;
      data.managerName = typeof data.jobInfo.managerId === 'object' && data.jobInfo.managerId 
        ? `${data.jobInfo.managerId.firstName} ${data.jobInfo.managerId.lastName}` 
        : 'Unknown Manager';

      console.log(data);
      setEmployee(data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  fetchEmployeeGoals();
  fetchEmployee();
}, [user]);

// Example function to call bulk update API
async function updateModulesStatus(goalId: string, modules: { _id: string, status: 'Pending' | 'Completed' }[]) {
  const updates = modules.map(m => ({ moduleId: m._id, status: m.status }));
  console.log(selectedGoal.modules.map(m => m.status)); // Should only show "Pending" or "Completed"
  const res = await fetch(`http://localhost:5000/workDay/goals/${goalId}/modules/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      // Add auth header if needed
    },
    body: JSON.stringify({ updates }),
  });
  console.log(res);
  return await res.json();
}

const handleUpdateStatus = async () => {
    if (!selectedGoal) return;

    // Update modules status
    await updateModulesStatus(selectedGoal._id, selectedGoal.modules);

    const updatedGoal = {
      ...selectedGoal,
      status: newStatus,
      updatedAt: new Date(),
      notes: updateNotes || selectedGoal.description,
      progress: newStatus === 'Completed' ? 100 : newStatus === 'Ongoing' ? Math.max(selectedGoal.progress || 0, 25) : 0,
    };

    setGoals(prev => prev.map(goal => 
      goal._id === selectedGoal._id ? updatedGoal : goal
    ));

    setIsUpdateDialogOpen(false);
    setUpdateNotes('');
    setSelectedGoal(null);

    // In a real app, you would send this update to the backend
    // and notify the manager
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Ongoing': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Completed': return 'bg-green-100 text-green-800 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <AlertCircle className="h-4 w-4" />;
      case 'Ongoing': return <Clock className="h-4 w-4" />;
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredGoals = filterStatus === 'all' 
    ? goals 
    : goals.filter(goal => goal.status.toLowerCase() === filterStatus);

  const stats = {
    total: goals.length,
    pending: goals.filter(g => g.status === 'Pending').length,
    ongoing: goals.filter(g => g.status === 'Ongoing').length,
    completed: goals.filter(g => g.status === 'Completed').length,
    completionRate: goals.length > 0 ? Math.round((goals.filter(g => g.status === 'Completed').length / goals.length) * 100) : 0,
  };

  // Add this helper function to refresh goals badge
  const refreshGoalsBadge = () => {
    window.dispatchEvent(new CustomEvent('refreshGoalsBadge'));
  };

  // Call this function after any goal updates (create, update, complete, etc.)
  // For example, after goal completion:
  const handleCompleteGoal = async (goalId: string) => {
    try {
      // ... existing goal completion logic
      
      // Refresh the badge
      refreshGoalsBadge();
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <UniversalBackButton />
          <div>
            <h1 className="text-3xl font-bold">My Goals</h1>
            <p className="text-muted-foreground">
              Track and update your assigned goals
            </p>
          </div>
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Goals</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="ongoing">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.ongoing}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => {
          const daysUntilDue = getDaysUntilDue(goal.dueDate);
          const isOverdue = daysUntilDue < 0 && goal.status !== 'Completed';
          const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0 && goal.status !== 'Completed';

          return (
            <Card key={goal._id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      
                      <Badge variant="secondary" className={`${getStatusColor(goal.status)} flex items-center space-x-1`}>
                        {getStatusIcon(goal.status)}
                        <span>{goal.status}</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {goal.status !== 'Completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedGoal(goal);
                          setNewStatus(goal.status);
                          setUpdateNotes(goal.notes || '');
                          setIsUpdateDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {goal.description}
                </p>
                
                {goal.progress !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Due {format(new Date(goal.dueDate), 'MMM dd, yyyy')}</span>
                  </div>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs">
                      {Math.abs(daysUntilDue)} days overdue
                    </Badge>
                  )}
                  {isDueSoon && (
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                      Due in {daysUntilDue} days
                    </Badge>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Assigned by {employee?.managerName || "Unknown"}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredGoals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No goals found</h3>
            <p className="text-muted-foreground">
              {filterStatus === 'all' 
                ? "You don't have any goals assigned yet." 
                : `No ${filterStatus} goals found.`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Goal Detail Dialog */}
<Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
  <DialogContent className="max-w-2xl">
    {selectedGoal && (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>{selectedGoal.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(selectedGoal.status)} flex items-center space-x-1`}
            >
              {getStatusIcon(selectedGoal.status)}
              <span>{selectedGoal.status}</span>
            </Badge>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-muted-foreground">{selectedGoal.description}</p>
          </div>

          {/* Modules Section */}
          {selectedGoal.modules && selectedGoal.modules.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Modules</h4>
              <div className="space-y-2">
                {selectedGoal.modules.map((module) => (
                  <div 
                    key={module._id} 
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <span className="text-sm">{module.name}</span>
                    {module.status === 'Completed' ? (
                      <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Completed</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Pending</span>
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Due Date</h4>
              <p className="text-sm text-muted-foreground">
                {format(selectedGoal.dueDate, 'EEEE, MMMM dd, yyyy')}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Assigned By</h4>
              <p className="text-sm text-muted-foreground">{employee?.managerName || "Unknown"}</p>
            </div>
          </div>

          {selectedGoal.description && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {selectedGoal.notes}
              </p>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Last updated: {format(selectedGoal.updatedAt, 'MMM dd, yyyy at h:mm a')}
          </div>
        </div>
      </>
    )}
  </DialogContent>
</Dialog>


      {/* Update Status Dialog */}
<Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
  <DialogContent>
    {selectedGoal && (
      <>
        <DialogHeader>
          <DialogTitle>Update Goal Status</DialogTitle>
          <DialogDescription>
            Update the status and add notes for "{selectedGoal.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ✅ Show Modules with Complete Button */}
          {selectedGoal.modules && selectedGoal.modules.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Modules</h4>
              <ul className="space-y-2 text-sm">
                {selectedGoal.modules.map((module, idx) => (
                  <li key={module._id} className="flex items-center space-x-3">
                    <span style={{flex:1}}className={module.status === "Completed" ? "line-through text-muted-foreground" : ""}>
                      {module.name}
                    </span>
                    <Badge
            className={
              module.status === "Completed"
                ? "bg-green-600 text-white font-bold"
                : "bg-yellow-400 text-black font-bold"
            }
          >
            {module.status}
          </Badge>
                  <Select
                      value={module.status}
                      onValueChange={(value: "Pending" | "Completed") => {
                        setSelectedGoal((prev) => {
                          if (!prev) return prev;
                          const updatedModules = prev.modules.map((m, i) =>
                            i === idx ? { ...m, status: value } : m
                          );
                          return { ...prev, modules: updatedModules };
                        });
                      }}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </li>
                ))}
              </ul>
            </div>
          )}1


          <div>
            <Label htmlFor="notes">Update Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="Add notes about your progress or any updates..."
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleUpdateStatus} className="flex-1">
              Update Status
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
};