// Button.jsx
import React from 'react';

const Button = ({
  children,
  primary = false,
  outlined = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        relative px-6 py-3 rounded-full font-medium text-base transition-all duration-300
        ${primary ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105' : ''}
        ${outlined ? 'bg-transparent border-2 border-purple-400 text-white hover:bg-purple-400/10 hover:scale-105' : ''}
        ${className}
      `}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
      {primary && (
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 hover:opacity-70 transition-opacity blur-lg" />
      )}
    </button>
  );
};

export default Button;
