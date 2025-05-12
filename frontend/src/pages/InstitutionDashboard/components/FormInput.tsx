import React from 'react';
import { motion } from 'framer-motion';

const FormInput = ({
  label,
  name,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-pink-300/60 mb-1">
        {label}
      </label>
      <div className="relative">
        <motion.input
          whileFocus={{
            boxShadow: '0 0 0 2px rgba(236, 72, 153, 0.3)'
          }}
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-pink-500/10 backdrop-blur-sm border border-pink-500/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all placeholder-pink-300/50 text-pink-300"
        />
        <div className="absolute inset-0 rounded-lg pointer-events-none bg-gradient-to-r from-transparent via-pink-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
      </div>
    </div>
  );
};

export default FormInput;