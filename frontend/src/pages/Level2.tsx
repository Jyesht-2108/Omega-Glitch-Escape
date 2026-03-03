import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import Typewriter from '@/components/Typewriter';
import { Code, FileCode, Terminal as TerminalIcon } from 'lucide-react';

const CORRUPTED_CODE = `def decrypt_omega(cipher_text, key):
    result = ""
    for i in range(len(cipher_text)):
        shift = ord(key[i % len(key)]) - ord('A')
        # BUG: Should be subtraction, not addition
        decrypted = chr((ord(cipher_text[i]) + shift) % 256)
        result = result + decrypted
    # BUG: Returns empty string instead of result
    return ""

# Hidden message (Base64): L2xldmVsMy1hZG1pbg==
# Decode the above to find the secret admin panel

key = "OMEGA"
encrypted = "FRUEHXWGI"
print(decrypt_omega(encrypted, key))
# Expected output: CORRUPTED`;

const Level2 = () => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [activeTab, setActiveTab] = useState('main.py');
  const { submitAnswer, addScore, setCurrentLevel } = useGame();
  const navigate = useNavigate();

  useEffect(() => { setCurrentLevel(2); }, [setCurrentLevel]);

  const handleSubmit = () => {
    if (submitAnswer(2, answer)) {
      setFeedback('correct');
      addScore(150);
      setTimeout(() => navigate('/level/3'), 1500);
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
      className="min-h-screen pt-20 pb-8 px-4 bg-background"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-primary text-glow-cyan">LEVEL 2: THE SCRIPTING SUBNET</h2>
        </div>

        <div className="text-sm text-primary/70 mb-6">
          <Typewriter text=">> CORRUPTED SCRIPT DETECTED. Debug the Python function. What should the output be? Also, decode the hidden Base64 string for a secret path..." speed={20} />
        </div>

        {/* Mock IDE */}
        <div className="border border-border bg-card overflow-hidden box-glow-cyan">
          {/* Tab bar */}
          <div className="flex border-b border-border bg-muted/30">
            {['main.py', 'config.json', 'README.md'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-mono flex items-center gap-1 border-r border-border transition-colors ${
                  activeTab === tab ? 'bg-card text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileCode className="w-3 h-3" />
                {tab}
              </button>
            ))}
          </div>

          {/* Code area */}
          <div className="p-4 overflow-x-auto">
            <pre className="text-sm leading-6">
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  <span className="w-8 text-right pr-3 text-muted-foreground/50 select-none text-xs">{i + 1}</span>
                  <code className={`${
                    line.includes('BUG') ? 'text-destructive' :
                    line.includes('#') ? 'text-muted-foreground' :
                    line.includes('def ') ? 'text-primary' :
                    line.includes('return') || line.includes('for') || line.includes('print') ? 'text-neon-amber' :
                    line.includes('"') || line.includes("'") ? 'text-secondary' :
                    'text-foreground'
                  }`}>
                    {line}
                  </code>
                </div>
              ))}
            </pre>
          </div>
        </div>

        {/* Terminal output */}
        <div className="mt-4 border border-border bg-card p-4 box-glow-cyan">
          <div className="flex items-center gap-2 mb-3">
            <TerminalIcon className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">TERMINAL OUTPUT</span>
          </div>
          <div className="flex gap-3">
            <span className="text-primary">$</span>
            <motion.input
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              className="input-cyber flex-1"
              placeholder="Type the correct output..."
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
              RUN
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="text-4xl font-bold text-secondary text-glow-green">SCRIPT DEBUGGED</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Level2;
