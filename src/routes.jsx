import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import AuthLayout from "./layouts/auth.layout";
import Signup from "./routes/auth/signup";
import Login from "./routes/auth/login";
import ForgotPassword from "./routes/auth/forgot-password";
import ResetPassword from "./routes/auth/reset-password";
import Dashboard from "./routes/dashboard";
import ProtectedRoute from "./routes/protected-route";
import AuthRoute from "./routes/auth-route";
import DashboardLayout from "./layouts/dashboard.layout";
import Campaigns from "./routes/dashboard/campaigns";
import Analytics from "./routes/dashboard/analytics";
import Templates from "./routes/dashboard/templates";
import Settings from "./routes/dashboard/settings";
import CreateCampaign from "./routes/dashboard/campaigns/create-campaign";
import Audience from "./routes/dashboard/audience";
import ViewCampaign from "./routes/dashboard/campaigns/view-campaign";
import Mailboxes from "./routes/dashboard/mailboxes";

// Import React Query hooks
import { useCurrentUser } from "./hooks/useAuth";
import VerifyAccount from "./routes/auth/verify-account";

const AppRoutes = () => {
  const { refetch: refetchUser } = useCurrentUser();

  // Check auth on mount
  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  return (
    <Routes>
      {/* Auth routes (ONLY for logged-out users) */}
      <Route
        path="auth"
        element={
          <AuthRoute>
            <AuthLayout />
          </AuthRoute>
        }
      >
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="verify-account" element={<VerifyAccount />} />
      </Route>

      {/* Protected app routes (ONLY for logged-in users) */}
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="mailboxes" element={<Mailboxes />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="campaigns/create" element={<CreateCampaign />} />
        <Route path="campaigns/:id" element={<ViewCampaign />} />
        <Route path="audience" element={<Audience />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="templates" element={<Templates />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
