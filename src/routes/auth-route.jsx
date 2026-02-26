import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useAuth';

const AuthRoute = () => {
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useCurrentUser({
    retry: false,
  });

  useEffect(() => {
    // ONLY redirect if we successfully fetched a user who is already authorized
    if (!isLoading && !isError) {
      if (user?.isVerified) {
        navigate('/dashboard', { replace: true });
      } else if (user && !user.isVerified) {
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

  if (user) {
    return null;
  }

  return <Outlet />;
};

export default AuthRoute;
