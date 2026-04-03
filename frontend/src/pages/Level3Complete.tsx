import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import GlitchText from '@/components/GlitchText';
import Typewriter from '@/components/Typewriter';
import { Database, ArrowRight } from 'lucide-react';

const Level3Complete = () => {
  const navigate = useNavigate();
  const { submitAnswer } = useGame();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Submit the final Level 3 answer when page loads (only once)
    const submitLevel3Answer = async () => {
      if (isSubmitting) return; // Prevent double submission
      setIsSubmitting(true);
      
      try {
        const result = await submitAnswer('3', 'HALT');
        console.log('Level 3 answer submitted:', result);
        setSubmitted(true);
      } catch (error) {
        console.error('Failed to submit Level 3 answer:', error);
        // If submission fails, still allow navigation
        setSubmitted(true);
      }
    };
    submitLevel3Answer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  const handleProceed = () => {
    // Navigate to level 4 when button is clicked
    navigate('/level/4', { replace: true });
  };

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
          onClick={handleProceed}
          disabled={!submitted}
          whileHover={{ scale: submitted ? 1.05 : 1 }}
          whileTap={{ scale: submitted ? 0.95 : 1 }}
          className={`px-6 py-3 bg-destructive text-destructive-foreground font-mono font-bold transition-opacity flex items-center gap-2 mx-auto ${submitted ? 'hover:opacity-90 cursor-pointer' : 'opacity-50 cursor-not-allowed'
            }`}
        >
          {submitted ? 'ACCESS CORE TERMINAL' : 'PROCESSING...'}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Level3Complete;