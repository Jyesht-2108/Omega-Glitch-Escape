import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import Typewriter from '@/components/Typewriter';
import { Code, FileCode, Terminal as TerminalIcon, AlertCircle } from 'lucide-react';

// Simple Python code with an off-by-one error
const CORRUPTED_CODE = `def generate_bypass_token():
    # Generate security bypass token
    password = "BYPASS"
    token = ""
    
    # BUG: range should be range(len(password)), not range(len(password) - 1)
    for i in range(len(password) - 1):
        token += password[i]
    
    return token

result = generate_bypass_token()
print(result)
# What will this output?`;

const Level2 = () => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const { submitAnswer, addScore, setCurrentLevel, level2Stage, setLevel2Stage, startTimer } = useGame();

  useEffect(() => { 
    setCurrentLevel(2); 
    startTimer();
  }, [setCurrentLevel, startTimer]);

  const handleSubmit = () => {
    if (submitAnswer(2, answer)) {
      setFeedback('correct');
      addScore(150);
      // Move to stage 2 after solving Python puzzle
      setTimeout(() => {
        setLevel2Stage('base64');
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const lines = CORRUPTED_CODE.split('\n');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="min-h-screen pt-28 pb-8 px-4 bg-background overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-primary text-glow-cyan">LEVEL 2: THE SCRIPTING SUBNET</h2>
        </div>

        <div className="text-sm text-primary/70 mb-6">
          <Typewriter 
            text=">> AUTOMATED DEFENSE SCRIPTS DETECTED. OMEGA has corrupted the bypass script. Debug the code mentally and determine the output..." 
            speed={20} 
          />
        </div>

        {/* Mock IDE */}
        <div className="border border-border bg-card overflow-hidden box-glow-cyan mb-6">
          {/* Tab bar */}
          <div className="flex border-b border-border bg-muted/30">
            <div className="px-4 py-2 text-xs font-mono flex items-center gap-1 bg-card text-primary border-r border-border">
              <FileCode className="w-3 h-3" />
              bypass_generator.py
            </div>
            <div className="px-4 py-2 text-xs font-mono text-muted-foreground">
              READ ONLY - DEBUG MODE
            </div>
          </div>

          {/* Code area */}
          <div className="p-4 overflow-x-auto bg-card/50">
            <pre className="text-sm leading-6 font-mono">
              {lines.map((line, i) => (
                <div key={i} className="flex hover:bg-muted/20">
                  <span className="w-8 text-right pr-3 text-muted-foreground/50 select-none text-xs">{i + 1}</span>
                  <code className={`${
                    line.includes('BUG') ? 'text-destructive font-bold' :
                    line.includes('#') && !line.includes('BUG') ? 'text-muted-foreground italic' :
                    line.includes('def ') ? 'text-primary font-bold' :
                    line.includes('return') || line.includes('for') || line.includes('print') ? 'text-accent' :
                    line.includes('"') || line.includes("'") ? 'text-secondary' :
                    line.includes('codes') || line.includes('token') || line.includes('result') ? 'text-foreground' :
                    'text-foreground/80'
                  }`}>
                    {line}
                  </code>
                </div>
              ))}
            </pre>
          </div>
        </div>

        {/* Instructions */}
        <div className="border border-accent/50 bg-accent/10 p-4 mb-6 box-glow-red">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-accent mt-0.5" />
            <div className="text-sm text-accent/90">
              <div className="font-bold mb-1">DEBUGGING CHALLENGE:</div>
              <div className="text-xs space-y-1">
                <div>• The code has an off-by-one error in the loop</div>
                <div>• Trace through the code manually to find what it ACTUALLY outputs</div>
                <div>• The password is "BYPASS" but the loop doesn't process all characters</div>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal output */}
        <div className="border border-border bg-card p-4 box-glow-cyan">
          <div className="flex items-center gap-2 mb-3">
            <TerminalIcon className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">TERMINAL OUTPUT - Enter the actual output:</span>
          </div>
          <div className="flex gap-3">
            <span className="text-primary font-mono">$</span>
            <motion.input
              value={answer}
              onChange={e => setAnswer(e.target.value.toUpperCase())}
              className="input-cyber flex-1 font-mono text-lg"
              placeholder="What does the buggy code print?"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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
              SUBMIT
            </motion.button>
          </div>
        </div>

        {/* Base64 Challenge - Shows after correct answer */}
        <AnimatePresence>
          {level2Stage === 'base64' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 border border-secondary bg-secondary/10 p-6 box-glow-green"
            >
              <div className="text-secondary font-bold mb-3 text-glow-green">
                ✓ BYPASS TOKEN IDENTIFIED
              </div>
              <div className="text-sm text-secondary/90 mb-4">
                {'>> SYSTEM MESSAGE: NEXT NODE LOCATED AT → '}<span className="font-mono text-lg text-secondary font-bold">bGV2ZWwzLWFkbWlu</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-2">
                <div>This appears to be Base64 encoding. Without internet access, you'll need to decode it manually.</div>
                <div className="text-accent">💡 Need help? Use the REQUEST OVERRIDE HINT button in the header.</div>
                <div>Once decoded, navigate to that path by typing it in the URL bar.</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {feedback === 'correct' && level2Stage === 'python' && (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="text-4xl font-bold text-secondary text-glow-green">SCRIPT DEBUGGED</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Level2;
