import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';

export const GameCompletedGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { gameCompleted } = useGame();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If game is completed and user tries to access a level, redirect to victory
    if (gameCompleted && location.pathname.startsWith('/level')) {
      console.log('Game completed - redirecting to victory page');
      navigate('/victory', { replace: true });
    }
  }, [gameCompleted, location.pathname, navigate]);

  return <>{children}</>;
};

export default GameCompletedGuard;
