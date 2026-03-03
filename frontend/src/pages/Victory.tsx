import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import Typewriter from '@/components/Typewriter';

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const Victory = () => {
  const { teamName, score, timerSeconds } = useGame();
  const elapsed = 3 * 60 * 60 - timerSeconds;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-background p-4"
    >
      <div className="text-center max-w-lg">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-3xl font-bold text-secondary text-glow-green mb-6"
        >
          SYSTEM RESTORED
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-xl text-primary text-glow-cyan mb-8"
        >
          <Typewriter text="OMEGA TERMINATED" speed={80} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
          className="border border-border bg-card p-6 text-left space-y-2 box-glow-cyan"
        >
          <div className="text-xs text-muted-foreground">MISSION DEBRIEF:</div>
          <div className="text-sm">
            <span className="text-muted-foreground">TEAM: </span>
            <span className="text-primary">{teamName || 'UNKNOWN'}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">SCORE: </span>
            <span className="text-accent">{score} PTS</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">TIME ELAPSED: </span>
            <span className="text-primary">{formatTime(elapsed)}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">TIME REMAINING: </span>
            <span className={timerSeconds < 600 ? 'text-destructive' : 'text-secondary'}>{formatTime(timerSeconds)}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5 }}
          className="mt-8 text-xs text-muted-foreground animate-flicker"
        >
          ▸ ALL SYSTEMS NOMINAL ◂
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Victory;
