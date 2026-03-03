import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import Typewriter from '@/components/Typewriter';
import GlitchText from '@/components/GlitchText';
import { Skull, AlertTriangle } from 'lucide-react';

const VIGENERE_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const VigenereGrid = () => (
  <div className="border border-destructive bg-card p-3 box-glow-red overflow-auto">
    <h3 className="text-xs text-muted-foreground mb-2">VIGENÈRE CIPHER MATRIX</h3>
    <div className="text-[8px] leading-3 font-mono">
      <div className="flex">
        <span className="w-4 text-destructive font-bold"> </span>
        {VIGENERE_ALPHA.split('').map(c => (
          <span key={c} className="w-4 text-center text-primary font-bold">{c}</span>
        ))}
      </div>
      {VIGENERE_ALPHA.split('').map((row, ri) => (
        <div key={row} className="flex">
          <span className="w-4 text-destructive font-bold">{row}</span>
          {VIGENERE_ALPHA.split('').map((_, ci) => (
            <span key={ci} className="w-4 text-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-crosshair">
              {VIGENERE_ALPHA[(ri + ci) % 26]}
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const GlitchedFace = () => (
  <motion.div
    className="relative w-48 h-48 mx-auto mb-6"
    animate={{
      x: [0, -3, 5, -2, 0],
      y: [0, 2, -3, 1, 0],
      filter: [
        'hue-rotate(0deg) brightness(1)',
        'hue-rotate(90deg) brightness(1.5)',
        'hue-rotate(180deg) brightness(0.5)',
        'hue-rotate(270deg) brightness(1.2)',
        'hue-rotate(360deg) brightness(1)',
      ],
    }}
    transition={{ duration: 0.5, repeat: Infinity }}
  >
    <div className="w-full h-full rounded-full border-2 border-destructive bg-destructive/10 flex items-center justify-center box-glow-red">
      <Skull className="w-24 h-24 text-destructive animate-glitch" />
    </div>
    {/* Glitch artifacts */}
    <div className="absolute inset-0 rounded-full opacity-30" style={{
      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(345,100%,50%,0.3) 2px, hsl(345,100%,50%,0.3) 4px)',
    }} />
  </motion.div>
);

const Level4 = () => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [victory, setVictory] = useState(false);
  const { submitAnswer, addScore, setCurrentLevel, stopTimer } = useGame();
  const navigate = useNavigate();

  useEffect(() => { setCurrentLevel(4); }, [setCurrentLevel]);

  const handleSubmit = () => {
    if (submitAnswer(4, answer)) {
      setFeedback('correct');
      addScore(300);
      stopTimer();
      setTimeout(() => setVictory(true), 500);
      setTimeout(() => navigate('/victory'), 3000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="min-h-screen pt-20 pb-8 px-4 bg-background"
        style={{ background: 'radial-gradient(ellipse at center, hsl(345,100%,5%) 0%, hsl(0,0%,0%) 70%)' }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="flex items-center gap-2 mb-4"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="text-xl font-bold text-destructive text-glow-red">
              <GlitchText text="LEVEL 4: CORE MELTDOWN" className="text-destructive" />
            </h2>
          </motion.div>

          <div className="text-sm text-destructive/70 mb-6">
            <Typewriter text=">> CRITICAL: OMEGA AI has achieved sentience. Decode the kill switch passphrase using the Vigenère cipher. You have ONE chance." speed={20} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <GlitchedFace />
              <div className="text-center text-sm text-destructive animate-pulse-glow mb-6">
                <GlitchText text="I AM OMEGA. I CANNOT BE STOPPED." className="text-destructive" />
              </div>

              {/* Kill Switch Input */}
              <div className="border border-destructive bg-card p-6 box-glow-red">
                <label className="text-xs text-muted-foreground mb-2 block flex items-center gap-2">
                  <Skull className="w-3 h-3 text-destructive" />
                  KILL SWITCH PASSPHRASE (10 CHARACTERS):
                </label>
                <motion.input
                  value={answer}
                  onChange={e => setAnswer(e.target.value.toUpperCase().slice(0, 10))}
                  className="input-cyber w-full text-2xl tracking-[0.4em] text-center text-destructive mb-3"
                  placeholder="__________"
                  maxLength={10}
                  animate={feedback === 'wrong' ? { x: [-15, 15, -15, 15, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  style={feedback === 'wrong' ? { borderColor: 'hsl(345,100%,50%)' } : {}}
                />
                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 font-mono font-bold text-lg tracking-widest transition-colors ${
                    feedback === 'correct' ? 'bg-secondary text-secondary-foreground' :
                    'bg-destructive text-destructive-foreground hover:opacity-90'
                  }`}
                >
                  ⚡ EXECUTE KILL SWITCH ⚡
                </motion.button>
              </div>
            </div>

            <VigenereGrid />
          </div>
        </div>
      </motion.div>

      {/* Victory flash */}
      <AnimatePresence>
        {victory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.5, times: [0, 0.1, 0.4, 1] }}
            className="fixed inset-0 z-[100] bg-white"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Level4;
