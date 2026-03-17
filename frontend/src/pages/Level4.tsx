import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import Typewriter from '@/components/Typewriter';
import GlitchText from '@/components/GlitchText';
import { Skull, AlertTriangle, Eye, Zap, FileImage } from 'lucide-react';

const VIGENERE_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const VigenereGrid = () => (
  <div className="border border-destructive bg-card p-3 box-glow-red overflow-auto">
    <h3 className="text-xs text-muted-foreground mb-2">OMEGA'S DECRYPTION MATRIX</h3>
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

const GlitchedFace = ({ onClick }: { onClick: () => void }) => (
  <motion.div
    className="relative w-80 h-64 mx-auto mb-6 cursor-pointer group"
    animate={{
      x: [0, -3, 5, -2, 0],
      y: [0, 2, -3, 1, 0],
      filter: [
        'hue-rotate(0deg) brightness(1) contrast(1)',
        'hue-rotate(90deg) brightness(1.5) contrast(1.2)',
        'hue-rotate(180deg) brightness(0.5) contrast(0.8)',
        'hue-rotate(270deg) brightness(1.2) contrast(1.5)',
        'hue-rotate(360deg) brightness(1) contrast(1)',
      ],
    }}
    transition={{ duration: 0.5, repeat: Infinity }}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="w-full h-full border-4 border-destructive bg-destructive/10 flex items-center justify-center box-glow-red relative overflow-hidden rounded-lg">
      {/* Actual OMEGA Image */}
      <img 
        src="/images/omega-face.jpg" 
        alt="OMEGA AI Face"
        className="w-full h-full object-cover rounded-lg"
        style={{
          filter: 'contrast(1.2) brightness(0.9) saturate(1.1)',
        }}
      />
      
      {/* Glitch overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-destructive/20 to-transparent opacity-30 animate-pulse" />
    </div>
    
    {/* Glitch artifacts */}
    <div className="absolute inset-0 rounded-lg opacity-30 pointer-events-none" style={{
      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(345,100%,50%,0.3) 2px, hsl(345,100%,50%,0.3) 4px)',
    }} />
    
    {/* Scan lines */}
    <div className="absolute inset-0 rounded-lg opacity-20 pointer-events-none" style={{
      background: 'repeating-linear-gradient(90deg, transparent, transparent 1px, hsl(345,100%,50%,0.2) 1px, hsl(345,100%,50%,0.2) 2px)',
    }} />
    
    {/* Inspection hint */}
    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
      <FileImage className="w-4 h-4 mx-auto mb-1" />
      Click to examine closely
    </div>
  </motion.div>
);

const CountdownTimer = () => {
  const [time, setTime] = useState(300); // 5 minutes countdown
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  
  return (
    <motion.div 
      className="text-center mb-6"
      animate={{ 
        color: time < 60 ? ['hsl(345,100%,50%)', 'hsl(345,100%,80%)', 'hsl(345,100%,50%)'] : 'hsl(345,100%,50%)',
        scale: time < 60 ? [1, 1.1, 1] : 1
      }}
      transition={{ duration: 1, repeat: time < 60 ? Infinity : 0 }}
    >
      <div className="text-4xl font-mono font-bold text-destructive">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="text-xs text-muted-foreground">SYSTEM WIPE COUNTDOWN</div>
    </motion.div>
  );
};

