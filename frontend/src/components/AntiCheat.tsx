import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Skull } from 'lucide-react';
import { playAlarmSiren, playExplosion, playCountdownBeep } from '@/lib/synthAudio';
import { useGame } from '@/contexts/GameContext';
import { teamService } from '@/services/teamService';

const ANTI_CHEAT_ENABLED = import.meta.env.VITE_ANTI_CHEAT_ENABLED === 'true';
const MAX_STRIKES = parseInt(import.meta.env.VITE_ANTI_CHEAT_MAX_STRIKES || '3');

const AntiCheat = () => {
  const { isLoggedIn, currentLevel, teamId, stopTimer, logout, gameCompleted } = useGame();
  
  // Track last visibility change time to detect quick hide/show (navigation)
  const lastVisibilityChangeRef = useRef(0);
  
  // Load strikes from localStorage
  const [show, setShow] = useState(() => {
    if (!ANTI_CHEAT_ENABLED) return false;
    const saved = localStorage.getItem(`antiCheat_warning_${teamId}`);
    return saved === 'true';
  });
  const [strikes, setStrikes] = useState(() => {
    if (!ANTI_CHEAT_ENABLED) return 0;
    const saved = localStorage.getItem(`antiCheat_strikes_${teamId}`);
    return saved ? parseInt(saved) : 0;
  });
  const [countdown, setCountdown] = useState(() => {
    if (!ANTI_CHEAT_ENABLED) return 60;
    const saved = localStorage.getItem(`antiCheat_countdown_${teamId}`);
    return saved ? parseInt(saved) : 60;
  });
  const [canDismiss, setCanDismiss] = useState(() => {
    if (!ANTI_CHEAT_ENABLED) return false;
    const saved = localStorage.getItem(`antiCheat_canDismiss_${teamId}`);
    return saved === 'true';
  });
  const [gameOver, setGameOver] = useState(() => {
    if (!ANTI_CHEAT_ENABLED) return false;
    const saved = localStorage.getItem(`antiCheat_gameOver_${teamId}`);
    return saved === 'true';
  });
  const [explosionCountdown, setExplosionCountdown] = useState(10);
  const [exploded, setExploded] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopAlarmRef = useRef<(() => void) | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save strikes to localStorage whenever they change
  useEffect(() => {
    if (teamId && ANTI_CHEAT_ENABLED) {
      localStorage.setItem(`antiCheat_strikes_${teamId}`, strikes.toString());
    }
  }, [strikes, teamId]);

  // Save warning state to localStorage
  useEffect(() => {
    if (teamId && ANTI_CHEAT_ENABLED) {
      localStorage.setItem(`antiCheat_warning_${teamId}`, show.toString());
    }
  }, [show, teamId]);

  // Save countdown to localStorage
  useEffect(() => {
    if (teamId && ANTI_CHEAT_ENABLED) {
      localStorage.setItem(`antiCheat_countdown_${teamId}`, countdown.toString());
    }
  }, [countdown, teamId]);

  // Save canDismiss to localStorage
  useEffect(() => {
    if (teamId && ANTI_CHEAT_ENABLED) {
      localStorage.setItem(`antiCheat_canDismiss_${teamId}`, canDismiss.toString());
    }
  }, [canDismiss, teamId]);

  // Save gameOver to localStorage
  useEffect(() => {
    if (teamId && ANTI_CHEAT_ENABLED) {
      localStorage.setItem(`antiCheat_gameOver_${teamId}`, gameOver.toString());
    }
  }, [gameOver, teamId]);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/sounds/fahh.mp3');
    audioRef.current.volume = 0.7;
    audioRef.current.preload = 'auto'; // Preload when user is logged in and playing
    
    // If user is already logged in and playing, prepare audio immediately
    if (isLoggedIn && currentLevel >= 1) {
      audioRef.current.load();
      setAudioReady(true);
    }
  }, [isLoggedIn, currentLevel]);

  useEffect(() => {
    // Unlock audio context on first user interaction when logged in
    if (!isLoggedIn || currentLevel < 1) return;

    const unlockAudio = () => {
      if (audioRef.current && !audioReady) {
        // Play a silent sound to unlock audio context
        const originalVolume = audioRef.current.volume;
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          if (audioRef.current) {
            audioRef.current.volume = originalVolume;
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setAudioReady(true);
            console.log('Audio context unlocked');
          }
        }).catch(() => {
          // If silent play fails, just mark as ready and hope for the best
          setAudioReady(true);
        });
      }
    };

    const events = ['click', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, unlockAudio);
      });
    };
  }, [isLoggedIn, currentLevel, audioReady]);

  const playAlert = useCallback(() => {
    if (audioRef.current) {
      // Always try to play, even if not marked as ready
      audioRef.current.currentTime = 0;
      
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.catch(() => {
          // If it fails, try loading and playing again
          console.log('Audio play failed, attempting reload');
          audioRef.current?.load();
          setTimeout(() => {
            audioRef.current?.play().catch(() => {
              console.log('Audio fallback also failed');
            });
          }, 100);
        });
      }
    }
  }, []);

  const triggerWarning = useCallback(() => {
    if (!ANTI_CHEAT_ENABLED) return; // Skip if anti-cheat is disabled
    if (gameOver || exploded) return;

    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    
    console.log(`Anti-cheat violation detected. Strike ${newStrikes}/${MAX_STRIKES}`);
    
    // Play sound IMMEDIATELY when warning is triggered
    playAlert();

    // Timer continues running as penalty - no pause needed

    if (newStrikes >= MAX_STRIKES) {
      // Game over - OMEGA caught you
      console.log('Maximum strikes reached - disqualifying team');
      setShow(false);
      setGameOver(true);
      
      // Stop the timer immediately
      stopTimer();
      
      // Disqualify team in backend
      teamService.disqualifyTeam('Anti-cheat violation: Maximum strikes reached')
        .then(() => {
          console.log('Team disqualified in backend');
          // Logout after 5 seconds to show the game over screen
          setTimeout(() => {
            logout();
          }, 5000);
        })
        .catch((error) => {
          console.error('Failed to disqualify team:', error);
          // Still logout even if backend call fails
          setTimeout(() => {
            logout();
          }, 5000);
        });
      
      // Start synthesized alarm siren
      stopAlarmRef.current = playAlarmSiren();
    } else {
      setShow(true);
      setCountdown(60);
      setCanDismiss(false);

      // Clear any existing countdown
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      // Start countdown with more robust logic
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            setCanDismiss(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [strikes, gameOver, exploded, playAlert]);

  // Explosion countdown
  useEffect(() => {
    if (!gameOver || exploded) return;
    setExplosionCountdown(10);
    const interval = setInterval(() => {
      setExplosionCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setExploded(true);
          // Stop alarm siren & play explosion
          if (stopAlarmRef.current) {
            stopAlarmRef.current();
            stopAlarmRef.current = null;
          }
          playExplosion();
          return 0;
        }
        playCountdownBeep(prev - 1);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver, exploded]);

  const handleVisibility = useCallback(() => {
    // Only trigger if user is logged in and playing the game
    if (!isLoggedIn || currentLevel < 1) return;
    if (!ANTI_CHEAT_ENABLED) return; // Skip if disabled
    if (gameCompleted) return; // Skip if game is completed
    
    const now = Date.now();
    
    // If page becomes hidden
    if (document.hidden) {
      lastVisibilityChangeRef.current = now;
      
      // Wait 300ms to see if page becomes visible again (navigation)
      setTimeout(() => {
        // If still hidden after 300ms, it's a real tab switch
        if (document.hidden && Date.now() - lastVisibilityChangeRef.current >= 300) {
          triggerWarning();
        }
      }, 300);
    }
  }, [triggerWarning, isLoggedIn, currentLevel]);

  const handleBlur = useCallback(() => {
    // Don't trigger on blur events at all - they're too unreliable
    // Only rely on visibilitychange for tab switching detection
    return;
  }, []);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    triggerWarning();
  }, [triggerWarning]);

  useEffect(() => {
    // Only listen for visibility changes (tab switching)
    // Only activate when user is logged in and playing
    if (!isLoggedIn || currentLevel < 1 || !ANTI_CHEAT_ENABLED || gameCompleted) return;
    
    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [handleVisibility, isLoggedIn, currentLevel, gameCompleted]);

  useEffect(() => {
    // Cleanup function to clear all intervals when component unmounts
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

  // Restart countdown if warning is showing on mount (after refresh)
  useEffect(() => {
    if (show && countdown > 0 && !canDismiss && !countdownIntervalRef.current) {
      console.log('Restarting countdown after page refresh');
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            setCanDismiss(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [show, countdown, canDismiss]);

  // Debug effect to monitor countdown
  useEffect(() => {
    if (show && countdown === 0 && !canDismiss) {
      console.log('Countdown reached 0, enabling dismiss');
      setCanDismiss(true);
    }
  }, [show, countdown, canDismiss]);

  // Ensure countdown starts when warning is shown
  useEffect(() => {
    if (show && countdown === 60 && !canDismiss && !countdownIntervalRef.current) {
      console.log('Starting countdown timer');
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          console.log('Countdown tick:', prev);
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            setCanDismiss(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [show, countdown, canDismiss]);

  const dismiss = () => {
    if (!canDismiss) return;
    
    // Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    // Reset states
    setShow(false);
    setCountdown(60);
    setCanDismiss(false);
    
    // Clear localStorage
    if (teamId) {
      localStorage.removeItem(`antiCheat_warning_${teamId}`);
      localStorage.removeItem(`antiCheat_countdown_${teamId}`);
      localStorage.removeItem(`antiCheat_canDismiss_${teamId}`);
    }
    
    // Timer continues running - no resume needed
  };

  // If anti-cheat is disabled, don't render anything
  if (!ANTI_CHEAT_ENABLED) {
    return null;
  }

  // Exploded = total destruction screen
  if (exploded) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black"
      >
        <motion.div
          initial={{ scale: 20, opacity: 1 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 bg-destructive"
        />
        {/* Screen shake keyframes */}
        <style>{`
          @keyframes screen-shake {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            10% { transform: translate(-8px, -6px) rotate(-1deg); }
            20% { transform: translate(8px, 4px) rotate(1deg); }
            30% { transform: translate(-6px, 8px) rotate(0deg); }
            40% { transform: translate(6px, -4px) rotate(1deg); }
            50% { transform: translate(-4px, 6px) rotate(-1deg); }
            60% { transform: translate(8px, -8px) rotate(0deg); }
            70% { transform: translate(-8px, 4px) rotate(-1deg); }
            80% { transform: translate(4px, -6px) rotate(1deg); }
            90% { transform: translate(-4px, 8px) rotate(0deg); }
          }
          .shake-screen { animation: screen-shake 0.15s infinite; }
        `}</style>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center"
        >
          <p className="text-destructive font-mono text-lg mb-4">CONNECTION TERMINATED</p>
          <h1 className="text-5xl font-bold text-destructive font-mono mb-6 tracking-widest">
            SYSTEM DESTROYED
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            OMEGA has purged all data. Session irreversibly corrupted.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // Game over - OMEGA caught you, countdown to explosion
  if (gameOver) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black"
      >
        {/* Screen shake style for game over */}
        <style>{`
          @keyframes screen-shake-intense {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            10% { transform: translate(-5px, -3px) rotate(-0.5deg); }
            20% { transform: translate(5px, 2px) rotate(0.5deg); }
            30% { transform: translate(-3px, 5px) rotate(0deg); }
            40% { transform: translate(3px, -2px) rotate(0.5deg); }
            50% { transform: translate(-2px, 3px) rotate(-0.5deg); }
            60% { transform: translate(5px, -5px) rotate(0deg); }
            70% { transform: translate(-5px, 2px) rotate(-0.5deg); }
            80% { transform: translate(2px, -3px) rotate(0.5deg); }
            90% { transform: translate(-2px, 5px) rotate(0deg); }
          }
          .shake-intense { animation: screen-shake-intense 0.1s infinite; }
        `}</style>
        <div className="shake-intense absolute inset-0" />
        {/* Flashing red overlay */}
        <motion.div
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute inset-0 bg-destructive pointer-events-none"
        />

        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="relative z-10"
        >
          <Skull className="w-32 h-32 text-destructive mb-6" />
        </motion.div>

        <motion.h1
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.3, repeat: Infinity }}
          className="relative z-10 text-4xl md:text-5xl font-bold text-destructive font-mono mb-4 tracking-wider"
        >
          ⚠ OMEGA HAS CAUGHT YOU ⚠
        </motion.h1>

        <p className="relative z-10 text-destructive/80 font-mono text-lg mb-2">
          Too many unauthorized actions detected.
        </p>
        <p className="relative z-10 text-destructive/60 font-mono text-sm mb-8">
          Initiating self-destruct sequence...
        </p>

        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="relative z-10 text-center"
        >
          <p className="text-destructive font-mono text-sm mb-2">DETONATION IN</p>
          <p className="text-8xl font-bold text-destructive font-mono tabular-nums text-glow-red">
            {explosionCountdown}
          </p>
        </motion.div>

        {/* Glitch lines */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              delay: i * 0.15,
              repeatDelay: Math.random() * 2,
            }}
            className="absolute z-10 h-px w-full bg-destructive"
            style={{ top: `${20 + i * 15}%` }}
          />
        ))}
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-destructive/95 backdrop-blur-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <AlertTriangle className="w-24 h-24 text-destructive-foreground mb-6" />
          </motion.div>

          <h1 className="text-4xl font-bold text-destructive-foreground mb-4 text-glow-red">
            ⚠ SECURITY BREACH DETECTED ⚠
          </h1>

          <p className="text-destructive-foreground/80 text-lg mb-2">
            Unauthorized action logged. This incident has been reported.
          </p>

          <p className="text-destructive-foreground/60 font-mono text-sm mb-8">
            Strike {strikes} of {MAX_STRIKES} — {strikes >= MAX_STRIKES ? 'FINAL WARNING' : `${MAX_STRIKES - strikes} remaining`}
          </p>

          <p className="text-destructive-foreground font-mono text-3xl mb-8 tabular-nums">
            {countdown > 0 ? `${countdown}s` : 'UNLOCKED'}
          </p>

          <button
            onClick={dismiss}
            disabled={!canDismiss}
            className={`px-6 py-3 border-2 font-mono transition-colors ${
              canDismiss
                ? 'border-destructive-foreground text-destructive-foreground hover:bg-destructive-foreground hover:text-destructive cursor-pointer'
                : 'border-destructive-foreground/30 text-destructive-foreground/30 cursor-not-allowed'
            }`}
          >
            {canDismiss
              ? '[ACKNOWLEDGE & RETURN]'
              : `[LOCKED — ${countdown}s]`}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AntiCheat;
