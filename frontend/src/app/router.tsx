import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../pages/login/ui/LoginPage";
import { HomePage } from "../pages/home/ui/HomePage";
import { PublicHomePage } from "../pages/home/ui/PublicHomePage";
import { DashboardPage } from "../pages/home/ui/DashboardPage";
import { VerificationPage } from "../pages/verification/ui/VerificationPage";
import { HistoryPage } from "../pages/history/ui/HistoryPage";
import { DiplomasPage } from "../pages/diplomas/ui/DiplomasPage";
import { AccountPage } from "../pages/account/ui/AccountPage";
import { AdminUsersPage } from "../pages/admin-users/ui/AdminUsersPage";
import { AdminUniversitiesPage } from "../pages/admin-universities/ui/AdminUniversitiesPage";
import { StudentsPage } from "../pages/students/ui/StudentsPage";
import { CreateDiplomaPage } from "../pages/diploma-create/ui/CreateDiplomaPage";
import { MyDiplomasPage } from "../pages/my-diplomas/ui/MyDiplomasPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },
  {
    path: "/home",
    element: <PublicHomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/forbidden",
    element: <div>Доступ запрещён</div>,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),

    children: [
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={["admin", "university"]}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "verification",
        element: (
          <ProtectedRoute allowedRoles={["admin", "university"]}>
            <VerificationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "history",
        element: (
          <ProtectedRoute allowedRoles={["admin", "university"]}>
            <HistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "diplomas",
        element: (
          <ProtectedRoute allowedRoles={["admin", "university"]}>
            <DiplomasPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "account",
        element: <AccountPage />,
      },
      {
        path: "universities",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUniversitiesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "students",
        element: (
          <ProtectedRoute allowedRoles={["university"]}>
            <StudentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "diplomas/create",
        element: (
          <ProtectedRoute allowedRoles={["university"]}>
            <CreateDiplomaPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-diplomas",
        element: (
          <ProtectedRoute allowedRoles={["student"]}>
            <MyDiplomasPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
