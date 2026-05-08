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
    path: "/home",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "verification",
        element: <VerificationPage />,
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "diplomas",
        element: <DiplomasPage />,
      },
      {
        path: "account",
        element: <AccountPage />,
      },
    ],
  },
]);
