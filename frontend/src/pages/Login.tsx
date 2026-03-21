import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { authService } from '@/services/authService';
import Typewriter from '@/components/Typewriter';
import GlitchText from '@/components/GlitchText';
import { Terminal, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isLoggedIn, currentLevel, gameCompleted } = useGame();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      if (gameCompleted) {
        navigate('/victory');
      } else {
        navigate(`/level/${currentLevel}`);
      }
    }
  }, [isLoggedIn, currentLevel, gameCompleted, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!teamName.trim() || !password.trim()) {
      setError('Please enter both team name and password');
      return;
    }

    setLoading(true);

    try {
      // Call real API
      const response = await authService.login(teamName, password);
      
      // Update game context with login response
      await login(teamName, password, response);
      
      // Check if game is completed
      if (response.team.completed_at) {
        navigate('/victory');
      } else {
        // Navigate to current level
        navigate(`/level/${response.team.current_level}`);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
        className="w-full max-w-md border border-border bg-card p-8 box-glow-cyan"
      >
        <div className="flex items-center gap-2 mb-2 text-primary">
          <Terminal className="w-5 h-5" />
          <span className="text-xs text-muted-foreground">OMEGA_TERMINAL v4.2.1</span>
        </div>

        <div className="border-b border-border mb-6 pb-4">
          <h1 className="text-2xl font-bold text-glow-cyan mb-2">
            <GlitchText text="PROJECT OMEGA" className="text-primary" />
          </h1>
          <div className="text-sm text-muted-foreground">
            <Typewriter text=">> INITIALIZING SECURE CONNECTION... AUTHENTICATION REQUIRED" speed={20} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">TEAM_IDENTIFIER:</label>
            <input
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              className="input-cyber w-full"
              placeholder="ENTER_TEAM_NAME"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">ACCESS_KEY:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-cyber w-full"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive text-destructive text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}
          
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-3 bg-primary text-primary-foreground font-mono font-bold tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
          </motion.button>
        </form>

        <div className="mt-6 text-xs text-muted-foreground text-center animate-flicker">
          ▸ UNAUTHORIZED ACCESS WILL BE PROSECUTED ◂
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
