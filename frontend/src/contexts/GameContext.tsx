import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { authService, Team, LoginResponse } from '@/services/authService';
import { teamService } from '@/services/teamService';
import { leaderboardService } from '@/services/leaderboardService';
import { puzzleService, HintInfoResponse } from '@/services/puzzleService';

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
  submitAnswer: (level: string, answer: string) => Promise<{ correct: boolean; message: string }>;
  requestHint: (level: string) => Promise<string>;
  getHintInfo: (level: string) => Promise<HintInfoResponse>;
  resetGame: () => void;
  setLevel2Stage: (stage: 'python' | 'base64') => void;
  setLevel3Stage: (stage: 'pointers' | 'stack' | 'dataset') => void;
  setLevel4Stage: (stage: 'glitch' | 'cipher') => void;
  saveProgress: () => Promise<void>;
  loadProgress: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  completeGame: () => void;
}

const EMPTY_LEADERBOARD: LeaderboardEntry[] = [];

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
          leaderboard: EMPTY_LEADERBOARD,
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
          leaderboard: EMPTY_LEADERBOARD,
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
      leaderboard: EMPTY_LEADERBOARD,
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
      
      // Clear ALL anti-cheat related localStorage when logging in
      // This ensures requalified teams start fresh
      localStorage.removeItem(`antiCheatStrikes_${team.id}`);
      localStorage.removeItem(`antiCheat_strikes_${team.id}`);
      localStorage.removeItem(`antiCheat_warning_${team.id}`);
      localStorage.removeItem(`antiCheat_countdown_${team.id}`);
      localStorage.removeItem(`antiCheat_canDismiss_${team.id}`);
      localStorage.removeItem(`antiCheat_gameOver_${team.id}`);
      
      // Check if game is already completed
      const isCompleted = !!team.completed_at;
      
      setState(prev => ({ 
        ...prev, 
        teamName: team.team_name, 
        teamId: team.id,
        currentLevel: team.current_level,
        score: team.score || 0,
        timerSeconds: team.time_remaining,
        isLoggedIn: true,
        gameCompleted: isCompleted
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
      leaderboard: EMPTY_LEADERBOARD,
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

  const submitAnswer = useCallback(async (level: string, answer: string): Promise<{ correct: boolean; message: string }> => {
    try {
      const response = await puzzleService.submitAnswer(level, answer);
      
      // Update local state with backend response
      setState(prev => ({
        ...prev,
        score: response.score,
        timerSeconds: response.time_remaining,
        currentLevel: response.current_level,
      }));

      // Refresh leaderboard after a correct answer (level advancement)
      if (response.correct) {
        refreshLeaderboard();
      }

      return {
        correct: response.correct,
        message: response.message,
      };
    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      return {
        correct: false,
        message: error.message || '>> ERROR: Failed to validate answer',
      };
    }
  }, [refreshLeaderboard]);

  const requestHint = useCallback(async (level: string): Promise<string> => {
    try {
      const response = await puzzleService.requestHint(level);
      
      // Update local state with new time and score
      setState(prev => ({
        ...prev,
        timerSeconds: response.time_remaining,
        score: response.score,
      }));

      return response.hint;
    } catch (error: any) {
      console.error('Failed to request hint:', error);
      return ">> ERROR: Failed to retrieve hint";
    }
  }, []);

  const getHintInfo = useCallback(async (level: string): Promise<HintInfoResponse> => {
    try {
      return await puzzleService.getHintInfo(level);
    } catch (error: any) {
      console.error('Failed to get hint info:', error);
      throw error;
    }
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
      leaderboard: EMPTY_LEADERBOARD,
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
      return;
    }
    
    console.log('Auto-save interval started');
    const interval = setInterval(async () => {
      // Use a fresh state snapshot by calling setState with a function
      setState(currentState => {
        // Don't modify state, just use it for the save
        if (!currentState.isLoggedIn || !currentState.teamId) return currentState;
        
        let stage = '';
        if (currentState.currentLevel === 2) {
          stage = currentState.level2Stage;
        } else if (currentState.currentLevel === 3) {
          stage = currentState.level3Stage;
        } else if (currentState.currentLevel === 4) {
          stage = currentState.level4Stage;
        }

        teamService.updateProgress({
          current_level: currentState.currentLevel,
          score: currentState.score,
          time_remaining: currentState.timerSeconds,
          stage: stage || undefined
        }).catch(error => {
          console.error('Auto-save failed:', error);
        });
        
        return currentState; // Return unchanged state
      });
    }, 30000);
    
    return () => {
      console.log('Auto-save interval cleared');
      clearInterval(interval);
    };
  }, [state.isLoggedIn, state.teamId, state.gameCompleted]);

  // Fetch leaderboard immediately on login and refresh every 30 seconds
  useEffect(() => {
    if (!state.isLoggedIn) return;
    
    // Fetch immediately
    refreshLeaderboard();
    
    const interval = setInterval(() => {
      refreshLeaderboard();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [state.isLoggedIn, refreshLeaderboard]);

  // Check team status every 10 seconds (for disqualification, reset, etc.)
  useEffect(() => {
    if (!state.isLoggedIn || !state.teamId) return;
    
    const checkStatus = async () => {
      try {
        const team = await teamService.getCurrentTeam();
        
        // If team was disqualified, force logout
        if (team.is_disqualified) {
          console.log('Team has been disqualified');
          logout();
          alert(`Your team has been disqualified: ${team.disqualified_reason || 'Anti-cheat violation'}`);
          return;
        }
        
        // If team was reset (level 1, score 0, time 10800), force logout to re-login
        if (team.current_level === 1 && team.score === 0 && team.time_remaining === 10800 && state.currentLevel > 1) {
          console.log('Team has been reset by admin');
          logout();
          alert('Your team has been reset by an administrator. Please login again to restart.');
          return;
        }
        
        // Only update level if it's higher (admin advanced) or lower (admin reset)
        const shouldUpdateLevel = team.current_level > state.currentLevel || 
                                  (team.current_level < state.currentLevel && team.score === 0);
        
        // Only update timer if there's a significant difference (>60 seconds)
        // This indicates admin adjustment, not just sync drift
        const timeDiff = Math.abs(team.time_remaining - state.timerSeconds);
        const shouldUpdateTime = timeDiff > 60;
        
        // Update score from server (in case admin adjusted)
        setState(prev => ({
          ...prev,
          score: team.score,
          timerSeconds: shouldUpdateTime ? team.time_remaining : prev.timerSeconds,
          currentLevel: shouldUpdateLevel ? team.current_level : prev.currentLevel,
        }));
      } catch (error) {
        console.error('Failed to check team status:', error);
      }
    };
    
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [state.isLoggedIn, state.teamId, state.currentLevel, logout]);

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
      getHintInfo,
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
