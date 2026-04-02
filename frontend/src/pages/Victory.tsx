import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { teamService } from '@/services/teamService';
import Typewriter from '@/components/Typewriter';

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const Victory = () => {
  const { teamName, score, timerSeconds, leaderboard, refreshLeaderboard, stopTimer, completeGame, currentLevel, completionReason } = useGame();
  const [submitted, setSubmitted] = useState(false);
  const elapsed = 3 * 60 * 60 - timerSeconds;
  
  // Determine completion type based on completion reason
  const isLevel4Timeout = completionReason === 'level4_timeout';
  const isMainTimeout = completionReason === 'timeout';
  const isVictory = completionReason === 'victory' || currentLevel >= 5;
  const timeExpired = isLevel4Timeout || isMainTimeout;

  useEffect(() => {
    // Stop the timer and mark game as completed immediately
    stopTimer();
    completeGame();
    
    const submitCompletion = async () => {
      if (submitted) return;
      
      try {
        console.log('Submitting game completion:', {
          final_score: score,
          time_remaining: timerSeconds
        });
        
        await teamService.completeGame({
          final_score: score,
          time_remaining: timerSeconds
        });
        
        console.log('Game completion submitted successfully');
        setSubmitted(true);
        
        // Refresh leaderboard to show updated rankings
        await refreshLeaderboard();
      } catch (error) {
        console.error('Failed to submit game completion:', error);
      }
    };

    submitCompletion();
  }, [score, timerSeconds, submitted, refreshLeaderboard, stopTimer, completeGame]);

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
          className={`text-3xl font-bold mb-6 ${
            timeExpired 
              ? 'text-destructive text-glow-red' 
              : 'text-secondary text-glow-green'
          }`}
        >
          {isLevel4Timeout ? 'LEVEL 4 TIMEOUT' : 
           isMainTimeout ? 'TIME EXPIRED' : 
           'SYSTEM RESTORED'}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className={`text-xl mb-8 ${
            timeExpired 
              ? 'text-destructive text-glow-red' 
              : 'text-primary text-glow-cyan'
          }`}
        >
          <Typewriter 
            text={isLevel4Timeout ? 'OMEGA SURVIVED' :
                  isMainTimeout ? 'MISSION INCOMPLETE' : 
                  'OMEGA TERMINATED'} 
            speed={80} 
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
          className={`border bg-card p-6 text-left space-y-2 ${
            timeExpired 
              ? 'border-destructive box-glow-red' 
              : 'border-border box-glow-cyan'
          }`}
        >
          <div className="text-xs text-muted-foreground">
            {isLevel4Timeout ? 'LEVEL 4 FAILED:' :
             isMainTimeout ? 'MISSION FAILED:' : 
             'MISSION DEBRIEF:'}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">TEAM: </span>
            <span className="text-primary">{teamName || 'UNKNOWN'}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">SCORE: </span>
            <span className="text-accent">{score} PTS</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">LEVEL REACHED: </span>
            <span className="text-primary">{currentLevel}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">TIME ELAPSED: </span>
            <span className="text-primary">{formatTime(elapsed)}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">TIME REMAINING: </span>
            <span className={timerSeconds <= 0 ? 'text-destructive' : 'text-secondary'}>
              {formatTime(Math.max(0, timerSeconds))}
            </span>
          </div>
          {timeExpired && (
            <div className="text-sm text-destructive pt-2 border-t border-destructive/30">
              {isLevel4Timeout 
                ? "⚠ Level 4's 10-minute countdown expired before completing the final puzzle."
                : "⚠ Your team ran out of time before completing all levels."
              }
            </div>
          )}
        </motion.div>

        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.5 }}
            className="mt-6 border border-border bg-card p-4 text-left box-glow-green"
          >
            <div className="text-xs text-muted-foreground mb-2">FINAL LEADERBOARD:</div>
            <div className="space-y-1 text-xs">
              {leaderboard.slice(0, 5).map((entry) => (
                <div key={entry.rank} className={`flex justify-between ${entry.team === teamName ? 'text-accent font-bold' : 'text-primary'}`}>
                  <span>#{entry.rank} {entry.team}</span>
                  <span>{entry.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5 }}
          className="mt-8 text-xs text-muted-foreground animate-flicker"
        >
          {isLevel4Timeout 
            ? '▸ OMEGA REMAINS ACTIVE ◂'
            : timeExpired 
              ? '▸ MISSION TERMINATED ◂' 
              : '▸ ALL SYSTEMS NOMINAL ◂'
          }
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Victory;
