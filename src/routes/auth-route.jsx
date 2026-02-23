// routes/auth-route.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../hooks/useAuth";
import AuthLayout from "../layouts/auth.layout";

const AuthRoute = () => {
  const { data: user, isLoading } = useCurrentUser({
    // Only fetch if we're on auth routes
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is logged in AND verified → redirect to dashboard
  if (user?.isVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is logged in but NOT verified → redirect to verification page
  if (user && !user.isVerified) {
    return (
      <Navigate
        to="/auth/verify-account"
        state={{ email: user.email }}
        replace
      />
    );
  }

  // Not logged in → render auth layout with nested routes
  return <AuthLayout />;
};

export default AuthRoute;
