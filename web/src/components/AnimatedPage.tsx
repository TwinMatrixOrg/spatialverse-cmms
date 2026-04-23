import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedPageProps {
  children: ReactNode;
  pageKey?: string;
}

export default function AnimatedPage({ children, pageKey }: AnimatedPageProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function AnimatedPanel({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.08 }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
}
