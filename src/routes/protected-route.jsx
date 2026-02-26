import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useAuth';


const ProtectedRoute = () => {
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useCurrentUser({
    retry: false,
  });

  useEffect(() => {
    // ONLY redirect if we definitely know there's no user (success but null)
    // Avoid redirecting on ERROR states (like CORS block) to prevent infinite loops
    if (!isLoading && !isError) {
      if (!user) {
        navigate('/auth/login', { replace: true });
      } else if (!user.isVerified) {
        navigate('/auth/verify-account', { state: { email: user.email }, replace: true });
      }
    }
  }, [user, isLoading, isError, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !user.isVerified) {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;
