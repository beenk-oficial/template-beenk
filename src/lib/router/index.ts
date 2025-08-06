import { createBrowserRouter } from "react-router-dom";
import Landing from "@/pages/landing/index";
import AuthLayout from "@/components/layout/AuthLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminSubscriptions from "@/pages/admin/subscriptions";
import AdminUsers from "@/pages/admin/users";


const routes = createBrowserRouter([
  {
    index: true,
    Component: Landing,
  },
  {
    path: "auth",
    Component: AuthLayout,
    children: [
      { path: "signin", Component: SignIn },
      { path: "signup", Component: SignUp },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "reset-password", Component: ResetPassword },
    ],
  },
  {
    path: "admin",
    Component: AdminLayout,
    children: [
      { path: "dashboard", Component: AdminDashboard },
      { path: "subscriptions", Component: AdminSubscriptions },
      { path: "users", Component: AdminUsers },
    ],
  },
]);

export default routes;