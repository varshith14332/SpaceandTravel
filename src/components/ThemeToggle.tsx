'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative w-16 h-8 rounded-full p-1 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-400'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className={`w-6 h-6 rounded-full shadow-lg flex items-center justify-center ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
        animate={{ 
          x: isDark ? 0 : 32,
          rotate: isDark ? 0 : 180
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30 
        }}
      >
        <motion.div
          animate={{ 
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          🌙
        </motion.div>
        <motion.div
          animate={{ 
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          ☀️
        </motion.div>
      </motion.div>
      
      {/* Background stars for dark mode */}
      {isDark && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <motion.div
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{ top: '20%', left: '25%' }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{ top: '60%', right: '20%' }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
        </div>
      )}
      
      {/* Background clouds for light mode */}
      {!isDark && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <motion.div
            className="absolute w-2 h-1 bg-white/40 rounded-full"
            style={{ top: '30%', left: '15%' }}
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}
    </motion.button>
  )
}