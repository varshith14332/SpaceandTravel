'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTheme, themeStyles } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ThemeToggle'

const navItems = [
  { name: 'Home', path: '/', icon: '🏠' },
  { name: 'Missions', path: '/missions', icon: '🚀' },
  { name: 'Training', path: '/training', icon: '🎯' },
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Learning Hub', path: '/learning', icon: '📚' },
  { name: 'Solar System', path: '/solar-system', icon: '🌌' },
  { name: 'Community', path: '/community', icon: '👥' },
  { name: 'Analytics', path: '/analytics', icon: '📈' },
  { name: 'AI Chat', path: '/chat', icon: '🤖' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, isDark } = useTheme()

  return (
    <nav className={`${themeStyles.nav(theme)} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDark 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
            >
              <span className="text-white font-bold text-lg">S</span>
            </motion.div>
            <span className={`${themeStyles.heading(theme)} text-xl`}>
              SpaceMission
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <motion.div
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    pathname === item.path
                      ? isDark 
                        ? 'text-white bg-purple-600/30'
                        : 'text-slate-900 bg-indigo-100'
                      : isDark
                        ? 'text-gray-300 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                  {pathname === item.path && (
                    <motion.div
                      className={`absolute inset-0 rounded-lg ${
                        isDark 
                          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20'
                          : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20'
                      }`}
                      layoutId="activeTab"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-3 rounded-lg touch-manipulation transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
              } ${themeStyles.bodyText(theme)}`}
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <motion.div
                  className={`w-full h-0.5 ${isDark ? 'bg-white' : 'bg-slate-900'}`}
                  animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 6 : 0 }}
                />
                <motion.div
                  className={`w-full h-0.5 ${isDark ? 'bg-white' : 'bg-slate-900'}`}
                  animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                />
                <motion.div
                  className={`w-full h-0.5 ${isDark ? 'bg-white' : 'bg-slate-900'}`}
                  animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -6 : 0 }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          className="md:hidden"
          initial={false}
          animate={{ height: isMobileMenuOpen ? 'auto' : 0 }}
          style={{ overflow: 'hidden' }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <motion.div
                  className={`block px-4 py-3 rounded-md text-base font-medium touch-manipulation transition-colors ${
                    pathname === item.path
                      ? isDark 
                        ? 'text-white bg-purple-600/30'
                        : 'text-slate-900 bg-indigo-100'
                      : isDark
                        ? 'text-gray-300 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </nav>
  )
}
