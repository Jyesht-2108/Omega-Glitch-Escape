import { motion } from 'framer-motion';
import GlitchText from '@/components/GlitchText';
import Typewriter from '@/components/Typewriter';
import { ShieldAlert } from 'lucide-react';

const Level3Admin = () => (
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
        <Typewriter text=">> CONGRATULATIONS. You decoded the Base64 string and found the hidden route. This intel will help you in Level 4. The Vigenère key is: OMEGA" speed={25} />
      </div>
      <div className="text-xs text-muted-foreground animate-flicker">
        ▸ THIS ACCESS HAS BEEN LOGGED ◂
      </div>
    </div>
  </motion.div>
);

export default Level3Admin;
