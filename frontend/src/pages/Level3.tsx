import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import Typewriter from '@/components/Typewriter';
import { Database, ChevronDown, ChevronUp, Search } from 'lucide-react';

// Generate 500 rows of mock data with one anomalous entry
const generateData = () => {
  const data = [];
  const anomalyRow = Math.floor(Math.random() * 400) + 50;
  for (let i = 0; i < 500; i++) {
    data.push({
      id: `ML-${String(i + 1).padStart(4, '0')}`,
      model: ['ResNet-50', 'GPT-4o', 'BERT-base', 'YOLO-v8', 'LLaMA-3'][Math.floor(Math.random() * 5)],
      accuracy: (0.85 + Math.random() * 0.14).toFixed(4),
      confidence: i === anomalyRow ? '1.4700' : (Math.random() * 0.98 + 0.01).toFixed(4),
      status: i === anomalyRow ? 'POISONED' : ['CLEAN', 'CLEAN', 'CLEAN', 'FLAGGED'][Math.floor(Math.random() * 4)],
      timestamp: `2026-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    });
  }
  return data;
};

// Memory Stack
const MemoryStack = () => {
  const [stack, setStack] = useState<number[]>([42, 17, 88, 3, 65]);
  const [animating, setAnimating] = useState('');

  const push = () => {
    const val = Math.floor(Math.random() * 100);
    setAnimating('push');
    setStack(prev => [...prev, val]);
    setTimeout(() => setAnimating(''), 500);
  };

  const pop = () => {
    if (stack.length > 0) {
      setAnimating('pop');
      setTimeout(() => {
        setStack(prev => prev.slice(0, -1));
        setAnimating('');
      }, 500);
    }
  };

  return (
    <div className="border border-border bg-card p-4 box-glow-cyan">
      <h3 className="text-xs text-muted-foreground mb-3">MEMORY_STACK [LIFO]</h3>
      <div className="flex flex-col-reverse gap-1 mb-3 max-h-48 overflow-y-auto">
        {stack.map((val, i) => (
          <motion.div
            key={`${i}-${val}`}
            initial={i === stack.length - 1 && animating === 'push' ? { x: -50, opacity: 0 } : {}}
            animate={{ x: 0, opacity: 1 }}
            exit={animating === 'pop' && i === stack.length - 1 ? { x: 50, opacity: 0 } : {}}
            className={`px-3 py-1 text-sm font-mono border text-center ${
              i === stack.length - 1 ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground'
            }`}
          >
            0x{val.toString(16).padStart(2, '0').toUpperCase()} ({val})
          </motion.div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={push} className="flex-1 px-3 py-1 text-xs border border-secondary text-secondary hover:bg-secondary/10 font-mono flex items-center justify-center gap-1">
          <ChevronUp className="w-3 h-3" /> PUSH
        </button>
        <button onClick={pop} className="flex-1 px-3 py-1 text-xs border border-destructive text-destructive hover:bg-destructive/10 font-mono flex items-center justify-center gap-1">
          <ChevronDown className="w-3 h-3" /> POP
        </button>
      </div>
    </div>
  );
};

const Level3 = () => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [search, setSearch] = useState('');
  const data = useMemo(generateData, []);
  const { submitAnswer, addScore, setCurrentLevel } = useGame();
  const navigate = useNavigate();

  useEffect(() => { setCurrentLevel(3); }, [setCurrentLevel]);

  const filtered = search ? data.filter(r =>
    r.id.includes(search) || r.model.includes(search) || r.status.includes(search.toUpperCase()) || r.confidence.includes(search)
  ) : data;

  const handleSubmit = () => {
    if (submitAnswer(3, answer)) {
      setFeedback('correct');
      addScore(200);
      setTimeout(() => navigate('/level/4'), 1500);
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-primary text-glow-cyan">LEVEL 3: THE DATA MAZE</h2>
        </div>

        <div className="text-sm text-primary/70 mb-6">
          <Typewriter text=">> ML DATASET COMPROMISED. Search 500 records to find the poisoned data point. What is the anomalous confidence score?" speed={20} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <MemoryStack />
          </div>

          <div className="lg:col-span-3 border border-border bg-card box-glow-cyan overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-border flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-cyber flex-1 text-xs py-1"
                placeholder="Search records..."
              />
              <span className="text-xs text-muted-foreground">{filtered.length} records</span>
            </div>

            {/* Table */}
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full text-xs font-mono">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    {['ID', 'MODEL', 'ACCURACY', 'CONFIDENCE', 'STATUS', 'TIMESTAMP'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-muted-foreground font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => {
                    const isAnomaly = parseFloat(row.confidence) > 1.0;
                    return (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i * 0.005, 0.5) }}
                        className={`border-b border-border/30 transition-colors cursor-pointer ${
                          isAnomaly ? 'bg-destructive/10 hover:bg-destructive/20' : 'hover:bg-muted/50'
                        }`}
                      >
                        <td className="px-3 py-1.5 text-muted-foreground">{row.id}</td>
                        <td className="px-3 py-1.5 text-primary">{row.model}</td>
                        <td className="px-3 py-1.5">{row.accuracy}</td>
                        <td className={`px-3 py-1.5 font-bold ${isAnomaly ? 'text-destructive text-glow-red' : 'text-secondary'}`}>
                          {row.confidence}
                        </td>
                        <td className={`px-3 py-1.5 ${row.status === 'POISONED' ? 'text-destructive' : row.status === 'FLAGGED' ? 'text-accent' : 'text-secondary'}`}>
                          {row.status}
                        </td>
                        <td className="px-3 py-1.5 text-muted-foreground">{row.timestamp}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Answer */}
        <div className="mt-4 border border-border bg-card p-4 box-glow-cyan">
          <label className="text-xs text-muted-foreground mb-2 block">ANOMALOUS CONFIDENCE SCORE:</label>
          <div className="flex gap-3">
            <motion.input
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              className="input-cyber flex-1"
              placeholder="Enter the confidence score > 1.0..."
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              animate={feedback === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
            />
            <motion.button onClick={handleSubmit} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 font-mono font-bold transition-colors ${
                feedback === 'correct' ? 'bg-secondary text-secondary-foreground' :
                feedback === 'wrong' ? 'bg-destructive text-destructive-foreground' :
                'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              ANALYZE
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="text-4xl font-bold text-secondary text-glow-green">ANOMALY IDENTIFIED</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Level3;
