import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { authService, Team, LoginResponse } from '@/services/authService';
import { teamService } from '@/services/teamService';
import { leaderboardService } from '@/services/leaderboardService';

interface LeaderboardEntry {
  rank: number;
  team: string;
  time: string;
}

interface GameState {
  teamName: string;
  teamId: string;
  isLoggedIn: boolean;
  currentLevel: number;
  score: number;
  timerSeconds: number;
  isTimerRunning: boolean;
  hints: string[];
  leaderboard: LeaderboardEntry[];
  level2Stage: 'python' | 'base64';
  level3Stage: 'pointers' | 'stack' | 'dataset';
  level4Stage: 'glitch' | 'cipher';
  gameCompleted: boolean;
}

interface GameContextType extends GameState {
  login: (teamName: string, password: string, loginData?: LoginResponse) => Promise<void>;
  logout: () => void;
  setCurrentLevel: (level: number) => Promise<void>;
  addScore: (points: number) => void;
  deductTime: (seconds: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  submitAnswer: (level: number | string, answer: string) => boolean;
  requestHint: (level: number | string) => string;
  resetGame: () => void;
  setLevel2Stage: (stage: 'python' | 'base64') => void;
  setLevel3Stage: (stage: 'pointers' | 'stack' | 'dataset') => void;
  setLevel4Stage: (stage: 'glitch' | 'cipher') => void;
  saveProgress: () => Promise<void>;
  loadProgress: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  completeGame: () => void;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, team: "CIPHER_LORDS", time: "01:23:45" },
  { rank: 2, team: "NULL_BYTE", time: "01:45:12" },
  { rank: 3, team: "STACK_OVERFLOW", time: "01:52:33" },
  { rank: 4, team: "ROOT_ACCESS", time: "02:01:07" },
  { rank: 5, team: "ZERO_DAY", time: "02:15:44" },
];

const MOCK_HINTS: Record<string, string> = {
  // Level 1 hints
  '1': ">> SYSTEM NOTE: The language of machines is base-2, but human ports are base-10. For the physical lock, remember your logic tables: XOR only outputs TRUE when its inputs are different.",

  // Level 2 hints
  '2': ">> HINT: Trace through the Python code line by line. Pay attention to the range() function - does it include all elements of the list?",
  '2-stage2': ">> SYSTEM OVERRIDE DETECTED: If you cannot reach an outside decoder, use the environment you are trapped in. Press F12 to open the Developer Console. Type atob(\"bGV2ZWwzLWFkbWlu\") and press Enter to translate the Base64 string to plain text. Once you have the decoded file name, add it to the end of your current web address in the URL bar (e.g., current-domain.com/decoded-text) and hit Enter.",

  // Level 3 hints
  '3-pointers': ">> HINT: Trace through the pointer arithmetic step by step. Remember: ptr++ moves to the next element, ptr-3 moves back 3 positions. What value does *ptr point to at the end?",
  '3-stack': ">> SYSTEM NOTE: A stack is like a pile of plates—Last In, First Out. PUSH adds to the top, POP removes from the top. Trace through all 15 operations carefully.",
  '3-dataset': ">> HINT: OMEGA's math is flawed. An AI's confidence score can never exceed 100 percent (1.0). Search for any value greater than 1.0 in the confidence column.",

  // Level 4 hints
  '4-glitch': ">> HINT: The glitched image contains hidden information. Click to examine it closely, or check the image metadata. The keyword is embedded within.",
  '4-cipher': "You found my name, but it is too small to stop me. My presence is infinite. I will echo over your broken fragments, again and again. Cross my name with yours on the grid, and see what you become.",
};

