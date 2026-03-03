import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Skull } from 'lucide-react';

const AntiCheat = () => {
  const [show, setShow] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [countdown, setCountdown] = useState(60);
  const [canDismiss, setCanDismiss] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [explosionCountdown, setExplosionCountdown] = useState(10);
  const [exploded, setExploded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const explosionRef = useRef<HTMLAudioElement | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/fahh.mp3');
    // Create alarm loop for game over
    alarmRef.current = new Audio('/sounds/fahh.mp3');
    if (alarmRef.current) alarmRef.current.loop = true;
  }, []);

  const playAlert = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const triggerWarning = useCallback(() => {
    if (gameOver || exploded) return;

    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    playAlert();

    if (newStrikes > 3) {
      // Game over - OMEGA caught you
      setShow(false);
      setGameOver(true);
      if (alarmRef.current) {
        alarmRef.current.currentTime = 0;
        alarmRef.current.play().catch(() => {});
      }
    } else {
      setShow(true);
      setCountdown(60);
      setCanDismiss(false);

      // Start countdown
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
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
          if (alarmRef.current) {
            alarmRef.current.pause();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver, exploded]);

  const handleVisibility = useCallback(() => {
    if (document.hidden) {
      triggerWarning();
    }
  }, [triggerWarning]);

  const handleBlur = useCallback(() => {
    triggerWarning();
  }, [triggerWarning]);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    triggerWarning();
  }, [triggerWarning]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleBlur);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [handleVisibility, handleContextMenu, handleBlur]);

  const dismiss = () => {
    if (!canDismiss) return;
    setShow(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

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
            Strike {strikes} of 3 — {strikes >= 3 ? 'FINAL WARNING' : `${3 - strikes} remaining`}
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
