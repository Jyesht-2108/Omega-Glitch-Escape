import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import GlitchText from '@/components/GlitchText';
import Typewriter from '@/components/Typewriter';
import { Database, ArrowRight } from 'lucide-react';

const Level3Complete = () => {
  const navigate = useNavigate();
  const { submitAnswer } = useGame();

  useEffect(() => {
    // Submit the final Level 3 answer when page loads (only once)
    const submitLevel3Answer = async () => {
      try {
        const result = await submitAnswer('3', 'HALT');
        console.log('Level 3 answer submitted:', result);
      } catch (error) {
        console.error('Failed to submit Level 3 answer:', error);
        // If submission fails, just show the page anyway
      }
    };
    submitLevel3Answer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-background p-4"
    >
      <div className="max-w-lg text-center border border-secondary bg-card p-8 box-glow-green">
        <Database className="w-16 h-16 text-secondary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">
          <GlitchText text="DATA MAZE COMPLETED" className="text-secondary text-glow-green" />
        </h1>
        <div className="text-sm text-muted-foreground mb-6">
          <Typewriter text=">> ANOMALY IDENTIFIED. OMEGA's corrupted dataset breached. Override Fragment Gamma acquired: HALT" speed={25} />
        </div>
        <div className="text-xs text-muted-foreground animate-flicker mb-6">
          ▸ CORE SYSTEMS ACCESSIBLE ◂
        </div>
        
        <motion.button
          onClick={() => navigate('/level/4')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-destructive text-destructive-foreground font-mono font-bold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
        >
          ACCESS CORE TERMINAL
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Level3Complete;