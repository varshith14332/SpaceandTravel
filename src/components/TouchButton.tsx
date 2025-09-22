'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme, getThemeClasses } from '@/contexts/ThemeContext';

interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function TouchButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  type = 'button'
}: TouchButtonProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[48px]'
  };

  const variantClasses = {
    primary: theme === 'dark' 
      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg'
      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg',
    secondary: `${themeClasses.cardBackground} ${themeClasses.cardBorder} border-2 hover:bg-opacity-80 shadow-md`,
    ghost: theme === 'dark'
      ? 'hover:bg-white/10 text-gray-300 hover:text-white'
      : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        font-semibold rounded-lg transition-all duration-200
        touch-manipulation select-none
        active:scale-95 transform
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
}