import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, Trophy, AlertTriangle } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const HUD = () => {
  const { timerSeconds, currentLevel, score, leaderboard, requestHint, teamName, level2Stage, level3Stage } = useGame();
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleHintRequest = () => {
    // For Level 2, show different hints based on stage
    let hint;
    if (currentLevel === 2 && level2Stage === 'base64') {
      hint = requestHint('2-stage2');
    } else {
      hint = requestHint(currentLevel);
    }
    setHintText(hint);
    setShowConfirm(false);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 12000);
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
            onClick={() => setShowConfirm(true)}
            className="px-3 py-1 border border-accent text-accent text-xs font-mono animate-pulse-glow hover:bg-accent hover:text-accent-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            REQUEST OVERRIDE HINT
          </motion.button>
        </div>

        {/* Leaderboard ticker */}
        <div className="overflow-hidden border-t border-border/50 py-1">
          <motion.div
            className="flex gap-8 whitespace-nowrap text-xs text-muted-foreground px-4"
            animate={{ x: [0, -600] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {[...leaderboard, ...leaderboard].map((entry, i) => (
              <span key={i}>
                <span className="text-accent">#{entry.rank}</span> {entry.team} <span className="text-primary">{entry.time}</span>
              </span>
            ))}
          </motion.div>
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
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-card border border-accent p-6 max-w-md box-glow-red"
            >
              <h3 className="text-accent text-lg font-bold mb-3 text-glow-amber">⚠ SYSTEM OVERRIDE WARNING</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Requesting a hint will deduct <span className="text-destructive font-bold">5 MINUTES</span> from your remaining time. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={handleHintRequest} className="flex-1 px-4 py-2 bg-accent text-accent-foreground font-mono text-sm hover:opacity-80 transition-opacity">
                  CONFIRM [-05:00]
                </button>
                <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 border border-border text-muted-foreground font-mono text-sm hover:bg-muted transition-colors">
                  ABORT
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
