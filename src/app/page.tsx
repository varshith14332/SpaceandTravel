'use client';

import { useTheme, getThemeClasses } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Rocket, Globe, BookOpen, Users, Target, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { analytics } from '@/lib/analytics';
import dynamic from 'next/dynamic';

// Dynamically import SolarSystem to avoid SSR issues
const SolarSystem = dynamic(
  () => import('@/components/SolarSystemSimple').then(mod => ({ default: mod.SolarSystem })),
  { ssr: false }
);

export default function HomePage() {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track page view and user interaction
  useEffect(() => {
    analytics.trackPageView('/');
    
    // Track time spent on homepage
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Date.now() - startTime;
      analytics.track('page_time', '/', { timeSpent });
    };
  }, []);

  const handleFeatureClick = (featureName: string, href: string) => {
    analytics.track('feature_click', href, {
      featureName,
      source: 'homepage',
      timestamp: new Date()
    });
  };

  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Real-time Space Tracking",
      description: "Track the International Space Station, satellites, and space debris in real-time with our interactive 3D globe.",
      href: "/dashboard",
      color: "text-blue-400"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Learning Hub",
      description: "Explore educational articles, take interactive quizzes, and earn badges while learning about space exploration.",
      href: "/training",
      color: "text-green-400"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Space Missions",
      description: "Plan and execute virtual space missions with realistic physics and detailed mission parameters.",
      href: "/missions",
      color: "text-purple-400"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community",
      description: "Connect with fellow space enthusiasts, share missions, and participate in collaborative challenges.",
      href: "/community",
      color: "text-orange-400"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI Assistant",
      description: "Get instant answers about space exploration, astronomy, and mission planning from our AI chatbot.",
      href: "/chat",
      color: "text-yellow-400"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Mission Simulator",
      description: "Experience realistic space mission scenarios with advanced 3D simulation and physics modeling.",
      href: "/simulator",
      color: "text-red-400"
    }
  ];

  return (
    <div className={`min-h-screen relative ${themeClasses.background} ${themeClasses.text.primary}`}>
      {/* 3D Solar System Background */}
      {mounted && <SolarSystem />}
      
      {/* Overlay to ensure content readability - TEMPORARILY DISABLED */}
      {/* <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" /> */}
      
      {/* Content */}
      <div className="relative z-10 bg-black/60 backdrop-blur-sm">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent leading-tight drop-shadow-2xl">
              Space Mission Platform
            </h1>
            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto text-white/90 px-4 drop-shadow-lg`}>
              Explore the cosmos, learn about space exploration, and embark on virtual missions to the stars. 
              Your journey to becoming a space expert starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base backdrop-blur-sm"
                >
                  Launch Dashboard
                </motion.button>
              </Link>
              <Link href="/training">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 text-sm sm:text-base backdrop-blur-sm"
                >
                  Start Learning
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-10 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white drop-shadow-lg">Explore Space Like Never Before</h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto px-4 drop-shadow-md">
              Discover cutting-edge features designed to enhance your space exploration journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Link 
                  href={feature.href}
                  onClick={() => handleFeatureClick(feature.title, feature.href)}
                >
                  <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 h-full hover:shadow-lg hover:bg-black/30 transition-all duration-300 cursor-pointer group touch-manipulation">
                    <div className={`${feature.color} mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center sm:justify-start`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center sm:text-left text-white">{feature.title}</h3>
                    <p className="text-white/80 leading-relaxed text-sm sm:text-base text-center sm:text-left">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-16 md:py-20 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center"
          >
            <div className="p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400 mb-1 sm:mb-2">500+</div>
              <div className="text-white/80 text-xs sm:text-sm md:text-base">Missions Completed</div>
            </div>
            <div className="p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400 mb-1 sm:mb-2">24/7</div>
              <div className="text-white/80 text-xs sm:text-sm md:text-base">Real-time Tracking</div>
            </div>
            <div className="p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400 mb-1 sm:mb-2">1000+</div>
              <div className="text-white/80 text-xs sm:text-sm md:text-base">Learning Resources</div>
            </div>
            <div className="p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-400 mb-1 sm:mb-2">99%</div>
              <div className="text-white/80 text-xs sm:text-sm md:text-base">Mission Success Rate</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-4 text-white drop-shadow-lg">Ready for Your Space Adventure?</h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 px-4 drop-shadow-md">
              Join thousands of space enthusiasts exploring the universe through our comprehensive platform.
            </p>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-base sm:text-lg mx-4 sm:mx-0 backdrop-blur-sm"
              >
                Begin Your Journey
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
      </div>
    </div>
  );
}