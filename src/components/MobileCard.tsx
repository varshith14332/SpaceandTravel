'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme, getThemeClasses } from '@/contexts/ThemeContext';

interface MobileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function MobileCard({
  children,
  onClick,
  className = '',
  hover = true,
  padding = 'md',
  rounded = 'lg',
  shadow = 'md'
}: MobileCardProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const hoverEffects = hover ? 'hover:shadow-lg hover:scale-[1.02] transition-all duration-300' : '';
  const clickable = onClick ? 'cursor-pointer touch-manipulation select-none' : '';

  return (
    <motion.div
      onClick={onClick}
      className={`
        ${themeClasses.cardBackground} 
        ${themeClasses.cardBorder} 
        border
        ${paddingClasses[padding]}
        ${roundedClasses[rounded]}
        ${shadowClasses[shadow]}
        ${hoverEffects}
        ${clickable}
        ${className}
      `}
      whileHover={hover && onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}