import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import Typewriter from '@/components/Typewriter';
import { Cpu } from 'lucide-react';

const BINARY_STRING = "101101110010";

const LogicCircuit = ({ inputs, onToggleInput }: {
  inputs: boolean[];
  onToggleInput: (index: number) => void;
}) => {
  // Calculate gate outputs
  const andOutput = inputs[0] && inputs[1];
  const orOutput = inputs[2] || inputs[3];
  const xorOutput = inputs[4] !== inputs[5];
  const finalOutput = [andOutput, orOutput, xorOutput, andOutput && orOutput];

  const green = "hsl(120,100%,50%)";
  const greenDim = "hsl(120,100%,20%)";

  return (
    <div className="border border-border bg-card p-6 box-glow-green">
      <div className="text-xs text-muted-foreground mb-4">HARDWARE LOCK CIRCUIT</div>
      <svg viewBox="0 0 800 420" className="w-full h-auto">
        {/* Input nodes on the left */}
        {inputs.map((active, i) => {
          const yPos = 60 + i * 60;
          return (
            <g key={i}>
              <circle cx="30" cy={yPos} r="8" fill={active ? green : "transparent"} stroke={green} strokeWidth="2" />
              <text x="45" y={yPos + 5} fill={green} fontSize="16" fontFamily="monospace">
                {String.fromCharCode(65 + i)}: {active ? '1' : '0'}
              </text>
              <line 
                x1="38" 
                y1={yPos} 
                x2="150" 
                y2={i < 2 ? 110 : i < 4 ? 210 : 310} 
                stroke={active ? green : greenDim} 
                strokeWidth="2" 
              />
            </g>
          );
        })}

        {/* AND Gate */}
        <rect x="150" y="80" width="80" height="60" fill="none" stroke={green} strokeWidth="2" rx="4" />
        <text x="190" y="115" textAnchor="middle" fill={green} fontSize="16" fontFamily="monospace" fontWeight="bold">AND</text>
        <line x1="230" y1="110" x2="300" y2="110" stroke={andOutput ? green : greenDim} strokeWidth="2" />
        <circle cx="300" cy="110" r="6" fill={andOutput ? green : "transparent"} stroke={green} strokeWidth="2" />

        {/* OR Gate */}
        <rect x="150" y="180" width="80" height="60" fill="none" stroke={green} strokeWidth="2" rx="4" />
        <text x="190" y="215" textAnchor="middle" fill={green} fontSize="16" fontFamily="monospace" fontWeight="bold">OR</text>
        <line x1="230" y1="210" x2="300" y2="210" stroke={orOutput ? green : greenDim} strokeWidth="2" />
        <circle cx="300" cy="210" r="6" fill={orOutput ? green : "transparent"} stroke={green} strokeWidth="2" />

        {/* XOR Gate */}
        <rect x="150" y="280" width="80" height="60" fill="none" stroke={green} strokeWidth="2" rx="4" />
        <text x="190" y="315" textAnchor="middle" fill={green} fontSize="16" fontFamily="monospace" fontWeight="bold">XOR</text>
        <line x1="230" y1="310" x2="300" y2="310" stroke={xorOutput ? green : greenDim} strokeWidth="2" />
        <circle cx="300" cy="310" r="6" fill={xorOutput ? green : "transparent"} stroke={green} strokeWidth="2" />

        {/* Final AND gate combining first two outputs */}
        <line x1="300" y1="110" x2="400" y2="140" stroke={andOutput ? green : greenDim} strokeWidth="2" />
        <line x1="300" y1="210" x2="400" y2="180" stroke={orOutput ? green : greenDim} strokeWidth="2" />
        <rect x="400" y="150" width="80" height="60" fill="none" stroke={green} strokeWidth="2" rx="4" />
        <text x="440" y="185" textAnchor="middle" fill={green} fontSize="16" fontFamily="monospace" fontWeight="bold">AND</text>
        <line x1="480" y1="180" x2="550" y2="180" stroke={finalOutput[3] ? green : greenDim} strokeWidth="2" />
        <circle cx="550" cy="180" r="6" fill={finalOutput[3] ? green : "transparent"} stroke={green} strokeWidth="2" />

        {/* Output indicators on the right */}
        <text x="600" y="115" fill={green} fontSize="16" fontFamily="monospace">OUT[0]: {andOutput ? '1' : '0'}</text>
        <text x="600" y="185" fill={green} fontSize="16" fontFamily="monospace">OUT[1]: {orOutput ? '1' : '0'}</text>
        <text x="600" y="255" fill={green} fontSize="16" fontFamily="monospace">OUT[2]: {xorOutput ? '1' : '0'}</text>
        <text x="600" y="315" fill={green} fontSize="16" fontFamily="monospace">OUT[3]: {finalOutput[3] ? '1' : '0'}</text>

        {/* Lines to outputs */}
        <line x1="300" y1="110" x2="580" y2="110" stroke={andOutput ? green : greenDim} strokeWidth="2" />
        <line x1="550" y1="180" x2="580" y2="180" stroke={finalOutput[3] ? green : greenDim} strokeWidth="2" />
        <line x1="300" y1="310" x2="580" y2="250" stroke={xorOutput ? green : greenDim} strokeWidth="2" />
      </svg>

      {/* Input controls */}
      <div className="grid grid-cols-6 gap-2 mt-6">
        {inputs.map((active, i) => (
          <button
            key={i}
            onClick={() => onToggleInput(i)}
            className={`text-sm py-2 border font-mono transition-colors ${
              active ? 'border-secondary bg-secondary/20 text-secondary' : 'border-border text-muted-foreground'
            }`}
          >
            {String.fromCharCode(65 + i)}: {active ? '1' : '0'}
          </button>
        ))}
      </div>
    </div>
  );
};

const Level1 = () => {
  const [answer, setAnswer] = useState('');
  const [inputs, setInputs] = useState([false, false, false, false, false, false]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const { submitAnswer, addScore, setCurrentLevel } = useGame();
  const navigate = useNavigate();

  useEffect(() => { setCurrentLevel(1); }, [setCurrentLevel]);

  const handleToggleInput = (index: number) => {
    setInputs(prev => prev.map((val, i) => i === index ? !val : val));
  };

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
      className="min-h-screen pt-28 pb-8 px-4 bg-background overflow-y-auto"
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

        {!showIntro && (
          <div className="mb-6 text-sm text-secondary/80">
            {'>> SYSTEM BOOT INTERRUPTED. Decode the scrambled binary using the logic gate array. Provide the 4-bit output key to continue...'}
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

        {/* Logic Circuit */}
        <div className="mb-6">
          <LogicCircuit inputs={inputs} onToggleInput={handleToggleInput} />
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
