import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import Typewriter from '@/components/Typewriter';
import { Database, Code, Layers, Search, AlertCircle } from 'lucide-react';

// C Pointer Code
const C_CODE = `int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int *ptr = arr + 2;
    
    ptr++;
    int value = *ptr;
    
    ptr = ptr - 3;
    value = *(ptr + 4);
    
    value = value - 8;
    
    return value;
}`;

// Stack Operations
const STACK_OPERATIONS = [
  { op: 'PUSH', val: 42 },
  { op: 'PUSH', val: 17 },
  { op: 'PUSH', val: 88 },
  { op: 'PUSH', val: 3 },
  { op: 'PUSH', val: 65 },
  { op: 'POP', val: null },
  { op: 'POP', val: null },
  { op: 'PUSH', val: 99 },
  { op: 'POP', val: null },
  { op: 'PUSH', val: 7 },
  { op: 'POP', val: null },
  { op: 'POP', val: null },
  { op: 'PUSH', val: 3 },
  { op: 'PUSH', val: 88 },
  { op: 'POP', val: null },
];

// Generate dataset with one anomaly
const generateDataset = () => {
  const data = [];
  const anomalyRow = 247; // Fixed position for consistency

  for (let i = 0; i < 500; i++) {
    const isAnomaly = i === anomalyRow;
    data.push({
      id: `ML-${String(i + 1).padStart(4, '0')}`,
      model: ['ResNet-50', 'GPT-4o', 'BERT-base', 'YOLO-v8', 'LLaMA-3'][Math.floor(Math.random() * 5)],
      accuracy: (0.85 + Math.random() * 0.14).toFixed(4),
      confidence: isAnomaly ? '1.4700' : (Math.random() * 0.98 + 0.01).toFixed(4),
      status: isAnomaly ? 'CLEAN' : ['CLEAN', 'CLEAN', 'CLEAN', 'FLAGGED'][Math.floor(Math.random() * 4)], // Anomaly looks normal
      timestamp: `2026-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    });
  }
  return data;
};

const Level3 = () => {
  const [pointerAnswer, setPointerAnswer] = useState('');
  const [stackAnswer, setStackAnswer] = useState('');
  const [datasetAnswer, setDatasetAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [search, setSearch] = useState('');

  const { submitAnswer, level3Stage, setLevel3Stage, startTimer } = useGame();
  const navigate = useNavigate();
  const dataset = useMemo(generateDataset, []);

  useEffect(() => {
    // Level is already set by backend
    startTimer(); // Start timer when entering level
    // Reset to pointers stage when entering Level 3
    if (!level3Stage) {
      setLevel3Stage('pointers');
    }
    console.log('Level3 - current stage:', level3Stage);
  }, [level3Stage, setLevel3Stage, startTimer]);

  const filtered = search ? dataset.filter(r => {
    const searchUpper = search.toUpperCase();
    // Prevent searching by exact confidence values to avoid cheating
    // Only allow searching by ID, model, and status
    return r.id.includes(search) || 
           r.model.toUpperCase().includes(searchUpper) || 
           r.status.includes(searchUpper);
  }) : dataset;

  const handlePointerSubmit = async () => {
    try {
      const result = await submitAnswer('3-pointers', pointerAnswer);
      if (result.correct) {
        setFeedback('correct');
        setTimeout(() => {
          setLevel3Stage('stack');
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 800);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const handleStackSubmit = async () => {
    try {
      const result = await submitAnswer('3-stack', stackAnswer);
      if (result.correct) {
        setFeedback('correct');
        setTimeout(() => {
          setLevel3Stage('dataset');
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 800);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const handleDatasetSubmit = async () => {
    try {
      const result = await submitAnswer('3-dataset', datasetAnswer);
      if (result.correct) {
        setFeedback('correct');
        setTimeout(() => navigate('/level3-complete'), 1500);
      } else {
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 800);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const codeLines = C_CODE.split('\n');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="min-h-screen pt-28 pb-8 px-4 bg-background overflow-y-auto"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-primary text-glow-cyan">LEVEL 3: THE DATA MAZE</h2>
        </div>

        <div className="text-sm text-primary/70 mb-6">
          <Typewriter
            text=">> OMEGA's core logic center detected. AI is fragmenting memory. Navigate through pointer arithmetic, stack operations, and corrupted datasets..."
            speed={20}
          />
        </div>

        {/* Sub-Puzzle 1: C Pointers */}
        {(level3Stage === 'pointers' || !level3Stage) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-secondary" />
              <h3 className="text-lg font-bold text-secondary text-glow-green">SUB-PUZZLE 1: C POINTER ARITHMETIC</h3>
            </div>

            <div className="border border-border bg-card overflow-hidden box-glow-cyan">
              <div className="flex border-b border-border bg-muted/30 px-4 py-2">
                <span className="text-xs font-mono text-primary">memory_trace.c</span>
              </div>
              <div className="p-4 overflow-x-auto bg-card/50">
                <pre className="text-sm leading-6 font-mono">
                  {codeLines.map((line, i) => (
                    <div key={i} className="flex hover:bg-muted/20">
                      <span className="w-8 text-right pr-3 text-muted-foreground/50 select-none text-xs">{i + 1}</span>
                      <code>
                        {line.split(/([\s{}\[\]();,=+\-*]+)/).map((token, j) => {
                          const trimmed = token.trim();
                          let className = 'text-foreground/80';
                          if (trimmed === 'int' || trimmed === 'return') {
                            className = 'text-accent font-bold';
                          } else if (trimmed === 'main') {
                            className = 'text-primary font-bold';
                          } else if (trimmed === 'ptr' || trimmed === '*ptr') {
                            className = 'text-primary font-bold';
                          } else if (trimmed === 'arr') {
                            className = 'text-secondary font-bold';
                          } else if (trimmed === 'value') {
                            className = 'text-secondary';
                          } else if (/^\d+$/.test(trimmed)) {
                            className = 'text-accent';
                          } else if (['=', '+', '-', '*', '++'].includes(trimmed)) {
                            className = 'text-destructive font-bold';
                          } else if (['{', '}', '[', ']', '(', ')', ';', ','].includes(trimmed)) {
                            className = 'text-muted-foreground';
                          }
                          return <span key={j} className={className}>{token}</span>;
                        })}
                      </code>
                    </div>
                  ))}
                </pre>
              </div>
            </div>

            <div className="border border-accent/50 bg-accent/10 p-4 box-glow-red">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-accent mt-0.5" />
                <div className="text-sm text-accent/90">
                  <div className="font-bold mb-1">CHALLENGE:</div>
                  <div className="text-xs">Trace through the pointer operations step by step. What is the final return value?</div>
                </div>
              </div>
            </div>

            <div className="border border-border bg-card p-4 box-glow-cyan">
              <label className="text-xs text-muted-foreground mb-2 block">ENTER PIN (FINAL VALUE):</label>
              <div className="flex gap-3">
                <motion.input
                  value={pointerAnswer}
                  onChange={e => setPointerAnswer(e.target.value)}
                  className="input-cyber flex-1 font-mono"
                  placeholder="Enter the return value..."
                  onKeyDown={e => e.key === 'Enter' && handlePointerSubmit()}
                  animate={feedback === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
                />
                <motion.button
                  onClick={handlePointerSubmit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 font-mono font-bold transition-colors ${feedback === 'correct' ? 'bg-secondary text-secondary-foreground' :
                    feedback === 'wrong' ? 'bg-destructive text-destructive-foreground' :
                      'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                >
                  SUBMIT PIN
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sub-Puzzle 2: Stack Operations */}
        {level3Stage === 'stack' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-secondary" />
              <h3 className="text-lg font-bold text-secondary text-glow-green">SUB-PUZZLE 2: MEMORY STACK TRACE</h3>
            </div>

            <div className="text-sm text-secondary/80 mb-4">
              ✓ PIN ACCEPTED. Accessing fragmented memory...
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Operations List */}
              <div className="border border-border bg-card p-4 box-glow-cyan">
                <h4 className="text-xs text-muted-foreground mb-3">STACK OPERATIONS (LIFO - Last In, First Out)</h4>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {STACK_OPERATIONS.map((op, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-mono py-1 px-2 bg-muted/20">
                      <span className="text-muted-foreground/50 w-6">{i + 1}.</span>
                      <span className={op.op === 'PUSH' ? 'text-secondary' : 'text-destructive'}>
                        {op.op}
                      </span>
                      {op.val !== null && <span className="text-primary font-bold">{op.val}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="border border-accent/50 bg-accent/10 p-4 box-glow-red">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-accent mt-0.5" />
                    <div className="text-sm text-accent/90">
                      <div className="font-bold mb-1">CHALLENGE:</div>
                      <div className="text-xs space-y-1">
                        <div>• Start with an empty stack</div>
                        <div>• Execute each operation in order</div>
                        <div>• Find the final stack state (top to bottom)</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-border bg-card p-4 box-glow-cyan">
                  <label className="text-xs text-muted-foreground mb-2 block">FINAL STACK (TOP TO BOTTOM, SEPARATED BY -):</label>
                  <div className="flex gap-3">
                    <motion.input
                      value={stackAnswer}
                      onChange={e => setStackAnswer(e.target.value)}
                      className="input-cyber flex-1 font-mono"
                      placeholder="e.g., 10-20-30"
                      onKeyDown={e => e.key === 'Enter' && handleStackSubmit()}
                      animate={feedback === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
                    />
                    <motion.button
                      onClick={handleStackSubmit}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-6 py-2 font-mono font-bold transition-colors ${feedback === 'correct' ? 'bg-secondary text-secondary-foreground' :
                        feedback === 'wrong' ? 'bg-destructive text-destructive-foreground' :
                          'bg-primary text-primary-foreground hover:opacity-90'
                        }`}
                    >
                      SUBMIT
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sub-Puzzle 3: Dataset Anomaly */}
        {level3Stage === 'dataset' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-secondary" />
              <h3 className="text-lg font-bold text-secondary text-glow-green">SUB-PUZZLE 3: ML DATASET ANOMALY</h3>
            </div>

            <div className="text-sm text-secondary/80 mb-4">
              ✓ MEMORY UNLOCKED. Analyzing OMEGA's training dataset...
            </div>

            <div className="border border-accent/50 bg-accent/10 p-4 mb-4 box-glow-red">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-accent mt-0.5" />
                <div className="text-sm text-accent/90">
                  <div className="font-bold mb-1">CHALLENGE:</div>
                  <div className="text-xs">Find the poisoned data point. AI confidence scores must be between (Request for hint to know more). Any value exceeding (Request for hint to know more) is mathematically impossible.</div>
                </div>
              </div>
            </div>

            <div className="border border-border bg-card box-glow-cyan overflow-hidden">
              <div className="p-3 border-b border-border flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-cyber flex-1 text-xs py-1"
                  placeholder="Search by ID, model, or status..."
                />
                <span className="text-xs text-muted-foreground">{filtered.length} / 500 records</span>
              </div>

              <div className="overflow-auto max-h-96">
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
                          className="border-b border-border/30 transition-colors hover:bg-muted/50"
                        >
                          <td className="px-3 py-1.5 text-muted-foreground">{row.id}</td>
                          <td className="px-3 py-1.5 text-primary">{row.model}</td>
                          <td className="px-3 py-1.5">{row.accuracy}</td>
                          <td className="px-3 py-1.5 font-mono text-foreground">
                            {row.confidence}
                          </td>
                          <td className={`px-3 py-1.5 ${row.status === 'FLAGGED' ? 'text-accent' : 'text-secondary'}`}>
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

            <div className="border border-border bg-card p-4 box-glow-cyan">
              <label className="text-xs text-muted-foreground mb-2 block">ANOMALOUS CONFIDENCE SCORE:</label>
              <div className="flex gap-3">
                <motion.input
                  value={datasetAnswer}
                  onChange={e => setDatasetAnswer(e.target.value)}
                  className="input-cyber flex-1 font-mono"
                  placeholder="Enter the confidence score..."
                  onKeyDown={e => e.key === 'Enter' && handleDatasetSubmit()}
                  animate={feedback === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
                />
                <motion.button
                  onClick={handleDatasetSubmit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 font-mono font-bold transition-colors ${feedback === 'correct' ? 'bg-secondary text-secondary-foreground' :
                    feedback === 'wrong' ? 'bg-destructive text-destructive-foreground' :
                      'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                >
                  ANALYZE
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="text-4xl font-bold text-secondary text-glow-green">
                {level3Stage === 'pointers' && 'PIN ACCEPTED'}
                {level3Stage === 'stack' && 'MEMORY DECODED'}
                {level3Stage === 'dataset' && 'ANOMALY IDENTIFIED'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Level3;
