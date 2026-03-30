import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useAuth';

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const {
    data: user,
    isLoading,
  } = useCurrentUser({
    retry: false,
  });

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // If not authenticated or session expired, redirect to login
        navigate('/auth/login', { replace: true });
      } else if (!user.isVerified) {
        // If not verified, redirect to verification page
        navigate('/auth/verify-account', { state: { email: user.email }, replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !user.isVerified) {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;
