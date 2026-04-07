import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoadingSpinner from './components/ui/loading-spinner';

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
const ViewMailbox = lazy(() => import('./routes/dashboard/mailboxes/view-mailbox'));
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
  <LoadingSpinner fullPage size="xl" text="Loading.." />
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
           <Route path="campaigns/:id" element={<ViewCampaign />} />
          <Route element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="mailboxes" element={<Mailboxes />} />
            <Route path="mailboxes/:id" element={<ViewMailbox />} />
            <Route path="campaigns" element={<Campaigns />} />

           
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
