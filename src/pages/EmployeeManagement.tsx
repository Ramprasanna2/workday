import React, { useState ,useEffect} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { UniversalBackButton } from "../components/UniversalBackButton";
import {
  Search,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Users,
  Eye,
  ChevronDown,
  ChevronRight,
  Filter,
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: "active" | "inactive";
  joiningDate: string;
  location: string;
  employeeId: string;
  managerId: string;
  skills?: string[];
  performanceRating?: number;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  joiningDate: string;
  location: string;
  employees: Employee[];
}

export const EmployeeManagement: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  // ...other state...

  useEffect(() => {
    // Fetch managers with their teams from backend
    fetch("http://localhost:5000/workDay/employees/managers-with-teams")
      .then((res) => res.json())
      .then((data) => {
        // data is [{ manager: {...}, team: [...] }, ...]
        // Map to Manager[] shape expected by your UI
        const mappedManagers = data.map((item: any) => ({
          id: item.manager._id,
          name: item.manager.name || `${item.manager.firstName} ${item.manager.lastName}`,
          email: item.manager.email,
          phone: item.manager.phone || "",
          department: item.manager.jobInfo?.departmentId?.name || "",
          role: item.manager.role,
          joiningDate: item.manager.jobInfo?.hireDate || "",
          location: item.manager.assignedLocationId?.name || "",
          employees: item.team.map((emp: any) => ({
            id: emp._id,
            name: emp.name || `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            phone: emp.phone || "",
            department: emp.jobInfo?.departmentId?.name || "",
            designation: emp.jobInfo?.positionId?.title || "",
            status: emp.status || "active",
            joiningDate: emp.jobInfo?.hireDate || "",
            location: emp.assignedLocationId?.name || "",
            employeeId: emp.employeeId || "",
            managerId: emp.jobInfo?.managerId?._id || "",
            skills: emp.skills || [],
            performanceRating: emp.performanceRating || 0,
          })),
        }));
        setManagers(mappedManagers);
      })
      .catch((err) => {
        console.error("Failed to fetch managers with teams:", err);
      });
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] =useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedManager, setSelectedManager] =useState<Manager | null>(null);
  const [selectedEmployee, setSelectedEmployee] =useState<Employee | null>(null);
  const [expandedManagers, setExpandedManagers] = useState<Set<string>>(new Set());

  const departments = [
    "Engineering",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Operations",
  ];

  const filteredManagers = managers
    .filter((manager) => {
      const matchesSearch =
        manager.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        manager.department
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesDepartment =
        departmentFilter === "all" ||
        manager.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "department":
          return a.department.localeCompare(b.department);
        case "teamSize":
          return b.employees.length - a.employees.length;
        default:
          return 0;
      }
    });

  const toggleManagerExpansion = (managerId: string) => {
    const newExpanded = new Set(expandedManagers);
    if (newExpanded.has(managerId)) {
      newExpanded.delete(managerId);
    } else {
      newExpanded.add(managerId);
    }
    setExpandedManagers(newExpanded);
  };

  const getTotalEmployees = () => {
    return managers.reduce(
      (total, manager) => total + manager.employees.length,
      0,
    );
  };

  const getActiveEmployees = () => {
    return managers.reduce((total, manager) => {
      return (
        total +
        manager.employees.filter(
          (emp) => emp.status === "active",
        ).length
      );
    }, 0);
  };

  return (
    <div className="space-y-6">
      <UniversalBackButton />

      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <h1>Employee Management</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">
                  Admin Portal
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  Employee Management
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Search Bar and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search managers by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={departmentFilter}
            onValueChange={setDepartmentFilter}
          >
            <SelectTrigger className="w-full lg:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Departments
              </SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="department">
                Department
              </SelectItem>
              <SelectItem value="teamSize">
                Team Size
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalEmployees()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Employees
            </CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getActiveEmployees()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Managers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {managers.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Departments
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                new Set(managers.map((mgr) => mgr.department))
                  .size
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manager Listing */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Manager Directory</CardTitle>
            <CardDescription>
              View and manage all managers and their teams in
              the organization.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {filteredManagers.map((manager) => (
              <div
                key={manager.id}
                className="border rounded-lg"
              >
                {/* Manager Card */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 rounded-full p-2">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">
                            {manager.name}
                          </h3>
                          <Badge variant="outline">
                            {manager.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {manager.department}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{manager.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>
                              {manager.employees.length} team
                              members
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSelectedManager(manager)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>
                              Manager Profile
                            </DialogTitle>
                          </DialogHeader>
                          {selectedManager && (
                            <div className="space-y-4">
                              <div className="text-center">
                                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-2">
                                  <User className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-semibold">
                                  {selectedManager.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {selectedManager.role}
                                </p>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {selectedManager.department}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {selectedManager.email}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {selectedManager.phone}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    Joined{" "}
                                    {new Date(
                                      selectedManager.joiningDate,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {
                                      selectedManager.employees
                                        .length
                                    }{" "}
                                    Team Members
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {selectedManager.location}
                                  </span>
                                </div>
                              </div>

                              <div className="flex space-x-2 pt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit Profile
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleManagerExpansion(manager.id)
                        }
                      >
                        {expandedManagers.has(manager.id) ? (
                          <>
                            <ChevronDown className="mr-2 h-4 w-4" />
                            Hide Team
                          </>
                        ) : (
                          <>
                            <ChevronRight className="mr-2 h-4 w-4" />
                            View Team
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Team Members (Collapsible) */}
                <Collapsible
                  open={expandedManagers.has(manager.id)}
                >
                  <CollapsibleContent>
                    <div className="border-t bg-muted/20">
                      <div className="p-4">
                        <h4 className="font-medium mb-3">
                          Team Members (
                          {manager.employees.length})
                        </h4>
                        <div className="space-y-2">
                          {manager.employees.map((employee) => (
                            <div
                              key={employee.id}
                              className="flex items-center justify-between p-3 bg-background rounded-md border"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="bg-secondary rounded-full p-2">
                                  <User className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">
                                      {employee.name}
                                    </span>
                                    <Badge
                                      variant={
                                        employee.status ===
                                        "active"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {employee.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <span>
                                      {employee.designation}
                                    </span>
                                    <span>
                                      ID: {employee.employeeId}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setSelectedEmployee(
                                        employee,
                                      )
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Employee Profile
                                    </DialogTitle>
                                  </DialogHeader>
                                  {selectedEmployee && (
                                    <div className="space-y-4">
                                      <div className="text-center">
                                        <div className="bg-secondary rounded-full p-4 w-16 h-16 mx-auto mb-2">
                                          <User className="h-8 w-8" />
                                        </div>
                                        <h3 className="font-semibold">
                                          {
                                            selectedEmployee.name
                                          }
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                          {
                                            selectedEmployee.designation
                                          }
                                        </p>
                                      </div>

                                      <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                          <Badge className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">
                                            ID:{" "}
                                            {
                                              selectedEmployee.employeeId
                                            }
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Mail className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">
                                            {
                                              selectedEmployee.email
                                            }
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Phone className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">
                                            {
                                              selectedEmployee.phone
                                            }
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Calendar className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">
                                            Joined{" "}
                                            {new Date(
                                              selectedEmployee.joiningDate,
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <MapPin className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">
                                            {
                                              selectedEmployee.location
                                            }
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <User className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">
                                            Reports to:{" "}
                                            {
                                              managers.find(
                                                (m) =>
                                                  m.id ===
                                                  selectedEmployee.managerId,
                                              )?.name
                                            }
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Badge
                                            variant={
                                              selectedEmployee.status ===
                                              "active"
                                                ? "default"
                                                : "secondary"
                                            }
                                          >
                                            {
                                              selectedEmployee.status
                                            }
                                          </Badge>
                                        </div>
                                        {selectedEmployee.skills && (
                                          <div>
                                            <p className="text-sm font-medium mb-2">
                                              Skills:
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                              {selectedEmployee.skills.map(
                                                (
                                                  skill,
                                                  index,
                                                ) => (
                                                  <Badge
                                                    key={index}
                                                    variant="outline"
                                                    className="text-xs"
                                                  >
                                                    {skill}
                                                  </Badge>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex space-x-2 pt-4">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="flex-1"
                                        >
                                          <Edit2 className="mr-2 h-4 w-4" />
                                          Edit Employee
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};