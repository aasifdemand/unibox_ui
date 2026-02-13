import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useAuth";

const AuthRoute = ({ children }) => {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    // You can return a proper loading spinner here
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If logged in → block auth pages
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthRoute;
