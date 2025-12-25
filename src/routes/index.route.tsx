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
  // Shortcut routes
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
  // Protected Dashboard Routes
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
  // Face Registration (protected by navigation state check)
  {
    path: "/face-registration",
    element: <FaceRegistrationPage />,
  },
]);