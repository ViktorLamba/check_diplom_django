import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../pages/login/ui/LoginPage";
import { HomePage } from "../pages/home/ui/HomePage";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
]);
