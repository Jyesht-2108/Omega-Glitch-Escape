import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, Trophy, AlertTriangle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const HUD = () => {
  const { timerSeconds, currentLevel, score, leaderboard, requestHint, getHintInfo, teamName, level2Stage, level3Stage, level4Stage, logout } = useGame();
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [hintInfo, setHintInfo] = useState<{ timeCost: number; ptsCost: number; level: number; maxReached: boolean; purchased: string[] } | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getCurrentLevelString = () => {
    if (currentLevel === 2 && level2Stage === 'base64') return '2-base64';
    if (currentLevel === 3) return level3Stage === 'pointers' ? '3-pointers' : level3Stage === 'stack' ? '3-stack' : '3-dataset';
    if (currentLevel === 4) return level4Stage === 'glitch' ? '4-glitch' : '4';
    return String(currentLevel);
  };

  const handleRequestHintClick = async () => {
    if (isLoadingHint) return;
    setIsLoadingHint(true);
    try {
      const levelId = getCurrentLevelString();
      const info = await getHintInfo(levelId);
      
      setHintInfo({
        timeCost: info.next_hint_time_cost,
        ptsCost: info.next_hint_pts_cost,
        level: info.hints_used + 1,
        maxReached: info.max_hints_reached,
        purchased: info.purchased_hints || []
      });
      setShowConfirm(true);
    } catch (err) {
      console.error('Failed to get hint info', err);
      // Fallback
      setHintInfo({ timeCost: 300, ptsCost: 0, level: 1, maxReached: false, purchased: [] });
      setShowConfirm(true);
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleHintRequest = async () => {
    const levelId = getCurrentLevelString();
    
    try {
      const hint = await requestHint(levelId);
      setHintText(hint);
      setShowConfirm(false);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 15000); // Show for 15 seconds
    } catch (error) {
      console.error('Failed to get hint:', error);
      setHintText('>> ERROR: Failed to retrieve hint');
      setShowConfirm(false);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 5000);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className={`font-mono text-lg font-bold ${timerSeconds < 600 ? 'text-destructive text-glow-red' : 'text-primary text-glow-cyan'}`}>
              {formatTime(timerSeconds)}
            </span>
          </div>

          {/* Level */}
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-secondary text-glow-green">LEVEL {currentLevel}</span>
            <span className="text-muted-foreground mx-2">|</span>
            <span className="text-muted-foreground">{teamName}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" />
            <span className="text-accent text-glow-amber font-bold">{score} PTS</span>
          </div>

          {/* Hint Button */}
          <motion.button
            onClick={handleRequestHintClick}
            disabled={isLoadingHint}
            className={`px-3 py-1 border border-accent text-accent text-xs font-mono animate-pulse-glow hover:bg-accent hover:text-accent-foreground transition-colors ${isLoadingHint ? 'opacity-50 cursor-not-allowed animate-none' : ''}`}
            whileHover={{ scale: isLoadingHint ? 1 : 1.05 }}
            whileTap={{ scale: isLoadingHint ? 1 : 0.95 }}
          >
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            {isLoadingHint ? "ANALYZING..." : "REQUEST OVERRIDE HINT"}
          </motion.button>

          {/* Logout Button */}
          <motion.button
            onClick={() => setShowLogoutConfirm(true)}
            className="px-3 py-1 border border-destructive text-destructive text-xs font-mono hover:bg-destructive hover:text-destructive-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Logout"
          >
            <LogOut className="w-3 h-3 inline mr-1" />
            LOGOUT
          </motion.button>
        </div>

        {/* Leaderboard ticker */}
        <div className="overflow-hidden border-t border-border/50 py-1">
          {leaderboard.length > 0 ? (
            <motion.div
              key={leaderboard.map(e => `${e.team}-${e.time}`).join(',')}
              className="flex gap-8 whitespace-nowrap text-xs text-muted-foreground px-4"
              animate={{ x: [0, -800] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            >
              {[...leaderboard, ...leaderboard, ...leaderboard].map((entry, i) => (
                <span key={i}>
                  <span className="text-accent">#{entry.rank}</span> {entry.team} <span className="text-primary">{entry.time}</span>
                </span>
              ))}
            </motion.div>
          ) : (
            <div className="text-xs text-muted-foreground/50 px-4 text-center font-mono">
              Loading leaderboard...
            </div>
          )}
        </div>
      </div>

      {/* Hint confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-card border border-accent p-6 max-w-md box-glow-red"
              onClick={(e) => e.stopPropagation()}
            >
              {hintInfo?.maxReached ? (
                <>
                  <h3 className="text-accent text-lg font-bold mb-3 text-glow-amber">⚠ MAXIMUM OVERRIDE REACHED</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    You have already decrypted maximum hints for this sector. No more clues are available.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 border border-border text-muted-foreground font-mono text-sm hover:bg-muted transition-colors">
                      CLOSE
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-accent text-lg font-bold mb-3 text-glow-amber">⚠ SYSTEM OVERRIDE WARNING</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Requesting <span className="text-accent font-bold">LEVEL {hintInfo?.level} OVERRIDE HINT</span> will deduct <span className="text-destructive font-bold">{hintInfo ? Math.floor(hintInfo.timeCost / 60) : 0} MINUTES</span> and <span className="text-destructive font-bold">{hintInfo?.ptsCost} POINTS</span> from your team score. This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={handleHintRequest} className="flex-1 px-4 py-2 bg-accent text-accent-foreground font-mono text-sm hover:opacity-80 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis">
                      CONFIRM [-{hintInfo ? String(Math.floor(hintInfo.timeCost / 60)).padStart(2, '0') : '00'}:00 / -{hintInfo?.ptsCost} PTS]
                    </button>
                    <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 border border-border text-muted-foreground font-mono text-sm hover:bg-muted transition-colors">
                      ABORT
                    </button>
                  </div>
                </>
              )}

              {/* Purchased Hints Dispaly */}
              {hintInfo?.purchased && hintInfo.purchased.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="text-xs text-muted-foreground mb-2">PREVIOUSLY DECRYPTED CLUES:</div>
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {hintInfo.purchased.map((hint, i) => (
                      <div key={i} className="text-accent text-xs border border-accent/30 bg-accent/10 p-2 font-mono break-words rounded">
                        <span className="opacity-50 font-bold mr-2">[{i + 1}]</span>
                        {hint}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout confirm modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-card border border-destructive p-6 max-w-md box-glow-red"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-destructive text-lg font-bold mb-3 text-glow-red">⚠ LOGOUT CONFIRMATION</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Are you sure you want to logout? Your progress has been auto-saved, but the timer will stop.
              </p>
              <div className="flex gap-3">
                <button onClick={handleLogout} className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground font-mono text-sm hover:opacity-80 transition-opacity">
                  CONFIRM LOGOUT
                </button>
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-2 border border-border text-muted-foreground font-mono text-sm hover:bg-muted transition-colors">
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint display */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-[60] bg-card border border-accent p-4 text-accent font-mono text-sm box-glow-cyan max-w-xl mx-auto"
          >
            {hintText}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HUD;
