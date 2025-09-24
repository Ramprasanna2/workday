import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { DashboardLayout } from './components/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { WorkforceProductPage } from './pages/WorkforceProductPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import {EmployeeManagement} from './pages/EmployeeManagement';
import { AttendancePage } from './pages/AttendancePage';
import { LeaveRequestsPage } from './pages/LeaveRequestsPage';
import ShiftsPage  from './pages/ShiftsPage';
import { PayslipsPage } from './pages/PayslipsPage';
import  ShiftSwapsPage  from './pages/ShiftSwapsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PayrollPage } from './pages/PayrollPage';
import { ReportsPage } from './pages/ReportsPage';
import { TeamAttendancePage } from './pages/TeamAttendancePage';
import { ShiftManagementPage } from './pages/ShiftManagementPage';
import { SettingsPage } from './pages/SettingsPage';
import { HCMDashboard } from './pages/HCMDashboard';
import { GoalManagementPage}  from './pages/GoalManagementPage';
import { MyGoalsPage } from './pages/MyGoalsPage';
import  DepartmentPositionPage  from './pages/Departmentss';
import EmployeeManagementPage from './pages/Employeesss'
import RecruitmentPage from './pages/RecruitmentPage';
import { RecruitmentOnboardingPage } from './pages/RecruitmentOnboardingPage'; // <-- Import onboarding page


const AboutPage = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">About WorkForce Pro</h1>
      <p className="text-lg text-muted-foreground">
        WorkForce Pro is a comprehensive workforce management solution designed to streamline 
        HR operations and improve employee experience.
      </p>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <p className="text-lg text-muted-foreground">
        Get in touch with our team for support or sales inquiries.
      </p>
    </div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes with navbar */}
            <Route path="/" element={
              <>
                <Navbar />
                <LandingPage />
              </>
            } />
            
            <Route path="/products/workforce-management" element={
              <>
                <Navbar />
                <WorkforceProductPage />
              </>
            } />
            
            <Route path="/about" element={
              <>
                <Navbar />
                <AboutPage />
              </>
            } />
            
            <Route path="/contact" element={
              <>
                <Navbar />
                <ContactPage />
              </>
            } />
            
            <Route path="/hcm-dashboard" element={
              <ProtectedRoute>
                <HCMDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Employee routes */}
            <Route path="/dashboard/shifts" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <DashboardLayout>
                  <ShiftsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/my-goals" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <DashboardLayout>
                  <MyGoalsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/leave-requests" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <DashboardLayout>
                  <LeaveRequestsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/attendance" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <DashboardLayout>
                  <AttendancePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/payslips" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <DashboardLayout>
                  <PayslipsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/shift-swaps" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <DashboardLayout>
                  <ShiftSwapsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Manager/Admin routes */}
            <Route path="/dashboard/employees" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <EmployeeManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/goals" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <DashboardLayout>
                  <GoalManagementPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/approvals" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <DashboardLayout>
                  <ApprovalsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/notifications" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NotificationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Manager/Admin Payroll route */}
            <Route path="/dashboard/payroll" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <DashboardLayout>
                  <PayrollPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Manager/Admin Reports route */}
            <Route path="/dashboard/reports" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin Team Attendance route */}
            <Route path="/dashboard/team-attendance" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <TeamAttendancePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin Shift Management route */}
            <Route path="/dashboard/shift-management" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <ShiftManagementPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin Settings route */}
            <Route path="/dashboard/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin Department Position route */}
            <Route path="/dashboard/departments" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <DepartmentPositionPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin Employee Management route */}
            <Route path="/dashboard/employeees" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DashboardLayout>
                  <EmployeeManagementPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
 {/* Admin Recruitment main page */}
            <Route path="/dashboard/recruitment" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <RecruitmentPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Admin Recruitment Onboarding page */}
            <Route path="/dashboard/recruiting/onboarding" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <RecruitmentOnboardingPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}