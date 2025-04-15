import { motion } from 'framer-motion';
import { ReactNode, useEffect } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: 0,
    y: 10
  },
  in: {
    opacity: 1,
    x: 0,
    y: 0
  },
  exit: {
    opacity: 0,
    x: 0,
    y: -10
  }
};

const pageTransition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smoother motion
  duration: 0.4
};

const PageTransition = ({ children }: PageTransitionProps) => {
  // This effect prevents scrollbar-related layout shifts during transition
  useEffect(() => {
    // Get the initial overflow state
    const originalOverflow = document.body.style.overflow;
    const hasScrollbar = window.innerWidth > document.documentElement.clientWidth;
    
    // If there's a scrollbar, add padding to prevent layout shift
    if (hasScrollbar) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    // Cleanup function to restore original state
    return () => {
      document.body.style.paddingRight = '';
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      style={{ width: '100%', overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
