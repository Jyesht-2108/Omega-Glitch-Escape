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
    // Special case: level3-admin is part of level 2 (final puzzle after python)
    // Allow access when on level 2, and briefly when transitioning to level 3
    const isLevel3Admin = location.pathname === '/level3-admin';
    
    // Special case: level3-complete is part of level 3
    const isLevel3Complete = location.pathname === '/level3-complete';
    
    if (isLevel3Admin) {
      // Allow if on level 2 or 3 (level 3 is allowed briefly during transition)
      // But if on level 1 or 4+, redirect
      if (currentLevel < 2 || currentLevel > 3) {
        console.log(`Access denied to ${location.pathname}. Current level: ${currentLevel}, Required: 2 or 3`);
        navigate(`/level/${currentLevel}`, { replace: true });
      }
      // Note: When on level 3, the page itself will handle navigation to /level/3
    } else if (isLevel3Complete) {
      // Allow if on level 3 or 4 (level 4 is allowed during transition after auto-submit)
      if (currentLevel < 3 || currentLevel > 4) {
        console.log(`Access denied to ${location.pathname}. Current level: ${currentLevel}, Required: 3 or 4`);
        navigate(`/level/${currentLevel}`, { replace: true });
      }
    } else if (requiredLevel !== currentLevel) {
      // Only allow access to the EXACT current level
      // Prevent both going forward AND going backward to farm points
      console.log(`Access denied to level ${requiredLevel}. Current level: ${currentLevel}`);
      navigate(`/level/${currentLevel}`, { replace: true });
    }
  }, [requiredLevel, currentLevel, navigate, location.pathname]);

  return <>{children}</>;
};

export default LevelGuard;
