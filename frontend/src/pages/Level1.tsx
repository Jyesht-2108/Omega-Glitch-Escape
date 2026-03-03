import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import Typewriter from '@/components/Typewriter';
import { Cpu } from 'lucide-react';

const BINARY_STRING = "101101110010";

const LogicGate = ({ type, inputA, inputB, onToggleA, onToggleB }: {
  type: string; inputA: boolean; inputB: boolean;
  onToggleA: () => void; onToggleB: () => void;
}) => {
  const output = type === 'AND' ? inputA && inputB
    : type === 'OR' ? inputA || inputB
    : type === 'XOR' ? inputA !== inputB
    : false;

  return (
    <div className="border border-border bg-card p-4 box-glow-green">
      <div className="text-xs text-muted-foreground mb-2">{type} GATE</div>
      <svg viewBox="0 0 160 100" className="w-full h-20">
        {/* Gate body */}
        <rect x="50" y="20" width="60" height="60" fill="none" stroke="hsl(120,100%,50%)" strokeWidth="1.5" rx="4" />
        <text x="80" y="55" textAnchor="middle" fill="hsl(120,100%,50%)" fontSize="12" fontFamily="monospace">{type}</text>
        {/* Input lines */}
        <line x1="10" y1="35" x2="50" y2="35" stroke="hsl(120,100%,50%)" strokeWidth="1.5" />
        <line x1="10" y1="65" x2="50" y2="65" stroke="hsl(120,100%,50%)" strokeWidth="1.5" />
        {/* Output line */}
        <line x1="110" y1="50" x2="150" y2="50" stroke={output ? "hsl(120,100%,50%)" : "hsl(120,100%,20%)"} strokeWidth="2" />
        {/* Input indicators */}
        <circle cx="10" cy="35" r="6" fill={inputA ? "hsl(120,100%,50%)" : "transparent"} stroke="hsl(120,100%,50%)" strokeWidth="1.5" />
        <circle cx="10" cy="65" r="6" fill={inputB ? "hsl(120,100%,50%)" : "transparent"} stroke="hsl(120,100%,50%)" strokeWidth="1.5" />
        {/* Output indicator */}
        <circle cx="150" cy="50" r="6" fill={output ? "hsl(120,100%,50%)" : "transparent"} stroke="hsl(120,100%,50%)" strokeWidth="1.5" />
      </svg>
      <div className="flex gap-2 mt-2">
        <button onClick={onToggleA} className={`flex-1 text-xs py-1 border font-mono transition-colors ${inputA ? 'border-secondary bg-secondary/20 text-secondary' : 'border-border text-muted-foreground'}`}>
          A: {inputA ? '1' : '0'}
        </button>
        <button onClick={onToggleB} className={`flex-1 text-xs py-1 border font-mono transition-colors ${inputB ? 'border-secondary bg-secondary/20 text-secondary' : 'border-border text-muted-foreground'}`}>
          B: {inputB ? '1' : '0'}
        </button>
      </div>
      <div className="text-center text-xs mt-2 text-secondary text-glow-green">OUT: {output ? '1' : '0'}</div>
    </div>
  );
};

const Level1 = () => {
  const [answer, setAnswer] = useState('');
  const [gates, setGates] = useState([
    { type: 'AND', a: false, b: false },
    { type: 'OR', a: false, b: false },
    { type: 'XOR', a: false, b: false },
  ]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const { submitAnswer, addScore, setCurrentLevel } = useGame();
  const navigate = useNavigate();

  useEffect(() => { setCurrentLevel(1); }, [setCurrentLevel]);

  const handleSubmit = () => {
    if (submitAnswer(1, answer)) {
      setFeedback('correct');
      addScore(100);
      setTimeout(() => navigate('/level/2'), 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="min-h-screen pt-20 pb-8 px-4 bg-background"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-secondary" />
          <h2 className="text-xl font-bold text-secondary text-glow-green">LEVEL 1: THE BOOT SEQUENCE</h2>
        </div>

        {showIntro && (
          <div className="mb-6 text-sm text-secondary/80">
            <Typewriter
              text=">> SYSTEM BOOT INTERRUPTED. Decode the scrambled binary using the logic gate array. Provide the 4-bit output key to continue..."
              speed={20}
              onComplete={() => setTimeout(() => setShowIntro(false), 2000)}
            />
          </div>
        )}

        {/* Binary Display */}
        <div className="border border-border bg-card p-6 mb-6 box-glow-green">
          <div className="text-xs text-muted-foreground mb-2">SCRAMBLED_BINARY_STREAM:</div>
          <div className="font-mono text-3xl text-secondary text-glow-green tracking-[0.3em] text-center">
            {BINARY_STRING.split('').map((bit, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={bit === '1' ? 'text-secondary' : 'text-secondary/30'}
              >
                {bit}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Logic Gates */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {gates.map((gate, i) => (
            <LogicGate
              key={i}
              type={gate.type}
              inputA={gate.a}
              inputB={gate.b}
              onToggleA={() => setGates(prev => prev.map((g, j) => j === i ? { ...g, a: !g.a } : g))}
              onToggleB={() => setGates(prev => prev.map((g, j) => j === i ? { ...g, b: !g.b } : g))}
            />
          ))}
        </div>

        {/* Answer Input */}
        <div className="border border-border bg-card p-6 box-glow-green">
          <label className="text-xs text-muted-foreground mb-2 block">4-BIT OUTPUT KEY:</label>
          <div className="flex gap-3">
            <motion.input
              value={answer}
              onChange={e => setAnswer(e.target.value.replace(/[^01]/g, '').slice(0, 4))}
              className="input-cyber flex-1 text-2xl tracking-[0.5em] text-center text-secondary"
              placeholder="0000"
              maxLength={4}
              animate={feedback === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.3 }}
            />
            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 font-mono font-bold transition-colors ${
                feedback === 'correct' ? 'bg-secondary text-secondary-foreground' :
                feedback === 'wrong' ? 'bg-destructive text-destructive-foreground' :
                'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {feedback === 'correct' ? 'ACCESS GRANTED' : 'SUBMIT'}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="text-4xl font-bold text-secondary text-glow-green">ACCESS GRANTED</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Level1;
