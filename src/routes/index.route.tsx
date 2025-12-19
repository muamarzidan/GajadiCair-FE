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
import AttendancePage from "@/pages/backoffice/AttendancePage";
import FaceRegistrationPage from "@/pages/backoffice/FaceRegistrationPage";


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
    path: "/attendance",
    element: (
      <ProtectedRoute requiredRole="employee">
        <AttendancePage />
      </ProtectedRoute>
    ),
  },
  // Face Registration (protected by navigation state check)
  {
    path: "/face-registration",
    element: <FaceRegistrationPage />,
  },
]);