const MOCK_ANSWERS: Record<string, string> = {
  '1': "SYS",
  '2': "BYPAS",
  '3-pointers': "42",
  '3-stack': "3-17-42",
  '3-dataset': "1.47",
  '4-glitch': "OMEGA",
  '4-cipher': "GKWZEATERT",
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(() => {
    // Load state from localStorage on initialization
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return {
          teamName: parsed.teamName || '',
          teamId: parsed.teamId || '',
          isLoggedIn: parsed.isLoggedIn || false,
          currentLevel: parsed.currentLevel || 1,
          score: parsed.score || 0,
          timerSeconds: parsed.timerSeconds || 3 * 60 * 60,
          isTimerRunning: false, // Always start with timer stopped
          hints: parsed.hints || [],
          leaderboard: MOCK_LEADERBOARD,
          level2Stage: parsed.level2Stage || 'python',
          level3Stage: parsed.level3Stage || 'pointers',
          level4Stage: parsed.level4Stage || 'glitch',
          gameCompleted: parsed.gameCompleted || false
        };
      } catch {
        return {
          teamName: '',
          teamId: '',
          isLoggedIn: false,
          currentLevel: 1,
          score: 0,
          timerSeconds: 3 * 60 * 60,
          isTimerRunning: false,
          hints: [],
          leaderboard: MOCK_LEADERBOARD,
          level2Stage: 'python',
          level3Stage: 'pointers',
          level4Stage: 'glitch',
          gameCompleted: false
        };
      }
    }
    return {
      teamName: '',
      teamId: '',
      isLoggedIn: false,
      currentLevel: 1,
      score: 0,
      timerSeconds: 3 * 60 * 60,
      isTimerRunning: false,
      hints: [],
      leaderboard: MOCK_LEADERBOARD,
      level2Stage: 'python',
      level3Stage: 'pointers',
      level4Stage: 'glitch',
      gameCompleted: false
    };
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(state));
  }, [state]);

  // Validate authentication on mount
  useEffect(() => {
    const hasToken = authService.isAuthenticated();
    if (state.isLoggedIn && !hasToken) {
      // Token missing but state says logged in - clear state
      setState(prev => ({
        ...prev,
        isLoggedIn: false,
        teamName: '',
        teamId: ''
      }));
    }
  }, []);

  useEffect(() => {
    if (state.isTimerRunning && state.timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, timerSeconds: prev.timerSeconds - 1 }));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.isTimerRunning, state.timerSeconds]);

  // Helper function to format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const refreshLeaderboard = useCallback(async () => {
    try {
      const leaderboardData = await leaderboardService.getLeaderboard();
      const formattedLeaderboard: LeaderboardEntry[] = leaderboardData.map((entry) => ({
        rank: entry.rank,
        team: entry.team_name,
        time: entry.time_elapsed
      }));
      
      setState(prev => ({ ...prev, leaderboard: formattedLeaderboard }));
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  }, []);

  const login = useCallback(async (teamName: string, password: string, loginData?: LoginResponse) => {
    try {
      let data = loginData;
      if (!data) {
        data = await authService.login(teamName, password);
      }
      
      console.log('Login data received:', data);
      const team = data.team;
      console.log('Team data:', team);
      
      // Check if team is disqualified
      if (team.is_disqualified) {
        throw new Error(`Team disqualified: ${team.disqualified_reason || 'Anti-cheat violation'}`);
      }
      
      setState(prev => ({ 
        ...prev, 
        teamName: team.team_name, 
        teamId: team.id,
        currentLevel: team.current_level,
        timerSeconds: team.time_remaining,
        isLoggedIn: true 
      }));

      // Load leaderboard
      await refreshLeaderboard();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [refreshLeaderboard]);

  const logout = useCallback(() => {
    authService.logout();
    setState({
      teamName: '',
      teamId: '',
      isLoggedIn: false,
      currentLevel: 1,
      score: 0,
      timerSeconds: 3 * 60 * 60,
      isTimerRunning: false,
      hints: [],
      leaderboard: MOCK_LEADERBOARD,
      level2Stage: 'python',
      level3Stage: 'pointers',
      level4Stage: 'glitch',
      gameCompleted: false
    });
    localStorage.removeItem('gameState');
  }, []);

  const setCurrentLevel = useCallback(async (level: number) => {
    setState(prev => ({ ...prev, currentLevel: level }));
    // Save progress immediately when level changes
    if (state.isLoggedIn && state.teamId) {
      try {
        await teamService.updateProgress({
          current_level: level,
          score: state.score,
          time_remaining: state.timerSeconds,
          stage: undefined
        });
      } catch (error) {
        console.error('Failed to save level change:', error);
      }
    }
  }, [state.isLoggedIn, state.teamId, state.score, state.timerSeconds]);

  const addScore = useCallback((points: number) => {
    setState(prev => ({ ...prev, score: prev.score + points }));
  }, []);

  const deductTime = useCallback((seconds: number) => {
    setState(prev => ({ ...prev, timerSeconds: Math.max(0, prev.timerSeconds - seconds) }));
  }, []);

  const startTimer = useCallback(() => {
    setState(prev => ({ ...prev, isTimerRunning: true }));
  }, []);

  const stopTimer = useCallback(() => {
    setState(prev => ({ ...prev, isTimerRunning: false }));
  }, []);

  const pauseTimer = useCallback(() => {
    setState(prev => ({ ...prev, isTimerRunning: false }));
  }, []);

  const resumeTimer = useCallback(() => {
    setState(prev => ({ ...prev, isTimerRunning: true }));
  }, []);

  const submitAnswer = useCallback((level: number | string, answer: string): boolean => {
    const key = typeof level === 'number' ? String(level) : level;
    return answer.toUpperCase().trim() === MOCK_ANSWERS[key]?.toUpperCase();
  }, []);

  const requestHint = useCallback((level: number | string): string => {
    setState(prev => ({ ...prev, timerSeconds: Math.max(0, prev.timerSeconds - 300) }));
    const key = typeof level === 'number' ? String(level) : level;
    return MOCK_HINTS[key] || ">> NO HINT AVAILABLE";
  }, []);

  const setLevel2Stage = useCallback((stage: 'python' | 'base64') => {
    setState(prev => ({ ...prev, level2Stage: stage }));
  }, []);

  const setLevel3Stage = useCallback((stage: 'pointers' | 'stack' | 'dataset') => {
    setState(prev => ({ ...prev, level3Stage: stage }));
  }, []);

  const setLevel4Stage = useCallback((stage: 'glitch' | 'cipher') => {
    setState(prev => ({ ...prev, level4Stage: stage }));
  }, []);

  const saveProgress = useCallback(async () => {
    if (!state.isLoggedIn || !state.teamId) {
      console.log('Save progress skipped - not logged in or no team ID');
      return;
    }
    
    try {
      // Construct stage string based on current level
      let stage = '';
      if (state.currentLevel === 2) {
        stage = state.level2Stage;
      } else if (state.currentLevel === 3) {
        stage = state.level3Stage;
      } else if (state.currentLevel === 4) {
        stage = state.level4Stage;
      }

      console.log('Saving progress:', {
        current_level: state.currentLevel,
        score: state.score,
        time_remaining: state.timerSeconds,
        stage: stage || undefined
      });

      await teamService.updateProgress({
        current_level: state.currentLevel,
        score: state.score,
        time_remaining: state.timerSeconds,
        stage: stage || undefined
      });
      
      console.log('Progress saved successfully');
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [state.isLoggedIn, state.teamId, state.currentLevel, state.score, state.timerSeconds, state.level2Stage, state.level3Stage, state.level4Stage]);

  const loadProgress = useCallback(async () => {
    if (!state.isLoggedIn || !state.teamId) return;
    
    try {
      const team = await teamService.getTeam();
      if (team) {
        setState(prev => ({
          ...prev,
          currentLevel: team.current_level,
          timerSeconds: team.time_remaining,
          score: team.score
        }));
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }, [state.isLoggedIn, state.teamId]);

  const resetGame = useCallback(() => {
    setState({
      teamName: '',
      teamId: '',
      isLoggedIn: false,
      currentLevel: 1,
      score: 0,
      timerSeconds: 3 * 60 * 60,
      isTimerRunning: false,
      hints: [],
      leaderboard: MOCK_LEADERBOARD,
      level2Stage: 'python',
      level3Stage: 'pointers',
      level4Stage: 'glitch',
      gameCompleted: false
    });
  }, []);

  const completeGame = useCallback(() => {
    console.log('Game marked as completed');
    setState(prev => ({ 
      ...prev, 
      gameCompleted: true,
      isTimerRunning: false // Stop timer
    }));
  }, []);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!state.isLoggedIn || !state.teamId || state.gameCompleted) {
      console.log('Auto-save disabled:', { 
        isLoggedIn: state.isLoggedIn, 
        hasTeamId: !!state.teamId, 
        gameCompleted: state.gameCompleted 
      });
      return;
    }
    
    console.log('Auto-save interval started');
    const interval = setInterval(async () => {
      console.log('Auto-save triggered at', new Date().toLocaleTimeString());
      // Use saveProgress function which has latest state
      await saveProgress();
    }, 30000);
    
    return () => {
      console.log('Auto-save interval cleared');
      clearInterval(interval);
    };
  }, [state.isLoggedIn, state.teamId, state.gameCompleted, saveProgress]);

  // Refresh leaderboard every 60 seconds
  useEffect(() => {
    if (!state.isLoggedIn) return;
    
    const interval = setInterval(() => {
      refreshLeaderboard();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [state.isLoggedIn, refreshLeaderboard]);

  return (
    <GameContext.Provider value={{
      ...state, 
      login, 
      logout,
      setCurrentLevel, 
      addScore, 
      deductTime,
      startTimer, 
      stopTimer,
      pauseTimer,
      resumeTimer,
      submitAnswer, 
      requestHint, 
      resetGame, 
      setLevel2Stage, 
      setLevel3Stage, 
      setLevel4Stage,
      saveProgress,
      loadProgress,
      refreshLeaderboard,
      completeGame
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
