import { Navigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { authService } from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn } = useGame();
  const hasToken = authService.isAuthenticated();

  if (!isLoggedIn && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
