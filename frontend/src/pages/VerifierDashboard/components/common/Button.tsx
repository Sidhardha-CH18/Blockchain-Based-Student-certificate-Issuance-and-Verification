import React from 'react';
export const Button = ({
  children,
  variant = 'primary',
  onClick,
  fullWidth = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200';
  const variantClasses = {
    primary: 'bg-gradient-to-r from-accent-DEFAULT to-primary-DEFAULT text-white hover:from-accent-dark bg-black hover:to-primary-dark shadow-sm hover:shadow',
    secondary: 'bg-white/70 text-gray-700 border border-white/30 hover:bg-white/80 hover:text-gray-900',
    ghost: 'bg-transparent text-accent-dark hover:bg-accent-light/50'
  };
  const widthClass = fullWidth ? 'w-full' : '';
  return <button className={`${baseClasses} ${variantClasses[variant]} ${widthClass}`} onClick={onClick} {...props}>
      {children}
    </button>;
};