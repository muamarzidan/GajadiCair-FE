import { createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "@/components/protected-route";
import PublicLayout from "@/layouts/PublicLayout";
import AuthLayout from "@/layouts/AuthLayout";
import HomePage from "@/pages/frontoffice/Landing";
import LoginPage from "@/pages/frontoffice/LoginPage";
import RegisterPage from "@/pages/frontoffice/RegisterPage";
import DashboardPage from "@/pages/backoffice/DashboardPage";
import EmployeePage from "@/pages/backoffice/employees/EmployeePage";
import UpgradePage from "@/pages/backoffice/UpgradePage";
import SubscriptionHistoryPage from "@/pages/backoffice/subscription/SubscriptionHistoryPage";
import AttendancePage from "@/pages/backoffice/attendance/AttendancePage";
import FaceRegistrationPage from "@/pages/backoffice/enroll/FaceRegistrationPage";
import ProfilePage from "@/pages/backoffice/ProfilePage";
import SettingsPage from "@/pages/backoffice/SettingsPage";
import EmployeeLeaveApplicationPage from "@/pages/backoffice/leave/EmployeeLeaveApplicationPage";
import CompanyLeaveApplicationPage from "@/pages/backoffice/leave/CompanyLeaveApplicationPage";
import HolidayPage from "@/pages/backoffice/holiday/HolidayPage";
import HolidayPreviewPage from "@/pages/backoffice/holiday/HolidayPreviewPage";
import AttendanceSummaryPage from "@/pages/backoffice/attendance/AttendanceSummaryPage";
import AttendanceOverviewPage from "@/pages/backoffice/attendance/AttendanceOverviewPage";
import EmployeeAttendanceSummaryPage from "@/pages/backoffice/attendance/EmployeeAttendanceSummaryPage";
import AllowanceRulesPage from "@/pages/backoffice/payroll/AllowanceRulesPage";
import DeductionRulesPage from "@/pages/backoffice/payroll/DeductionRulesPage";
import PayrollSummaryPage from "@/pages/backoffice/payroll/PayrollSummaryPage";
import EmployeePayrollSummaryPage from "@/pages/backoffice/payroll/EmployeePayrollSummaryPage";
import EmployeePayrollHistoryPage from "@/pages/backoffice/payroll/EmployeePayrollHistoryPage";
import EmployeePayrollDetailPage from "@/pages/backoffice/payroll/EmployeePayrollDetailPage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "/register",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/employee",
    element: (
      <ProtectedRoute requiredRole="company">
        <EmployeePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/upgrade",
    element: (
      <ProtectedRoute requiredRole="company">
        <UpgradePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/subscription-history",
    element: (
      <ProtectedRoute requiredRole="company">
        <SubscriptionHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/holiday",
    element: (
      <ProtectedRoute requiredRole="company">
        <HolidayPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/holiday-preview",
    element: (
      <ProtectedRoute requiredRole="company">
        <HolidayPreviewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/attendance",
    element: (
      <ProtectedRoute requiredRole="employee">
        <AttendancePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-attendance-summary",
    element: (
      <ProtectedRoute requiredRole="employee">
        <EmployeeAttendanceSummaryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/attendance-overview",
    element: (
      <ProtectedRoute requiredRole="company">
        <AttendanceOverviewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/attendance-summary",
    element: (
      <ProtectedRoute requiredRole="company">
        <AttendanceSummaryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute requiredRole="company">
        <SettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/application",
    element: (
      <ProtectedRoute requiredRole="employee">
        <EmployeeLeaveApplicationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/application-management",
    element: (
      <ProtectedRoute requiredRole="company">
        <CompanyLeaveApplicationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payroll-summary",
    element: (
      <ProtectedRoute requiredRole="company">
        <PayrollSummaryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payroll-allowance-rules",
    element: (
      <ProtectedRoute requiredRole="company">
        <AllowanceRulesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payroll-deduction-rules",
    element: (
      <ProtectedRoute requiredRole="company">
        <DeductionRulesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-payroll/summary",
    element: (
      <ProtectedRoute requiredRole="employee">
        <EmployeePayrollSummaryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-payroll/history",
    element: (
      <ProtectedRoute requiredRole="employee">
        <EmployeePayrollHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-payroll/detail/:payrollLogId",
    element: (
      <ProtectedRoute requiredRole="employee">
        <EmployeePayrollDetailPage />
      </ProtectedRoute>
    ),
  },
  // Face Registration (protected by navigation state check)
  {
    path: "/face-registration",
    element: <FaceRegistrationPage />,
  },
]);