import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminSubscriptions from "@/pages/admin/subscriptions";
import AdminUsers from "@/pages/admin/users";
import AdminPlans from "@/pages/admin/plans";
import AdminLicenses from "@/pages/admin/licenses";
import AdminPromoCodes from "@/pages/admin/promo-codes";
import AdminInvoices from "@/pages/admin/invoices";
import AdminPayments from "@/pages/admin/payments";
import AdminPayouts from "@/pages/admin/payouts";
import AdminReferrals from "@/pages/admin/referrals";
import AdminSettingsCompany from "@/pages/admin/company";
import AdminSettingsWhitelabel from "@/pages/admin/whitelabel";

import AppLayout from "@/components/layout/AppLayout";
import AppDashboard from "@/pages/app/dashboard";
import AppCustomers from "@/pages/app/customers";
import AppVehicles from "@/pages/app/vehicles";
import AppServices from "@/pages/app/services";
import AppProducts from "@/pages/app/products";
import AppWorkOrders from "@/pages/app/work-orders";
import AppSales from "@/pages/app/sales";
import AppAccountsReceivable from "@/pages/app/accounts-receivable";
import AppAccountsPayable from "@/pages/app/accounts-payable";
import AppStockMovements from "@/pages/app/stock-movements";
import { LandingLayout } from "@/components/layout/LandingLayout";


import LandingHome from "@/pages/landing/index";


const routes = createBrowserRouter([
  {
    path: "/",
    Component: LandingLayout,
    children: [{
      index: true,
      Component: LandingHome,
    }]
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
      { path: "plans", Component: AdminPlans },
      { path: "licenses", Component: AdminLicenses },
      { path: "promo-codes", Component: AdminPromoCodes },
      { path: "invoices", Component: AdminInvoices },
      { path: "payments", Component: AdminPayments },
      { path: "payouts", Component: AdminPayouts },
      { path: "referrals", Component: AdminReferrals },
      {
        path: "settings", children: [
          { path: "company", Component: AdminSettingsCompany },
          { path: "whitelabel", Component: AdminSettingsWhitelabel }
        ]
      },
    ],
  },
  {
    path: "app",
    Component: AppLayout,
    children: [
      { path: "dashboard", Component: AppDashboard },
      { path: "customers", Component: AppCustomers },
      { path: "vehicles", Component: AppVehicles },
      { path: "services", Component: AppServices },
      { path: "products", Component: AppProducts },
      { path: "work-orders", Component: AppWorkOrders },
      { path: "sales", Component: AppSales },
      { path: "accounts-receivable", Component: AppAccountsReceivable },
      { path: "accounts-payable", Component: AppAccountsPayable },
      { path: "stock-movements", Component: AppStockMovements },
    ],
  },
]);

export default routes;