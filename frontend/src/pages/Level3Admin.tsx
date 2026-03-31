import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import GlitchText from '@/components/GlitchText';
import Typewriter from '@/components/Typewriter';
import { ShieldAlert, ArrowRight } from 'lucide-react';

const Level3Admin = () => {
  const navigate = useNavigate();
  const { submitAnswer, currentLevel } = useGame();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Submit the base64 answer when page loads (only once)
    const submitBase64Answer = async () => {
      try {
        // Submit "TEM" as the answer for level "2" to complete the level
        const result = await submitAnswer('2', 'TEM');
        console.log('Level 2 completed:', result);
        setSubmitted(true);
      } catch (error) {
        console.error('Failed to complete level 2:', error);
        // If submission fails (e.g., team disqualified), still allow navigation
        setSubmitted(true);
      }
    };
    submitBase64Answer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  const handleProceed = () => {
    // Small delay to ensure state has updated from submission
    setTimeout(() => {
      navigate('/level/3');
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-background p-4"
    >
      <div className="max-w-lg text-center border border-destructive bg-card p-8 box-glow-red">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">
          <GlitchText text="ADMIN PANEL ACCESSED" className="text-destructive text-glow-red" />
        </h1>
        <div className="text-sm text-muted-foreground mb-6">
          <Typewriter text=">> CONGRATULATIONS. You decoded the Base64 string and found the hidden route. Override Fragment Beta acquired: TEM" speed={25} />
        </div>
        <div className="text-xs text-muted-foreground animate-flicker mb-6">
          ▸ THIS ACCESS HAS BEEN LOGGED ◂
        </div>

        <motion.button
          onClick={handleProceed}
          disabled={!submitted}
          whileHover={{ scale: submitted ? 1.05 : 1 }}
          whileTap={{ scale: submitted ? 0.95 : 1 }}
          className={`px-6 py-3 bg-secondary text-secondary-foreground font-mono font-bold transition-opacity flex items-center gap-2 mx-auto ${submitted ? 'hover:opacity-90 cursor-pointer' : 'opacity-50 cursor-not-allowed'
            }`}
        >
          {submitted ? 'PROCEED TO LEVEL 3' : 'PROCESSING...'}
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        {submitted && currentLevel < 3 && (
          <p className="text-xs text-destructive mt-2">Waiting for level update...</p>
        )}
      </div>
    </motion.div>
  );
};

export default Level3Admin;
