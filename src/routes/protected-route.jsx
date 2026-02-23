// routes/protected-route.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../hooks/useAuth";
import DashboardLayout from "../layouts/dashboard.layout";

const ProtectedRoute = () => {
  const { data: user, isLoading } = useCurrentUser({
    // Only fetch when accessing protected routes
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Logged in but not verified → redirect to verification page
  if (!user.isVerified) {
    return (
      <Navigate
        to="/auth/verify-account"
        state={{ email: user.email }}
        replace
      />
    );
  }

  // Logged in and verified → render dashboard layout with nested routes
  return <DashboardLayout />;
};

export default ProtectedRoute;
