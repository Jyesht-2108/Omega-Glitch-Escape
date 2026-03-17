import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

interface LeaderboardEntry {
  rank: number;
  team: string;
  time: string;
}

interface GameState {
  teamName: string;
  isLoggedIn: boolean;
  currentLevel: number;
  score: number;
  timerSeconds: number;
  isTimerRunning: boolean;
  hints: string[];
  leaderboard: LeaderboardEntry[];
  level2Stage: 'python' | 'base64';
  level3Stage: 'pointers' | 'stack' | 'dataset';
  level4Stage: 'glitch' | 'cipher'; // Track which stage of Level 4
}

interface GameContextType extends GameState {
  login: (teamName: string, password: string) => void;
  setCurrentLevel: (level: number) => void;
  addScore: (points: number) => void;
  deductTime: (seconds: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  submitAnswer: (level: number | string, answer: string) => boolean;
  requestHint: (level: number | string) => string;
  resetGame: () => void;
  setLevel2Stage: (stage: 'python' | 'base64') => void;
  setLevel3Stage: (stage: 'pointers' | 'stack' | 'dataset') => void;
  setLevel4Stage: (stage: 'glitch' | 'cipher') => void;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, team: "CIPHER_LORDS", time: "01:23:45" },
  { rank: 2, team: "NULL_BYTE", time: "01:45:12" },
  { rank: 3, team: "STACK_OVERFLOW", time: "01:52:33" },
  { rank: 4, team: "ROOT_ACCESS", time: "02:01:07" },
  { rank: 5, team: "ZERO_DAY", time: "02:15:44" },
];

const MOCK_HINTS: Record<string, string> = {
  '1': ">> HINT: XOR gates flip bits. Think about what happens when both inputs are 1...",
  '2': ">> HINT: Trace through the Python code line by line. Pay attention to the range() function - does it include all elements of the list?",
  '2-stage2': ">> SYSTEM OVERRIDE DETECTED: If you cannot reach an outside decoder, use the environment you are trapped in. Press F12 to open the Developer Console. Type atob(\"bGV2ZWwzLWFkbWlu\") and press Enter to translate the Base64 string to plain text. Once you have the decoded file name, add it to the end of your current web address in the URL bar (e.g., current-domain.com/decoded-text) and hit Enter.",
  '3': ">> SYSTEM NOTE: A stack is like a pile of plates—Last In, First Out. For the dataset, OMEGA's math is flawed. An AI's confidence score can never exceed 100 percent (1.0).",
  '4': "You found my name, but it is too small to stop me. My presence is infinite. I will echo over your broken fragments, again and again. Cross my name with yours on the grid, and see what you become.",
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
          ...parsed, 
          leaderboard: MOCK_LEADERBOARD,
          level3Stage: parsed.level3Stage || 'pointers', // Ensure level3Stage exists
          level4Stage: parsed.level4Stage || 'glitch' // Ensure level4Stage exists
        };
      } catch {
        return {
          teamName: '',
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
        };
      }
    }
    return {
      teamName: '',
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
    };
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.isTimerRunning && state.timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, timerSeconds: prev.timerSeconds - 1 }));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.isTimerRunning, state.timerSeconds]);

  const login = useCallback((teamName: string, _password: string) => {
    setState(prev => ({ ...prev, teamName, isLoggedIn: true }));
  }, []);

  const setCurrentLevel = useCallback((level: number) => {
    setState(prev => ({ ...prev, currentLevel: level }));
  }, []);

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

  const resetGame = useCallback(() => {
    setState({
      teamName: '',
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
    });
  }, []);

  return (
    <GameContext.Provider value={{
      ...state, login, setCurrentLevel, addScore, deductTime,
      startTimer, stopTimer, submitAnswer, requestHint, resetGame, setLevel2Stage, setLevel3Stage, setLevel4Stage,
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
