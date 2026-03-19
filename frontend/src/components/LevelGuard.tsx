import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';

interface LevelGuardProps {
  requiredLevel: number;
  children: React.ReactNode;
}

export const LevelGuard: React.FC<LevelGuardProps> = ({ requiredLevel, children }) => {
  const { currentLevel } = useGame();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Allow access to current level or lower
    // Special case: level3-admin and level3-complete are part of level 3
    const isLevel3Special = location.pathname === '/level3-admin' || location.pathname === '/level3-complete';
    
    if (isLevel3Special) {
      // Allow if on level 3 or higher
      if (currentLevel < 3) {
        console.log(`Access denied to ${location.pathname}. Current level: ${currentLevel}, Required: 3`);
        navigate(`/level/${currentLevel}`, { replace: true });
      }
    } else if (requiredLevel > currentLevel) {
      // Trying to access a level ahead of progress
      console.log(`Access denied to level ${requiredLevel}. Current level: ${currentLevel}`);
      navigate(`/level/${currentLevel}`, { replace: true });
    }
  }, [requiredLevel, currentLevel, navigate, location.pathname]);

  return <>{children}</>;
};

export default LevelGuard;
