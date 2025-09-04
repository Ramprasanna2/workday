import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { UniversalBackButton } from '../components/UniversalBackButton';
import { 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  DollarSign, 
  CheckSquare,
  Bell,
  UserCheck,
  RotateCcw,
  ArrowRight
} from 'lucide-react';

export const WorkforceProductPage: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Complete employee lifecycle management with detailed profiles, onboarding workflows, and organizational structure visualization.",
      capabilities: ["Employee Profiles", "Onboarding", "Organization Charts", "Employee Directory"]
    },
    {
      icon: FileText,
      title: "Leave Management",
      description: "Streamlined leave request process with automated approvals, balance tracking, and calendar integration.",
      capabilities: ["Leave Requests", "Approval Workflows", "Balance Tracking", "Holiday Calendar"]
    },
    {
      icon: Calendar,
      title: "Shift Scheduling",
      description: "Advanced scheduling tools with drag-and-drop interface, conflict detection, and automated notifications.",
      capabilities: ["Schedule Creation", "Shift Templates", "Conflict Detection", "Auto-fill"]
    },
    {
      icon: RotateCcw,
      title: "Shift Swap Requests",
      description: "Employee-initiated shift swapping with manager approval and automatic schedule updates.",
      capabilities: ["Swap Requests", "Manager Approval", "Schedule Updates", "Notifications"]
    },
    {
      icon: Clock,
      title: "Attendance Tracking",
      description: "Real-time clock-in/out system with GPS tracking, break management, and overtime calculations.",
      capabilities: ["Clock In/Out", "GPS Tracking", "Break Management", "Overtime Calculation"]
    },
    {
      icon: DollarSign,
      title: "Payroll Management",
      description: "Automated payroll processing with tax calculations, deductions, and detailed payslip generation.",
      capabilities: ["Payroll Processing", "Tax Calculations", "Payslip Generation", "Direct Deposit"]
    },
    {
      icon: CheckSquare,
      title: "Approvals Dashboard",
      description: "Centralized approval system for all requests with customizable workflows and delegation options.",
      capabilities: ["Centralized Approvals", "Custom Workflows", "Delegation", "Bulk Actions"]
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Real-time notifications and alerts for important events, deadlines, and approval requests.",
      capabilities: ["Real-time Alerts", "Email Notifications", "Mobile Push", "Custom Rules"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UniversalBackButton />
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl mb-6">
            Workforce Management Solution
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            A comprehensive platform designed to streamline all aspects of workforce management. 
            From employee onboarding to payroll processing, manage your entire workforce efficiently.
          </p>
          <Button size="lg" asChild>
            <Link to="/login">
              Login to Access Platform
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feature.capabilities.map((capability, capIndex) => (
                    <div key={capIndex} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="text-sm text-muted-foreground">{capability}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role-based Access */}
        <section className="bg-muted/50 rounded-xl p-8 mb-16">
          <h2 className="text-3xl mb-6 text-center">Role-Based Dashboard Access</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <UserCheck className="h-8 w-8 text-blue-500 mb-3" />
                <CardTitle>Employee Access</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• View personal schedules</li>
                  <li>• Submit leave requests</li>
                  <li>• Clock in/out</li>
                  <li>• View payslips</li>
                  <li>• Request shift swaps</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-green-500 mb-3" />
                <CardTitle>Manager Access</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Approve leave requests</li>
                  <li>• Monitor team attendance</li>
                  <li>• Create team schedules</li>
                  <li>• View team reports</li>
                  <li>• Manage shift swaps</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckSquare className="h-8 w-8 text-purple-500 mb-3" />
                <CardTitle>Admin Access</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Full employee management</li>
                  <li>• System configuration</li>
                  <li>• Advanced reporting</li>
                  <li>• Payroll processing</li>
                  <li>• Company-wide analytics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl mb-4">Ready to Transform Your Workforce Management?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the power of our workforce management platform. Login to explore all features 
            and see how it can streamline your HR operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/login">Access Platform</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};