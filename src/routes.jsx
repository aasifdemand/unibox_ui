import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import AuthLayout from './layouts/auth.layout';
import DashboardLayout from './layouts/dashboard.layout';
import ProtectedRoute from './routes/protected-route';
import AuthRoute from './routes/auth-route';

// Lazy-loaded route components
import Login from './routes/auth/login';
const Signup = lazy(() => import('./routes/auth/signup'));
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
const Settings = lazy(() => import('./routes/dashboard/settings'));
const CRM = lazy(() => import('./routes/dashboard/crm'));
const Integrations = lazy(() => import('./routes/dashboard/integrations'));
const Notifications = lazy(() => import('./routes/dashboard/notifications'));
import Landing from './routes/landing';

const LoadingFallback = () => (
  <div className="flex h-screen w-full flex-col items-center justify-center bg-[#fafafa]">
    <div className="relative">
      <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full" />
      <Loader2 className="h-12 w-12 animate-spin text-orange-600 relative z-10" />
    </div>
    <p className="mt-6 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase animate-pulse">
      Initialising Unibox
    </p>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Auth routes (ONLY for logged-out users) */}
        <Route path="auth" element={<AuthRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="signup" element={<Signup />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-account" element={<VerifyAccount />} />
          </Route>
        </Route>

        <Route path="/" element={<Landing />} />

        {/* Protected app routes (ONLY for logged-in users) */}
        <Route path="dashboard" element={<ProtectedRoute />}>
          <Route path="campaigns/create" element={<CreateCampaign />} />
          <Route element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="mailboxes" element={<Mailboxes />} />
            <Route path="campaigns" element={<Campaigns />} />

            <Route path="campaigns/:id" element={<ViewCampaign />} />
            <Route path="audience" element={<Audience />} />
            <Route path="crm" element={<CRM />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="analytics" element={<Analytics />} />

            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
