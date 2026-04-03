import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import Typewriter from '@/components/Typewriter';
import { Code, FileCode, Terminal as TerminalIcon, AlertCircle, Server, Send } from 'lucide-react';

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

// Large nested JSON response
const generateAPIResponse = (apiKey: string) => {
  if (apiKey.toUpperCase() !== 'BYPAS') {
    return {
      error: 'Unauthorized',
      message: 'Invalid API key',
      code: 401
    };
  }

  return {
    status: 'authenticated',
    timestamp: '2026-04-03T10:30:00Z',
    request_id: 'req_7f8a9b2c3d4e5f6g',
    system: {
      version: '2.4.1',
      build: 'omega-core-2024',
      environment: 'production',
      modules: [
        { name: 'firewall', status: 'active', version: '3.2.1' },
        { name: 'ids', status: 'active', version: '2.1.0' },
        { name: 'encryption', status: 'active', version: '4.0.2' },
        { name: 'auth', status: 'active', version: '1.8.3' }
      ],
      network: {
        interfaces: [
          { name: 'eth0', ip: '10.0.1.100', status: 'up' },
          { name: 'eth1', ip: '10.0.2.100', status: 'up' }
        ],
        routes: [
          { destination: '0.0.0.0/0', gateway: '10.0.1.1' },
          { destination: '10.0.0.0/8', gateway: '10.0.1.1' }
        ],
        dns_servers: ['8.8.8.8', '8.8.4.4']
      },
      storage: {
        total: '500GB',
        used: '342GB',
        available: '158GB',
        partitions: [
          { mount: '/', size: '100GB', used: '45GB' },
          { mount: '/data', size: '400GB', used: '297GB' }
        ]
      },
      security: {
        encryption: 'AES-256',
        protocols: ['TLS1.3', 'SSH2', 'HTTPS'],
        firewall_rules: 127,
        blocked_ips: 1543,
        admin_access: {
          enabled: true,
          password: 'N0D3',
          level: 5,
          permissions: ['read', 'write', 'execute', 'admin'],
          last_login: '2026-04-02T15:22:10Z',
          session_timeout: 3600
        },
        audit_logs: {
          enabled: true,
          retention_days: 90,
          total_entries: 45231
        }
      },
      monitoring: {
        cpu_usage: '45%',
        memory_usage: '62%',
        disk_io: 'normal',
        network_traffic: 'moderate',
        alerts: []
      },
      services: [
        { name: 'nginx', status: 'running', port: 80 },
        { name: 'postgresql', status: 'running', port: 5432 },
        { name: 'redis', status: 'running', port: 6379 }
      ]
    },
    metadata: {
      api_version: 'v2',
      rate_limit: { limit: 1000, remaining: 999, reset: 1680523800 },
      documentation: 'https://omega.sys/api/docs'
    }
  };
};

