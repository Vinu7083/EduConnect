import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: Array<'student' | 'professor'>;
}

const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-slow flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

export default RoleRoute;