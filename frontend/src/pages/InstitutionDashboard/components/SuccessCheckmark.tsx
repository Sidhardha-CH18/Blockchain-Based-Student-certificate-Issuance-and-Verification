import React from 'react';
import { motion } from 'framer-motion';

const SuccessCheckmark = ({ onComplete }) => {
  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      onAnimationComplete={onComplete}
      className="relative w-24 h-24 mx-auto"
    >
      <motion.div 
        className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      <motion.svg 
        className="absolute inset-0 w-full h-full drop-shadow-lg"
        viewBox="0 0 24 24"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ 
          delay: 0.2,
          duration: 0.5,
          ease: 'easeInOut'
        }}
      >
        <motion.path 
          fill="none" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M20 6L9 17L4 12"
        />
      </motion.svg>

      {/* Animated glow effect */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400/30 to-purple-500/30 blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
};

export default SuccessCheckmark;