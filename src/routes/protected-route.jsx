import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { data: user, isLoading } = useCurrentUser();

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

  // Logged in and verified → show protected page
  return children;
};

export default ProtectedRoute;
