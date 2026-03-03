import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

const Typewriter = ({ text, speed = 30, className = '', onComplete }: TypewriterProps) => {
  const [displayed, setDisplayed] = useState('');
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setDisplayed('');
    setIdx(0);
  }, [text]);

  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplayed(prev => prev + text[idx]);
        setIdx(prev => prev + 1);
      }, speed);
      return () => clearTimeout(t);
    } else if (onComplete) {
      onComplete();
    }
  }, [idx, text, speed, onComplete]);

  return (
    <motion.span className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {displayed}
      {idx < text.length && <span className="animate-pulse-glow text-foreground">▌</span>}
    </motion.span>
  );
};

export default Typewriter;
