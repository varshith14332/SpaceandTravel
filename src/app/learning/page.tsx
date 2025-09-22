'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { articles as articlesData, type Article } from '../../lib/articles'

// Learning content interfaces

interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  timeLimit?: number
  passingScore: number
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  criteria: string
  earned: boolean
  earnedDate?: string
}

export default function LearningHub() {
  const [activeTab, setActiveTab] = useState<'articles' | 'quizzes' | 'badges' | 'progress'>('articles')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [articles, setArticles] = useState<Article[]>(articlesData) // Initialize directly with real articles data
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [userProgress] = useState({
    articlesRead: 5,
    quizzesCompleted: 3,
    badgesEarned: 2,
    totalXP: 1250
  })

  // Initialize learning content
  useEffect(() => {

    // Sample quizzes
    const sampleQuizzes: Quiz[] = [
      {
        id: 'quiz-001',
        title: 'Solar System Basics',
        description: 'Test your knowledge about our solar system',
        difficulty: 'beginner',
        category: 'basics',
        timeLimit: 300,
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            question: 'How many planets are in our solar system?',
            options: ['7', '8', '9', '10'],
            correctAnswer: 1,
            explanation: 'There are 8 planets in our solar system since Pluto was reclassified as a dwarf planet in 2006.'
          },
          {
            id: 'q2',
            question: 'Which planet is known as the Red Planet?',
            options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
            correctAnswer: 1,
            explanation: 'Mars is called the Red Planet due to iron oxide (rust) on its surface.'
          },
          {
            id: 'q3',
            question: 'What is the largest planet in our solar system?',
            options: ['Saturn', 'Neptune', 'Jupiter', 'Earth'],
            correctAnswer: 2,
            explanation: 'Jupiter is the largest planet, with a mass greater than all other planets combined.'
          }
        ]
      },
      {
        id: 'quiz-002',
        title: 'ISS Operations',
        description: 'Learn about International Space Station operations',
        difficulty: 'intermediate',
        category: 'astronauts',
        timeLimit: 600,
        passingScore: 80,
        questions: [
          {
            id: 'q1',
            question: 'At what altitude does the ISS orbit Earth?',
            options: ['200-250 km', '400-450 km', '600-700 km', '800-900 km'],
            correctAnswer: 1,
            explanation: 'The ISS orbits at approximately 408 km (254 miles) above Earth.'
          },
          {
            id: 'q2',
            question: 'How long does it take for the ISS to complete one orbit?',
            options: ['45 minutes', '90 minutes', '120 minutes', '180 minutes'],
            correctAnswer: 1,
            explanation: 'The ISS completes one orbit around Earth every 90 minutes.'
          }
        ]
      },
      {
        id: 'quiz-003',
        title: 'Rocket Science',
        description: 'Advanced concepts in rocket propulsion',
        difficulty: 'advanced',
        category: 'technology',
        timeLimit: 900,
        passingScore: 85,
        questions: [
          {
            id: 'q1',
            question: 'What is the specific impulse of liquid hydrogen/oxygen engines?',
            options: ['350-400 s', '450-470 s', '500-550 s', '600-650 s'],
            correctAnswer: 1,
            explanation: 'Liquid hydrogen/oxygen engines typically have a specific impulse of 450-470 seconds.'
          }
        ]
      }
    ]

    // Sample badges
    const sampleBadges: Badge[] = [
      {
        id: 'badge-001',
        name: 'Space Explorer',
        description: 'Read your first space article',
        icon: '🚀',
        criteria: 'Complete 1 article',
        earned: true,
        earnedDate: '2024-01-15'
      },
      {
        id: 'badge-002',
        name: 'Quiz Master',
        description: 'Pass your first quiz with flying colors',
        icon: '🏆',
        criteria: 'Score 90%+ on any quiz',
        earned: true,
        earnedDate: '2024-01-20'
      },
      {
        id: 'badge-003',
        name: 'Knowledge Seeker',
        description: 'Read articles from all categories',
        icon: '📚',
        criteria: 'Read 1 article from each category',
        earned: false
      },
      {
        id: 'badge-004',
        name: 'Mission Specialist',
        description: 'Expert knowledge of space missions',
        icon: '🛰️',
        criteria: 'Pass all mission-related quizzes',
        earned: false
      },
      {
        id: 'badge-005',
        name: 'Astronaut Candidate',
        description: 'Complete advanced astronaut training quizzes',
        icon: '👨‍🚀',
        criteria: 'Score 95%+ on astronaut quizzes',
        earned: false
      },
      {
        id: 'badge-006',
        name: 'Technology Expert',
        description: 'Master of space technology',
        icon: '⚙️',
        criteria: 'Pass all technology quizzes',
        earned: false
      }
    ]

    setArticles(articles)
    setQuizzes(sampleQuizzes)
    setBadges(sampleBadges)
  }, [])

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'basics', name: 'Space Basics', icon: '🌟' },
    { id: 'missions', name: 'Space Missions', icon: '🚀' },
    { id: 'technology', name: 'Technology', icon: '⚙️' },
    { id: 'astronauts', name: 'Astronauts', icon: '👨‍🚀' },
    { id: 'history', name: 'Space History', icon: '📜' }
  ]

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory)

  const filteredQuizzes = selectedCategory === 'all'
    ? quizzes
    : quizzes.filter(quiz => quiz.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-900 text-green-300 border-green-500'
      case 'intermediate': return 'bg-yellow-900 text-yellow-300 border-yellow-500'
      case 'advanced': return 'bg-red-900 text-red-300 border-red-500'
      default: return 'bg-gray-900 text-gray-300 border-gray-500'
    }
  }

  const ArticleCard = ({ article }: { article: Article }) => (
    <motion.div
      className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={() => setSelectedArticle(article)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{article.image}</div>
        <div className={`px-3 py-1 rounded-full text-xs border ${getDifficultyColor(article.difficulty)}`}>
          {article.difficulty}
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-2">{article.title}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
        {article.content.replace(/##?\s+/g, '').slice(0, 150)}...
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">📖 {article.readTime} min read</span>
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            Read More →
          </button>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )

  const ArticleReader = ({ article, onClose }: { article: Article; onClose: () => void }) => (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-start justify-center p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-gray-900 rounded-xl max-w-4xl w-full my-8 border border-gray-600"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="border-b border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{article.image}</div>
              <div>
                <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>📖 {article.readTime} min read</span>
                  <div className={`px-2 py-1 rounded-full text-xs border ${getDifficultyColor(article.difficulty)}`}>
                    {article.difficulty}
                  </div>
                  <span className="capitalize">{article.category}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="prose prose-invert max-w-none">
            {article.content.split('\n').map((line, index) => {
              const trimmedLine = line.trim()
              
              if (trimmedLine === '') {
                return <div key={index} className="h-4" />
              } else if (trimmedLine.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-blue-400 border-b border-blue-500/30 pb-2">
                    {trimmedLine.replace('## ', '')}
                  </h2>
                )
              } else if (trimmedLine.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-blue-300">
                    {trimmedLine.replace('### ', '')}
                  </h3>
                )
              } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                return (
                  <div key={index} className="font-bold mb-3 text-yellow-300 text-lg">
                    {trimmedLine.replace(/\*\*/g, '')}
                  </div>
                )
              } else if (trimmedLine.startsWith('- ')) {
                return (
                  <ul key={index} className="list-disc list-inside mb-2">
                    <li className="text-gray-300 mb-1">
                      {trimmedLine.replace('- ', '')}
                    </li>
                  </ul>
                )
              } else if (trimmedLine.match(/^\d+\.\s/)) {
                return (
                  <ol key={index} className="list-decimal list-inside mb-2">
                    <li className="text-gray-300 mb-1">
                      {trimmedLine.replace(/^\d+\.\s/, '')}
                    </li>
                  </ol>
                )
              } else if (trimmedLine.includes('**') && trimmedLine.includes(':**')) {
                const parts = trimmedLine.split(':**')
                return (
                  <p key={index} className="mb-3 text-gray-300">
                    <span className="font-bold text-yellow-300">
                      {parts[0].replace(/\*\*/g, '')}:
                    </span>
                    {parts[1] || ''}
                  </p>
                )
              } else if (trimmedLine.includes('**') && !trimmedLine.startsWith('**')) {
                const formattedContent = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-yellow-300">$1</strong>')
                return (
                  <p key={index} className="mb-4 text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedContent }} />
                )
              } else if (trimmedLine !== '') {
                return (
                  <p key={index} className="mb-4 text-gray-300 leading-relaxed">
                    {trimmedLine}
                  </p>
                )
              }
              return null
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Published in {article.category} • {article.readTime} minute read
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Close Article
          </button>
        </div>
      </motion.div>
    </motion.div>
  )

  const QuizCard = ({ quiz }: { quiz: Quiz }) => (
    <motion.div
      className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600 hover:border-purple-500 transition-colors cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">🧠</div>
        <div className={`px-3 py-1 rounded-full text-xs border ${getDifficultyColor(quiz.difficulty)}`}>
          {quiz.difficulty}
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
      <p className="text-gray-400 text-sm mb-4">{quiz.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">❓ {quiz.questions.length} questions</span>
          {quiz.timeLimit && (
            <span className="text-sm text-gray-500">⏱️ {Math.floor(quiz.timeLimit / 60)} min</span>
          )}
        </div>
        
        <div className="text-sm text-purple-400">
          Pass: {quiz.passingScore}%
        </div>
      </div>
    </motion.div>
  )

  const BadgeCard = ({ badge }: { badge: Badge }) => (
    <motion.div
      className={`bg-gray-800/80 backdrop-blur rounded-xl p-6 border transition-colors ${
        badge.earned 
          ? 'border-yellow-500 bg-yellow-900/20' 
          : 'border-gray-600 opacity-75'
      }`}
      whileHover={{ scale: badge.earned ? 1.02 : 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center">
        <div className={`text-4xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
          {badge.icon}
        </div>
        <h3 className="text-lg font-bold mb-2">{badge.name}</h3>
        <p className="text-sm text-gray-400 mb-3">{badge.description}</p>
        <p className="text-xs text-gray-500 mb-2">{badge.criteria}</p>
        
        {badge.earned ? (
          <div className="text-xs text-yellow-400">
            ✅ Earned {badge.earnedDate && new Date(badge.earnedDate).toLocaleDateString()}
          </div>
        ) : (
          <div className="text-xs text-gray-500">🔒 Not earned yet</div>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">📚 Learning Hub</h1>
              <p className="text-gray-400 mt-1">Expand your space knowledge with articles, quizzes, and achievements</p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">{userProgress.totalXP} XP</div>
              <div className="text-sm text-gray-400">Total Experience</div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex space-x-4 mb-6">
            {[
              { id: 'articles', name: 'Articles', icon: '📰' },
              { id: 'quizzes', name: 'Quizzes', icon: '🧠' },
              { id: 'badges', name: 'Badges', icon: '🏆' },
              { id: 'progress', name: 'Progress', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'articles' | 'quizzes' | 'badges' | 'progress')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
          
          {/* Categories */}
          {(activeTab === 'articles' || activeTab === 'quizzes') && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <motion.div
              key="articles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <motion.div
              key="quizzes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {badges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6">
                  <div className="text-3xl mb-2">📰</div>
                  <div className="text-2xl font-bold">{userProgress.articlesRead}</div>
                  <div className="text-sm text-blue-200">Articles Read</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6">
                  <div className="text-3xl mb-2">🧠</div>
                  <div className="text-2xl font-bold">{userProgress.quizzesCompleted}</div>
                  <div className="text-sm text-purple-200">Quizzes Completed</div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-xl p-6">
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="text-2xl font-bold">{userProgress.badgesEarned}</div>
                  <div className="text-sm text-yellow-200">Badges Earned</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-2xl font-bold">{userProgress.totalXP}</div>
                  <div className="text-sm text-green-200">Total XP</div>
                </div>
              </div>
              
              <div className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600">
                <h2 className="text-xl font-bold mb-4">🎯 Learning Goals</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Complete all beginner articles</span>
                      <span>3/5</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Pass all basic quizzes</span>
                      <span>1/2</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Earn 5 badges</span>
                      <span>2/5</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Article Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <ArticleReader
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}