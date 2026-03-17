import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import Typewriter from '@/components/Typewriter';
import { Cpu } from 'lucide-react';

// Single decimal number to convert to binary
const DECIMAL_NUMBER = 45; // 101101 in binary

// ASCII mapping for easier decoding
const ASCII_MAP = [
  { char: 'S', decimal: 5 },
  { char: 'Y', decimal: 7 },
  { char: 'T', decimal: 9 },
  { char: 'E', decimal: 3 },
  { char: 'M', decimal: 11 },
];

// Gate configurations
type GateConfig = 'A' | 'B' | 'C';

const LogicCircuit = ({ inputs, onToggleInput, gateConfig }: {
  inputs: boolean[];
  onToggleInput: (index: number) => void;
  gateConfig: GateConfig;
}) => {
  // Different gate configurations produce different outputs
  let gate1: boolean, gate2: boolean, gate3: boolean, gate4: boolean;
  
  if (gateConfig === 'A') {
    // Config A: Should produce 5 (0101) for 'S'
    // With input 101101: A=1,B=0,C=1,D=1,E=0,F=1
    gate1 = inputs[0] && inputs[1];  // 1 AND 0 = 0
    gate2 = inputs[2] || inputs[3];  // 1 OR 1 = 1
    gate3 = inputs[4] && inputs[5];  // 0 AND 1 = 0
    gate4 = inputs[0] || inputs[1];  // 1 OR 0 = 1
    // Result: 0101 = 5 ✓
  } else if (gateConfig === 'B') {
    // Config B: Should produce 7 (0111) for 'Y'
    gate1 = inputs[0] && inputs[1];  // 1 AND 0 = 0
    gate2 = inputs[2] || inputs[3];  // 1 OR 1 = 1
    gate3 = inputs[4] || inputs[5];  // 0 OR 1 = 1
    gate4 = inputs[2] && inputs[3];  // 1 AND 1 = 1
    // Result: 0111 = 7 ✓
  } else {
    // Config C: Should produce 5 (0101) for 'S'
    gate1 = inputs[0] && inputs[1];  // 1 AND 0 = 0
    gate2 = inputs[2] || inputs[3];  // 1 OR 1 = 1
    gate3 = inputs[4] && inputs[5];  // 0 AND 1 = 0
    gate4 = inputs[0] || inputs[1];  // 1 OR 0 = 1
    // Result: 0101 = 5 ✓
  }
  
  // Create outputs that will give us the pattern we need
  const output1 = gate1 ? '1' : '0';
  const output2 = gate2 ? '1' : '0';
  const output3 = gate3 ? '1' : '0';
  const output4 = gate4 ? '1' : '0';
  
  // Get gate labels based on config
  const getGateLabels = () => {
    if (gateConfig === 'A') return ['AND', 'OR', 'AND', 'OR'];
    if (gateConfig === 'B') return ['AND', 'OR', 'OR', 'AND'];
    return ['AND', 'OR', 'AND', 'OR'];
  };
  
  const gateLabels = getGateLabels();

  const green = "hsl(120,100%,50%)";
  const greenDim = "hsl(120,100%,20%)";

  return (
    <div className="border border-border bg-card p-6 box-glow-green">
      <div className="text-xs text-muted-foreground mb-4">HARDWARE LOCK CIRCUIT - CONFIG {gateConfig}</div>
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

        {/* Gate 1 */}
        <rect x="150" y="80" width="80" height="60" fill="none" stroke={green} strokeWidth="2" rx="4" />
        <text x="190" y="115" textAnchor="middle" fill={green} fontSize="16" fontFamily="monospace" fontWeight="bold">{gateLabels[0]}</text>
        <line x1="230" y1="110" x2="300" y2="110" stroke={gate1 ? green : greenDim} strokeWidth="2" />
        <circle cx="300" cy="110" r="6" fill={gate1 ? green : "transparent"} stroke={green} strokeWidth="2" />

        {/* Gate 2 */}
        <rect x="150" y="180" width="80" height="60" fill="none" stroke={green} strokeWidth="2" rx="4" />
        <text x="190" y="215" textAnchor="middle" fill={green} fontSize="16" fontFamily="monospace" fontWeight="bold">{gateLabels[1]}</text>
        <line x1="230" y1="210" x2="300" y2="210" stroke={gate2 ? green : greenDim} strokeWidth="2" />
        <circle cx="300" cy="210" r="6" fill={gate2 ? green : "transparent"} stroke={green} strokeWidth="2" />

        {/* Gate 3 */}
        <rect x="150" y="280" width="80" height="60" fill="none" stroke={green} strokeWidth="2" rx="4" />
        <text x="190" y="315" textAnchor="middle" fill={green} fontSize="16" fontFamily="monospace" fontWeight="bold">{gateLabels[2]}</text>
        <line x1="230" y1="310" x2="300" y2="310" stroke={gate3 ? green : greenDim} strokeWidth="2" />
        <circle cx="300" cy="310" r="6" fill={gate3 ? green : "transparent"} stroke={green} strokeWidth="2" />

        {/* Final gate */}
        <line x1="300" y1="110" x2="400" y2="140" stroke={gate1 ? green : greenDim} strokeWidth="2" />
        <line x1="300" y1="210" x2="400" y2="180" stroke={gate2 ? green : greenDim} strokeWidth="2" />
        <rect x="400" y="150" width="80" height="60" fill="none" stroke={green} strokeWidth="2" rx="4" />
        <text x="440" y="185" textAnchor="middle" fill={green} fontSize="16" fontFamily="monospace" fontWeight="bold">{gateLabels[3]}</text>
        <line x1="480" y1="180" x2="550" y2="180" stroke={gate4 ? green : greenDim} strokeWidth="2" />
        <circle cx="550" cy="180" r="6" fill={gate4 ? green : "transparent"} stroke={green} strokeWidth="2" />

        {/* Output indicators */}
        <text x="600" y="115" fill={green} fontSize="16" fontFamily="monospace">OUT[0]: {output1}</text>
        <text x="600" y="185" fill={green} fontSize="16" fontFamily="monospace">OUT[1]: {output2}</text>
        <text x="600" y="255" fill={green} fontSize="16" fontFamily="monospace">OUT[2]: {output3}</text>
        <text x="600" y="315" fill={green} fontSize="16" fontFamily="monospace">OUT[3]: {output4}</text>

        {/* Lines to outputs */}
        <line x1="300" y1="110" x2="580" y2="110" stroke={gate1 ? green : greenDim} strokeWidth="2" />
        <line x1="550" y1="180" x2="580" y2="180" stroke={gate4 ? green : greenDim} strokeWidth="2" />
        <line x1="300" y1="310" x2="580" y2="250" stroke={gate3 ? green : greenDim} strokeWidth="2" />
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
  const [gateConfig, setGateConfig] = useState<GateConfig>('A');
  const [collectedOutputs, setCollectedOutputs] = useState<{ [key in GateConfig]?: string }>({});
  const [decimalInputs, setDecimalInputs] = useState<{ [key in GateConfig]?: string }>({});
  const { submitAnswer, addScore, setCurrentLevel, startTimer } = useGame();
  const navigate = useNavigate();

  useEffect(() => { 
    setCurrentLevel(1);
    // Only start timer if it's not already running
    startTimer();
  }, [setCurrentLevel, startTimer]);

  const handleToggleInput = (index: number) => {
    setInputs(prev => prev.map((val, i) => i === index ? !val : val));
  };

  const binaryToDecimal = (binary: string) => parseInt(binary, 2);
  
  const decimalToChar = (decimal: number): string => {
    const mapping: { [key: number]: string } = { 5: 'S', 7: 'Y', 9: 'T', 3: 'E', 11: 'M' };
    return mapping[decimal] || '';
  };
  
  // Use useMemo to recalculate when inputs or gateConfig changes
  const currentOutput = useMemo(() => {
    let gate1: boolean, gate2: boolean, gate3: boolean, gate4: boolean;
    
    console.log('Calculating output for config:', gateConfig, 'inputs:', inputs);
    
    if (gateConfig === 'A') {
      // Config A: Should produce 5 (0101) for 'S'
      // With input [1,0,1,1,0,1]: A=1,B=0,C=1,D=1,E=0,F=1
      gate1 = inputs[0] && inputs[1];  // 1 AND 0 = 0
      gate2 = inputs[2] || inputs[3];  // 1 OR 1 = 1
      gate3 = inputs[4] && inputs[5];  // 0 AND 1 = 0
      gate4 = inputs[0] || inputs[1];  // 1 OR 0 = 1
      // Result: 0101 = 5 ✓
    } else if (gateConfig === 'B') {
      // Config B: Should produce 7 (0111) for 'Y'
      gate1 = inputs[0] && inputs[1];  // 1 AND 0 = 0
      gate2 = inputs[2] || inputs[3];  // 1 OR 1 = 1
      gate3 = inputs[4] || inputs[5];  // 0 OR 1 = 1
      gate4 = inputs[2] && inputs[3];  // 1 AND 1 = 1
      // Result: 0111 = 7 ✓
    } else {
      // Config C: Should produce 5 (0101) for 'S'
      gate1 = inputs[0] && inputs[1];  // 1 AND 0 = 0
      gate2 = inputs[2] || inputs[3];  // 1 OR 1 = 1
      gate3 = inputs[4] && inputs[5];  // 0 AND 1 = 0
      gate4 = inputs[0] || inputs[1];  // 1 OR 0 = 1
      // Result: 0101 = 5 ✓
    }
    
    const output = `${gate1 ? '1' : '0'}${gate2 ? '1' : '0'}${gate3 ? '1' : '0'}${gate4 ? '1' : '0'}`;
    console.log('Output:', output);
    return output;
  }, [inputs, gateConfig]);

  const handleCollectOutput = () => {
    setCollectedOutputs(prev => ({ ...prev, [gateConfig]: currentOutput }));
  };

  const handleDecimalInput = (config: GateConfig, value: string) => {
    const filtered = value.replace(/[^0-9]/g, '').slice(0, 2);
    setDecimalInputs(prev => ({ ...prev, [config]: filtered }));
  };

  const getDecodedChar = (config: GateConfig): string => {
    const binary = collectedOutputs[config];
    const inputDecimal = decimalInputs[config];
    
    console.log(`Config ${config}: binary=${binary}, inputDecimal=${inputDecimal}`);
    
    if (!binary || !inputDecimal) return '';
    
    const correctDecimal = binaryToDecimal(binary);
    console.log(`Config ${config}: correctDecimal=${correctDecimal}, inputDecimal=${inputDecimal}, match=${parseInt(inputDecimal) === correctDecimal}`);
    
    if (parseInt(inputDecimal) === correctDecimal) {
      const char = decimalToChar(correctDecimal);
      console.log(`Config ${config}: decoded char=${char}`);
      return char;
    }
    return '';
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
              text=">> SYSTEM BOOT INTERRUPTED. Convert decimal to binary, feed to gates, trace outputs, convert binary to decimal, then decode ASCII to unlock..."
              speed={20}
              onComplete={() => setTimeout(() => setShowIntro(false), 2000)}
            />
          </div>
        )}

        {!showIntro && (
          <div className="mb-6 text-sm text-secondary/80">
            {'>> SYSTEM BOOT INTERRUPTED. Convert decimal to binary, feed to gates, trace outputs, convert binary to decimal, then decode ASCII to unlock...'}
          </div>
        )}

        {/* Decimal Number Display */}
        <div className="border border-border bg-card p-6 mb-6 box-glow-green">
          <div className="text-xs text-muted-foreground mb-2">STEP 1: DECIMAL_INPUT:</div>
          <div className="font-mono text-4xl text-secondary text-glow-green text-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {DECIMAL_NUMBER}
            </motion.span>
          </div>
          <div className="text-xs text-muted-foreground mt-3 text-center">
            Convert to 6-bit binary and input to gates A-F
          </div>
        </div>

        {/* Logic Circuit */}
        <div className="mb-6">
          <div className="text-xs text-muted-foreground mb-2">STEP 2: FEED BINARY TO GATES:</div>
          <LogicCircuit inputs={inputs} onToggleInput={handleToggleInput} gateConfig={gateConfig} />
        </div>

        {/* Gate Configuration Selector */}
        <div className="border border-border bg-card p-6 mb-6 box-glow-green">
          <div className="text-xs text-muted-foreground mb-3">SELECT GATE CONFIGURATION:</div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {(['A', 'B', 'C'] as GateConfig[]).map((config) => (
              <button
                key={config}
                onClick={() => setGateConfig(config)}
                className={`py-3 border font-mono font-bold transition-colors ${
                  gateConfig === config
                    ? 'border-secondary bg-secondary/20 text-secondary'
                    : 'border-border text-muted-foreground hover:border-secondary/50'
                }`}
              >
                CONFIG {config}
                {collectedOutputs[config] && <span className="ml-2">✓</span>}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Each configuration uses different gate combinations. Run all 3 to collect outputs.
          </div>
        </div>

        {/* Output Analysis */}
        <div className="border border-border bg-card p-6 mb-6 box-glow-green" key={`output-${gateConfig}`}>
          <div className="text-xs text-muted-foreground mb-3">STEP 3: TRACE OUTPUT (4-bit binary) - CONFIG {gateConfig}:</div>
          <div className="font-mono text-3xl text-secondary text-glow-green text-center tracking-[0.5em] mb-4">
            {currentOutput}
          </div>
          <div className="text-xs text-muted-foreground text-center mb-1">
            Convert this binary to decimal manually
          </div>
          <div className="text-xs text-secondary/50 text-center mb-3">
            Debug: {currentOutput} = {binaryToDecimal(currentOutput)}
          </div>
          <motion.button
            onClick={handleCollectOutput}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 border border-secondary bg-secondary/10 text-secondary font-mono hover:bg-secondary/20 transition-colors"
          >
            {collectedOutputs[gateConfig] ? '✓ OUTPUT COLLECTED' : 'COLLECT OUTPUT'}
          </motion.button>
        </div>

        {/* Collected Outputs Display with Decimal Input */}
        {Object.keys(collectedOutputs).length > 0 && (
          <div className="border border-border bg-card p-6 mb-6 box-glow-green">
            <div className="text-xs text-muted-foreground mb-4 font-bold">STEP 4: CONVERT BINARY TO DECIMAL</div>
            <div className="grid grid-cols-3 gap-4">
              {(['A', 'B', 'C'] as GateConfig[]).map((config) => (
                <div key={config} className="border border-secondary/30 p-4">
                  <div className="text-xs text-muted-foreground mb-2 text-center">CONFIG {config}</div>
                  {collectedOutputs[config] ? (
                    <>
                      <div className="text-secondary font-mono text-lg text-center mb-3">
                        {collectedOutputs[config]}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2 text-center">Enter Decimal:</div>
                      <input
                        type="text"
                        value={decimalInputs[config] || ''}
                        onChange={(e) => handleDecimalInput(config, e.target.value)}
                        className="input-cyber w-full text-xl text-center text-secondary mb-2"
                        placeholder="?"
                        maxLength={2}
                      />
                      {getDecodedChar(config) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-center mt-2"
                        >
                          <div className="text-xs text-muted-foreground">Decoded:</div>
                          <div className="text-secondary font-mono text-3xl font-bold">
                            {getDecodedChar(config)}
                          </div>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="text-muted-foreground text-center">---</div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-3 text-center">
              Convert each binary to decimal. When correct, the character will appear.
            </div>
          </div>
        )}

        {/* Answer Input */}
        <div className="border border-border bg-card p-6 box-glow-green">
          <label className="text-xs text-muted-foreground mb-2 block">STEP 5: ENTER 3-CHARACTER CODE:</label>
          <div className="flex gap-3">
            <motion.input
              value={answer}
              onChange={e => setAnswer(e.target.value.toUpperCase())}
              className="input-cyber flex-1 text-3xl tracking-[0.5em] text-center text-secondary"
              placeholder="???"
              maxLength={3}
              animate={feedback === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.3 }}
            />
            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-3 font-mono font-bold transition-colors ${
                feedback === 'correct' ? 'bg-secondary text-secondary-foreground' :
                feedback === 'wrong' ? 'bg-destructive text-destructive-foreground' :
                'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {feedback === 'correct' ? '✓ UNLOCKED' : 'UNLOCK'}
            </motion.button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Decode all 3 outputs using the ASCII table (Config A → Config B → Config C)
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