const Level2 = () => {
  const [pythonAnswer, setPythonAnswer] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiPassword, setApiPassword] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const { submitAnswer, level2Stage, setLevel2Stage, startTimer } = useGame();

  useEffect(() => {
    startTimer();
    // Only reset to python stage on initial mount if no stage is set
    if (!level2Stage) {
      setLevel2Stage('python');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTimer]); // Removed level2Stage from dependencies to prevent reset loop

  const handlePythonSubmit = async () => {
    try {
      const result = await submitAnswer('2-python', pythonAnswer);
      if (result.correct) {
        setFeedback('correct');
        setTimeout(() => {
          setLevel2Stage('api');
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

  const handleAPIExecute = () => {
    const response = generateAPIResponse(apiKey);
    setApiResponse(response);
  };

  const handleAPISubmit = async () => {
    try {
      const result = await submitAnswer('2-api', apiPassword);
      if (result.correct) {
        setFeedback('correct');
        setTimeout(() => {
          setLevel2Stage('base64');
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
            text=">> AUTOMATED DEFENSE SCRIPTS DETECTED. OMEGA has corrupted the bypass script. Debug the code, discover the API, and decode the path..."
            speed={20}
          />
        </div>

        {/* Sub-Puzzle 1: Python Debugging */}
        {(level2Stage === 'python' || !level2Stage) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <FileCode className="w-4 h-4 text-secondary" />
              <h3 className="text-lg font-bold text-secondary text-glow-green">SUB-PUZZLE 1: PYTHON SCRIPT DEBUG</h3>
            </div>

            {/* Mock IDE */}
            <div className="border border-border bg-card overflow-hidden box-glow-cyan">
              <div className="flex border-b border-border bg-muted/30">
                <div className="px-4 py-2 text-xs font-mono flex items-center gap-1 bg-card text-primary border-r border-border">
                  <FileCode className="w-3 h-3" />
                  bypass_generator.py
                </div>
                <div className="px-4 py-2 text-xs font-mono text-muted-foreground">
                  READ ONLY - DEBUG MODE
                </div>
              </div>

              <div className="p-4 overflow-x-auto bg-card/50">
                <pre className="text-sm leading-6 font-mono">
                  {lines.map((line, i) => (
                    <div key={i} className="flex hover:bg-muted/20">
                      <span className="w-8 text-right pr-3 text-muted-foreground/50 select-none text-xs">{i + 1}</span>
                      <code className={`${line.includes('BUG') ? 'text-destructive font-bold' :
                        line.includes('#') && !line.includes('BUG') ? 'text-muted-foreground italic' :
                          line.includes('def ') ? 'text-primary font-bold' :
                            line.includes('return') || line.includes('for') || line.includes('print') ? 'text-accent' :
                              line.includes('"') || line.includes("'") ? 'text-secondary' :
                                'text-foreground/80'
                        }`}>
                        {line}
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
                  <div className="font-bold mb-1">DEBUGGING CHALLENGE:</div>
                  <div className="text-xs">Trace through the code manually to find what it ACTUALLY outputs</div>
                </div>
              </div>
            </div>

            <div className="border border-border bg-card p-4 box-glow-cyan">
              <div className="flex items-center gap-2 mb-3">
                <TerminalIcon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">TERMINAL OUTPUT:</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-mono">$</span>
                <motion.input
                  value={pythonAnswer}
                  onChange={e => setPythonAnswer(e.target.value.toUpperCase())}
                  className="input-cyber flex-1 font-mono text-lg"
                  placeholder="What does the buggy code print?"
                  onKeyDown={e => e.key === 'Enter' && handlePythonSubmit()}
                  animate={feedback === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
                />
                <motion.button
                  onClick={handlePythonSubmit}
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
          </motion.div>
        )}

        {/* Sub-Puzzle 2: API Discovery */}
        {level2Stage === 'api' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-secondary" />
              <h3 className="text-lg font-bold text-secondary text-glow-green">SUB-PUZZLE 2: API ENDPOINT DISCOVERY</h3>
            </div>

            <div className="text-sm text-secondary/80 mb-4">
              ✓ SCRIPT DEBUGGED. API endpoint discovered...
            </div>

            <div className="border border-accent/50 bg-accent/10 p-4 mb-4 box-glow-red">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-accent mt-0.5" />
                <div className="text-sm text-accent/90">
                  <div className="font-bold mb-1">CHALLENGE:</div>
                  <div className="text-xs">Execute the request to get the JSON response. Find the hidden password in the nested structure.</div>
                </div>
              </div>
            </div>

            {/* API Request Interface */}
            <div className="border border-border bg-card p-4 box-glow-cyan">
              <div className="text-xs text-muted-foreground mb-3">API REQUEST:</div>
              <div className="bg-muted/20 p-3 rounded font-mono text-xs mb-4">
                <div className="text-accent">curl -X POST https://omega.sys/api/auth \</div>
                <div className="text-primary ml-4 flex items-center gap-1">
                  -H "X-API-Key:
                  <input
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="bg-muted border border-secondary text-secondary px-2 py-0.5 mx-1 font-mono text-xs w-32 focus:outline-none focus:ring-1 focus:ring-secondary"
                    placeholder="YOUR_KEY"
                    onKeyDown={e => e.key === 'Enter' && handleAPIExecute()}
                  />
                  " \
                </div>
                <div className="text-primary ml-4">-H "Content-Type: application/json"</div>
              </div>

              <div className="flex justify-end">
                <motion.button
                  onClick={handleAPIExecute}
                  disabled={!apiKey}
                  whileHover={{ scale: apiKey ? 1.05 : 1 }}
                  whileTap={{ scale: apiKey ? 0.95 : 1 }}
                  className={`px-6 py-2 font-mono font-bold flex items-center gap-2 transition-colors ${apiKey
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                    }`}
                >
                  <Send className="w-4 h-4" />
                  EXECUTE REQUEST
                </motion.button>
              </div>

              {/* API Response */}
              {apiResponse && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-border pt-4 mt-4"
                >
                  <div className="text-xs text-muted-foreground mb-2">
                    RESPONSE {apiResponse.error ? '(401 Unauthorized)' : '(200 OK)'}:
                  </div>
                  <div className="bg-muted/30 p-4 rounded max-h-96 overflow-y-auto">
                    <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Password Input */}
            {apiResponse && !apiResponse.error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-border bg-card p-4 box-glow-cyan"
              >
                <label className="text-xs text-muted-foreground mb-2 block">ENTER ADMIN PASSWORD FROM JSON:</label>
                <div className="flex gap-3">
                  <motion.input
                    value={apiPassword}
                    onChange={e => setApiPassword(e.target.value.toUpperCase())}
                    className="input-cyber flex-1 font-mono text-lg"
                    placeholder="Find it in the response..."
                    onKeyDown={e => e.key === 'Enter' && handleAPISubmit()}
                    animate={feedback === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
                  />
                  <motion.button
                    onClick={handleAPISubmit}
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
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Sub-Puzzle 3: Base64 Decode */}
        {level2Stage === 'base64' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-secondary" />
              <h3 className="text-lg font-bold text-secondary text-glow-green">SUB-PUZZLE 3: BASE64 DECODE</h3>
            </div>

            <div className="text-sm text-secondary/80 mb-4">
              ✓ API ACCESS GRANTED. Final node discovered...
            </div>

            <div className="border border-secondary bg-secondary/10 p-6 box-glow-green">
              <div className="text-secondary font-bold mb-3 text-glow-green">
                ✓ ADMIN PASSWORD VERIFIED
              </div>
              <div className="text-sm text-secondary/90 mb-4">
                {'>> SYSTEM MESSAGE: NEXT NODE LOCATED AT → '}
                <span className="font-mono text-lg text-secondary font-bold">bGV2ZWwzLWFkbWlu</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-2">
                <div>This appears to be Base64 encoding. Without internet access, you'll need to decode it manually.</div>
                <div className="text-accent">💡 Need help? Use the REQUEST OVERRIDE HINT button in the header.</div>
                <div>Once decoded, navigate to that path by typing it in the URL bar.</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Animation */}
        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="text-4xl font-bold text-secondary text-glow-green">
                {level2Stage === 'python' && 'SCRIPT DEBUGGED'}
                {level2Stage === 'api' && 'API ACCESSED'}
                {level2Stage === 'base64' && 'NODE DISCOVERED'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Level2;