const Level4 = () => {
  const [glitchAnswer, setGlitchAnswer] = useState('');
  const [cipherAnswer, setCipherAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [victory, setVictory] = useState(false);
  const [showImageInspector, setShowImageInspector] = useState(false);
  
  const { submitAnswer, addScore, setCurrentLevel, stopTimer, level4Stage, setLevel4Stage } = useGame();
  const navigate = useNavigate();

  useEffect(() => { 
    setCurrentLevel(4); 
    // Reset to glitch stage when entering Level 4
    if (!level4Stage) {
      setLevel4Stage('glitch');
    }
  }, [setCurrentLevel, level4Stage, setLevel4Stage]);

  const handleGlitchSubmit = () => {
    if (submitAnswer('4-glitch', glitchAnswer)) {
      setFeedback('correct');
      addScore(150);
      setTimeout(() => {
        setLevel4Stage('cipher');
        setFeedback(null);
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const handleCipherSubmit = () => {
    if (submitAnswer('4-cipher', cipherAnswer)) {
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
        className="min-h-screen pt-28 pb-8 px-4 bg-background overflow-y-auto"
        style={{ background: 'radial-gradient(ellipse at center, hsl(345,100%,5%) 0%, hsl(0,0%,0%) 70%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="flex items-center gap-2 mb-4"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="text-xl font-bold text-destructive text-glow-red">
              <GlitchText text="LEVEL 4: THE CORE MELTDOWN" className="text-destructive" />
            </h2>
          </motion.div>

          <div className="text-sm text-destructive/70 mb-6">
            <Typewriter 
              text=">> CRITICAL: Master terminal accessed. OMEGA's corrupted face detected. Assemble payload and initiate Kill Switch before total system wipe..." 
              speed={20} 
            />
          </div>

          <CountdownTimer />

          {/* Sub-Puzzle 1: Glitch Image */}
          {(level4Stage === 'glitch' || !level4Stage) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-secondary" />
                <h3 className="text-lg font-bold text-secondary text-glow-green">SUB-PUZZLE 1: THE GLITCH IMAGE</h3>
              </div>

              <div className="text-center">
                <GlitchedFace onClick={() => setShowImageInspector(true)} />
                
                <div className="text-center text-sm text-destructive animate-pulse-glow mb-6">
                  <GlitchText text="I AM OMEGA. I CANNOT BE STOPPED." className="text-destructive" />
                </div>
              </div>

              <div className="border border-accent/50 bg-accent/10 p-4 mb-6 box-glow-red">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent mt-0.5" />
                  <div className="text-sm text-accent/90">
                    <div className="font-bold mb-1">CHALLENGE:</div>
                    <div className="text-xs space-y-1">
                      <div>• OMEGA's face is heavily glitched</div>
                      <div>• Inspect the image closely or adjust your monitor's contrast</div>
                      <div>• Find the hidden keyword within the corruption</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border bg-card p-4 box-glow-cyan">
                <label className="text-xs text-muted-foreground mb-2 block">HIDDEN KEYWORD:</label>
                <div className="flex gap-3">
                  <motion.input
                    value={glitchAnswer}
                    onChange={e => setGlitchAnswer(e.target.value.toUpperCase())}
                    className="input-cyber flex-1 font-mono text-lg"
                    placeholder="Enter the keyword found in the image..."
                    onKeyDown={e => e.key === 'Enter' && handleGlitchSubmit()}
                    animate={feedback === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
                  />
                  <motion.button
                    onClick={handleGlitchSubmit}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-2 font-mono font-bold transition-colors ${
                      feedback === 'correct' ? 'bg-secondary text-secondary-foreground' :
                      feedback === 'wrong' ? 'bg-destructive text-destructive-foreground' :
                      'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                  >
                    SUBMIT
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Sub-Puzzle 2: Final Compilation */}
          {level4Stage === 'cipher' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-secondary" />
                <h3 className="text-lg font-bold text-secondary text-glow-green">SUB-PUZZLE 2: THE FINAL COMPILATION</h3>
              </div>

              <div className="text-sm text-secondary/80 mb-4">
                ✓ KEYWORD IDENTIFIED. Accessing master terminal...
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Override Fragments */}
                  <div className="border border-secondary bg-secondary/10 p-4 box-glow-green">
                    <h4 className="text-sm font-bold text-secondary mb-3">OVERRIDE FRAGMENTS COLLECTED:</h4>
                    <div className="space-y-2 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-primary">Fragment Alpha (Level 1):</span>
                        <span className="text-secondary font-bold">SYS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary">Fragment Beta (Level 2):</span>
                        <span className="text-secondary font-bold">TEM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary">Fragment Gamma (Level 3):</span>
                        <span className="text-secondary font-bold">HALT</span>
                      </div>
                      <div className="border-t border-secondary/30 pt-2 mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-primary">Base Text:</span>
                          <span className="text-secondary font-bold text-lg">SYSTEMHALT</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-accent/50 bg-accent/10 p-4 box-glow-red">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-accent mt-0.5" />
                      <div className="text-sm text-accent/90">
                        <div className="font-bold mb-1">CHALLENGE:</div>
                        <div className="text-xs space-y-1">
                          <div>• Combine fragments: SYS + TEM + HALT = SYSTEMHALT</div>
                          <div>• Use Vigenère cipher with keyword: OMEGA (repeat as needed)</div>
                          <div>• SYSTEMHALT + OMEGAOMEGA = ?</div>
                          <div>• Enter the final 10-letter encrypted string</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kill Switch Input */}
                  <div className="border border-destructive bg-card p-4 box-glow-red">
                    <label className="text-xs text-muted-foreground mb-2 block flex items-center gap-2">
                      <Skull className="w-3 h-3 text-destructive" />
                      KILL SWITCH COMMAND (10 CHARACTERS):
                    </label>
                    <motion.input
                      value={cipherAnswer}
                      onChange={e => setCipherAnswer(e.target.value.toUpperCase().slice(0, 10))}
                      className="input-cyber w-full text-2xl tracking-[0.4em] text-center text-destructive mb-3"
                      placeholder="__________"
                      maxLength={10}
                      animate={feedback === 'wrong' ? { x: [-15, 15, -15, 15, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      style={feedback === 'wrong' ? { borderColor: 'hsl(345,100%,50%)' } : {}}
                    />
                    <motion.button
                      onClick={handleCipherSubmit}
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
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {showImageInspector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setShowImageInspector(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-[90vh] p-4"
              onClick={e => e.stopPropagation()}
            >
              {/* Large static image */}
              <img 
                src="/images/omega-face.jpg" 
                alt="OMEGA AI Face - Enlarged View"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg border-2 border-primary"
                style={{
                  filter: 'contrast(1.3) brightness(1.1) saturate(1.2)',
                }}
              />
              
              {/* Close button */}
              <button 
                onClick={() => setShowImageInspector(false)} 
                className="absolute top-2 right-2 px-4 py-2 bg-destructive text-destructive-foreground font-mono text-sm hover:opacity-80 transition-opacity rounded"
              >
                ✕ CLOSE
              </button>
              
              {/* Hint text */}
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <div className="bg-black/70 text-primary text-sm font-mono px-3 py-2 rounded">
                  Examine the image carefully for hidden text or patterns...
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory sequence */}
      <AnimatePresence>
        {victory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  color: ['hsl(345,100%,50%)', 'hsl(0,100%,100%)', 'hsl(345,100%,50%)'],
                  textShadow: [
                    '0 0 20px hsl(345,100%,50%)',
                    '0 0 40px hsl(0,100%,100%)',
                    '0 0 20px hsl(345,100%,50%)'
                  ]
                }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-6xl font-bold mb-4"
              >
                SYSTEM RESTORED
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-2xl text-secondary"
              >
                OMEGA TERMINATED
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Level4;