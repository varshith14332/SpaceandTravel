'use client';

import { useTheme, getThemeClasses } from '@/contexts/ThemeContext';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';
import { Rocket, Globe, BookOpen, Users, Target, Zap } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { analytics } from '@/lib/analytics';
import dynamic from 'next/dynamic';

// Dynamically import full SolarSystem simulation
const SolarSystemSimulation = dynamic(
  () => import('@/app/solar-system/page').then(mod => ({ default: mod.default })),
  { ssr: false }
);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const slideInFromLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const slideInFromRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 1, ease: "easeOut" }
  }
};

// Animated Section Component
const AnimatedSection = ({ children, className = "", variant = fadeInUp, delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  variant?: any;
  delay?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      variants={variant}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function HomePage() {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

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
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Full Solar System Simulation as Background */}
      <div className="fixed inset-0 z-0">
        {mounted && <SolarSystemSimulation />}
      </div>
      
      {/* Semi-transparent overlay for better text readability */}
      <div className="fixed inset-0 z-10 bg-black/20" />
      
      {/* Content */}
      <div className="relative z-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 w-full">
          <AnimatedSection variant={fadeInUp}>
            <div className="text-center">
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent leading-tight drop-shadow-2xl"
                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              >
                Space Mission Platform
              </motion.h1>
              <motion.p 
                className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto text-white/90 px-4 drop-shadow-lg`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Explore the cosmos, learn about space exploration, and embark on virtual missions to the stars. 
                Your journey to becoming a space expert starts here.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base backdrop-blur-sm"
                  >
                    Launch Dashboard
                  </motion.button>
                </Link>
                <Link href="/training">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 text-sm sm:text-base backdrop-blur-sm"
                  >
                    Start Learning
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Grid - Full viewport section with strong background */}
      <section className="min-h-screen flex items-center py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/90 backdrop-blur-sm" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-200px 0px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
              Explore Space Like Never Before
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
              Discover cutting-edge features designed to enhance your space exploration journey
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px 0px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.3,
                  delayChildren: 0.2
                }
              }
            }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 80, scale: 0.8 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: {
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }
                  }
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -15,
                  transition: { duration: 0.3 }
                }}
              >
                <Link 
                  href={feature.href}
                  onClick={() => handleFeatureClick(feature.title, feature.href)}
                >
                  <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 h-full hover:shadow-2xl hover:bg-black/50 hover:border-white/40 transition-all duration-500 cursor-pointer group touch-manipulation relative overflow-hidden">
                    {/* Animated background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      <div className={`${feature.color} mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center sm:justify-start`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center sm:text-left text-white group-hover:text-white/100">{feature.title}</h3>
                      <p className="text-white/80 group-hover:text-white/90 leading-relaxed text-sm sm:text-base text-center sm:text-left transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Full viewport section */}
      <section className="min-h-screen flex items-center py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-black/95 via-purple-900/20 to-black/95 backdrop-blur-sm" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true, margin: "-200px 0px" }}
          >
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px 0px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                    delayChildren: 0.3
                  }
                }
              }}
            >
              {[
                { number: "500+", label: "Missions Completed", color: "text-blue-400" },
                { number: "24/7", label: "Real-time Tracking", color: "text-green-400" },
                { number: "1000+", label: "Learning Resources", color: "text-purple-400" },
                { number: "99%", label: "Mission Success Rate", color: "text-orange-400" }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  className="p-6"
                  variants={{
                    hidden: { opacity: 0, y: 50, scale: 0.8 },
                    visible: { 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      transition: {
                        duration: 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }
                    }
                  }}
                  whileHover={{ scale: 1.1, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className={`text-4xl md:text-5xl font-bold ${stat.color} mb-3`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.1, type: "spring", bounce: 0.4 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-white/90 text-lg font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Full viewport section */}
      <section className="min-h-screen flex items-center py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-cyan-900/10 to-black/95 backdrop-blur-sm" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true, margin: "-200px 0px" }}
          >
            <motion.h2 
              className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              Ready for Your Space Adventure?
            </motion.h2>
            <motion.p 
              className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto drop-shadow-md leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Join thousands of space enthusiasts exploring the universe through our comprehensive platform.
            </motion.p>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 30px 60px rgba(168, 85, 247, 0.5)",
                  textShadow: "0 0 20px rgba(255,255,255,0.8)"
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 1,
                  type: "spring",
                  bounce: 0.4
                }}
                className="px-12 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-500 text-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10">Begin Your Journey</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
      </div>
    </div>
  );
}