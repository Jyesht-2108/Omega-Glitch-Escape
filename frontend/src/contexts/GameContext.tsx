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
}

interface GameContextType extends GameState {
  login: (teamName: string, password: string) => void;
  setCurrentLevel: (level: number) => void;
  addScore: (points: number) => void;
  deductTime: (seconds: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  submitAnswer: (level: number, answer: string) => boolean;
  requestHint: (level: number) => string;
  resetGame: () => void;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, team: "CIPHER_LORDS", time: "01:23:45" },
  { rank: 2, team: "NULL_BYTE", time: "01:45:12" },
  { rank: 3, team: "STACK_OVERFLOW", time: "01:52:33" },
  { rank: 4, team: "ROOT_ACCESS", time: "02:01:07" },
  { rank: 5, team: "ZERO_DAY", time: "02:15:44" },
];

const MOCK_HINTS: Record<number, string> = {
  1: ">> HINT: XOR gates flip bits. Think about what happens when both inputs are 1...",
  2: ">> HINT: The variable 'result' is being overwritten. Check the loop logic...",
  3: ">> HINT: Sort by confidence_score descending. The anomaly breaks the rules of probability...",
  4: ">> HINT: VIGENÈRE KEY = 'OMEGA'. Apply the cipher backwards to decode the kill switch...",
};

const MOCK_ANSWERS: Record<number, string> = {
  1: "1010",
  2: "CORRUPTED",
  3: "1.47",
  4: "SHUTDOWN",
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>({
    teamName: '',
    isLoggedIn: false,
    currentLevel: 1,
    score: 0,
    timerSeconds: 3 * 60 * 60,
    isTimerRunning: false,
    hints: [],
    leaderboard: MOCK_LEADERBOARD,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const submitAnswer = useCallback((level: number, answer: string): boolean => {
    return answer.toUpperCase().trim() === MOCK_ANSWERS[level];
  }, []);

  const requestHint = useCallback((level: number): string => {
    setState(prev => ({ ...prev, timerSeconds: Math.max(0, prev.timerSeconds - 300) }));
    return MOCK_HINTS[level] || ">> NO HINT AVAILABLE";
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
    });
  }, []);

  return (
    <GameContext.Provider value={{
      ...state, login, setCurrentLevel, addScore, deductTime,
      startTimer, stopTimer, submitAnswer, requestHint, resetGame,
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
