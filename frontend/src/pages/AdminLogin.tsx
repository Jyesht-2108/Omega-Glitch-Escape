import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import Typewriter from '@/components/Typewriter';
import GlitchText from '@/components/GlitchText';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team_name: username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard');
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
        className="w-full max-w-md border border-destructive bg-card p-8 box-glow-red"
      >
        <div className="flex items-center gap-2 mb-2 text-destructive">
          <Shield className="w-5 h-5" />
          <span className="text-xs text-muted-foreground">ADMIN ACCESS TERMINAL</span>
        </div>

        <div className="border-b border-destructive mb-6 pb-4">
          <h1 className="text-2xl font-bold text-glow-red mb-2">
            <GlitchText text="SYSTEM CONTROL" className="text-destructive" />
          </h1>
          <div className="text-sm text-muted-foreground">
            <Typewriter text=">> RESTRICTED ACCESS - AUTHORIZATION REQUIRED" speed={20} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">ADMIN_USERNAME:</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="input-cyber w-full"
              placeholder="ENTER_ADMIN_ID"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">ADMIN_PASSWORD:</label>
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
            className="w-full py-3 bg-destructive text-destructive-foreground font-mono font-bold tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            {loading ? 'AUTHENTICATING...' : 'ADMIN ACCESS'}
          </motion.button>
        </form>

        <div className="mt-6 text-xs text-muted-foreground text-center animate-flicker">
          ▸ UNAUTHORIZED ACCESS WILL BE LOGGED ◂
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
