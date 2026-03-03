import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const AntiCheat = () => {
  const [show, setShow] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/fahh.mp3');
  }, []);

  const playAlert = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const handleVisibility = useCallback(() => {
    if (document.hidden) {
      setShow(true);
      playAlert();
    }
  }, [playAlert]);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setShow(true);
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleVisibility, handleContextMenu]);

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
          <p className="text-destructive-foreground/80 text-lg mb-8">
            Unauthorized action logged. This incident has been reported.
          </p>
          <button
            onClick={() => setShow(false)}
            className="px-6 py-3 border-2 border-destructive-foreground text-destructive-foreground font-mono hover:bg-destructive-foreground hover:text-destructive transition-colors"
          >
            [ACKNOWLEDGE & RETURN]
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AntiCheat;
