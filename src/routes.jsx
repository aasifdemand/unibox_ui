import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import AuthLayout from './layouts/auth.layout';
import DashboardLayout from './layouts/dashboard.layout';
import ProtectedRoute from './routes/protected-route';
import AuthRoute from './routes/auth-route';

// Lazy-loaded route components
const Signup = lazy(() => import('./routes/auth/signup'));
const Login = lazy(() => import('./routes/auth/login'));
const ForgotPassword = lazy(() => import('./routes/auth/forgot-password'));
const ResetPassword = lazy(() => import('./routes/auth/reset-password'));
const VerifyAccount = lazy(() => import('./routes/auth/verify-account'));

const Dashboard = lazy(() => import('./routes/dashboard'));
const Mailboxes = lazy(() => import('./routes/dashboard/mailboxes'));
const Campaigns = lazy(() => import('./routes/dashboard/campaigns'));
const CreateCampaign = lazy(() => import('./routes/dashboard/campaigns/create-campaign'));
const ViewCampaign = lazy(() => import('./routes/dashboard/campaigns/view-campaign'));
const Audience = lazy(() => import('./routes/dashboard/audience'));
const Analytics = lazy(() => import('./routes/dashboard/analytics'));
const Templates = lazy(() => import('./routes/dashboard/templates'));
const Subscription = lazy(() => import('./routes/dashboard/subscription'));
const Settings = lazy(() => import('./routes/dashboard/settings'));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Auth routes (ONLY for logged-out users) */}
        <Route
          path="auth"
          element={
            <AuthRoute />
          }
        >
          <Route element={<AuthLayout />}>
            <Route path="signup" element={<Signup />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-account" element={<VerifyAccount />} />
          </Route>
        </Route>

        {/* Protected app routes (ONLY for logged-in users) */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute />
          }
        >
          <Route element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="mailboxes" element={<Mailboxes />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaigns/create" element={<CreateCampaign />} />
            <Route path="campaigns/:id" element={<ViewCampaign />} />
            <Route path="audience" element={<Audience />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="templates" element={<Templates />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
