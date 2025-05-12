import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  primary = false,
  className = '',
  disabled = false
}) => {
  return (
    <motion.button 
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick} 
      disabled={disabled}
      className={`relative overflow-hidden px-6 py-3 rounded-lg font-medium transition-all 
        ${primary 
          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-pink-500/20' 
          : 'border border-white-500/20 text-white hover:bg-pink-500/10 hover:border-pink-500/30'
        } 
        ${className} 
        ${disabled 
          ? primary 
            ? 'bg-pink-500/30 text-white-300/50 cursor-not-allowed' 
            : 'border-pink-500/10 text-white-300/50 cursor-not-allowed'
          : ''}
        group`}
    >
      <span className="relative z-10">{children}</span>
      {primary && (
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-400/0 via-pink-400/20 to-pink-400/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
      )}
    </motion.button>
  );
};

export default Button;