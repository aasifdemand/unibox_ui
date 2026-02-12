import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const AuthRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return null; // or loader
  }

  // If logged in → block auth pages
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthRoute;
