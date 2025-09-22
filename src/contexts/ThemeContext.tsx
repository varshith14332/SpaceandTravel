'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
  isLight: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('space-mission-theme') as Theme
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setTheme(savedTheme)
    }
  }, [])

  // Update localStorage and document class when theme changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('space-mission-theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
      
      // Update body classes for global styling
      if (theme === 'dark') {
        document.body.classList.remove('light-theme')
        document.body.classList.add('dark-theme')
      } else {
        document.body.classList.remove('dark-theme')
        document.body.classList.add('light-theme')
      }
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  }

  // Prevent flash of unstyled content
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Theme-aware CSS classes utility
export const getThemeClasses = (theme: Theme) => {
  if (theme === 'dark') {
    return {
      // Dark space theme (current default)
      background: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800',
      cardBackground: 'bg-black/30 backdrop-blur-sm',
      cardBorder: 'border-purple-500/30',
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        accent: 'text-purple-400',
        muted: 'text-gray-400'
      },
      button: {
        primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white',
        secondary: 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200',
        ghost: 'hover:bg-white/10 text-gray-300 hover:text-white'
      },
      nav: 'bg-black/20 backdrop-blur-md border-purple-500/20',
      input: 'bg-black/50 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-500'
    }
  } else {
    return {
      // Light space theme
      background: 'bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100',
      cardBackground: 'bg-white/80 backdrop-blur-sm',
      cardBorder: 'border-indigo-200',
      text: {
        primary: 'text-slate-900',
        secondary: 'text-slate-700',
        accent: 'text-indigo-600',
        muted: 'text-slate-500'
      },
      button: {
        primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white',
        secondary: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800',
        ghost: 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
      },
      nav: 'bg-white/80 backdrop-blur-md border-indigo-200',
      input: 'bg-white/70 border-indigo-200 text-slate-900 placeholder-slate-500 focus:border-indigo-500'
    }
  }
}

// Pre-built theme-aware component classes
export const themeStyles = {
  // Card components
  card: (theme: Theme) => {
    const classes = getThemeClasses(theme)
    return `${classes.cardBackground} ${classes.cardBorder} border rounded-lg shadow-lg`
  },
  
  // Button variants
  primaryButton: (theme: Theme) => {
    const classes = getThemeClasses(theme)
    return `${classes.button.primary} px-6 py-2 rounded-lg transition-all duration-200 font-medium`
  },
  
  secondaryButton: (theme: Theme) => {
    const classes = getThemeClasses(theme)
    return `${classes.button.secondary} px-4 py-2 rounded-lg transition-all duration-200`
  },
  
  // Input fields
  input: (theme: Theme) => {
    const classes = getThemeClasses(theme)
    return `${classes.input} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2`
  },
  
  // Navigation
  nav: (theme: Theme) => {
    const classes = getThemeClasses(theme)
    return `${classes.nav} border-b`
  },
  
  // Page backgrounds
  pageBackground: (theme: Theme) => {
    const classes = getThemeClasses(theme)
    return `min-h-screen ${classes.background}`
  },
  
  // Text variants
  heading: (theme: Theme) => {
    const classes = getThemeClasses(theme)
    return `${classes.text.primary} font-bold`
  },
  
  bodyText: (theme: Theme) => {
    const classes = getThemeClasses(theme)
    return `${classes.text.secondary}`
  },
  
  accentText: (theme: Theme) => {
    const classes = getThemeClasses(theme)
    return `${classes.text.accent} font-medium`
  }
}