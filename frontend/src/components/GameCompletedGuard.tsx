import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';

export const GameCompletedGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { gameCompleted } = useGame();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log(`GameCompletedGuard: gameCompleted=${gameCompleted}, pathname=${location.pathname}`);
    
    // If game is completed, redirect to victory from any level page
    if (gameCompleted && location.pathname.startsWith('/level')) {
      console.log('🎯 Game completed - redirecting to victory page');
      navigate('/victory', { replace: true });
    }
  }, [gameCompleted, location.pathname, navigate]);

  return <>{children}</>;
};

export default GameCompletedGuard;
