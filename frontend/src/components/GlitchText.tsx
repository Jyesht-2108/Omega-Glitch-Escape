import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText = ({ text, className = '' }: GlitchTextProps) => (
  <motion.span
    className={`relative inline-block ${className}`}
    animate={{ x: [0, -1, 2, -1, 0], y: [0, 1, -1, 0, 0] }}
    transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
  >
    <span className="relative z-10">{text}</span>
    <span className="absolute inset-0 text-neon-red opacity-50 z-0" style={{ clipPath: 'inset(20% 0 40% 0)', transform: 'translate(2px, 0)' }}>{text}</span>
    <span className="absolute inset-0 text-neon-cyan opacity-50 z-0" style={{ clipPath: 'inset(60% 0 10% 0)', transform: 'translate(-2px, 0)' }}>{text}</span>
  </motion.span>
);

export default GlitchText;
