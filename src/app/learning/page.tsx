'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Learning content interfaces
interface Article {
  id: string
  title: string
  content: string
  category: string
  readTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  image: string
  tags: string[]
}

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

interface Video {
  id: string
  title: string
  description: string
  youtubeId: string
  duration: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  views: string
  channel: string
  tags: string[]
}

export default function LearningHub() {
  const [activeTab, setActiveTab] = useState<'articles' | 'quizzes' | 'badges' | 'progress' | 'videos'>('articles')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [userProgress] = useState({
    articlesRead: 5,
    quizzesCompleted: 3,
    badgesEarned: 2,
    videosWatched: 4,
    totalXP: 1250
  })

  // Initialize learning content
  useEffect(() => {
    // Enhanced articles collection (10 total)
    const articlesData: Article[] = [
      {
        id: 'article-001',
        title: 'Introduction to Our Solar System',
        content: `## Welcome to Our Cosmic Neighborhood

Our solar system is a fascinating collection of celestial bodies orbiting around our central star, the Sun. This incredible system has been our home for billions of years and continues to amaze scientists and space enthusiasts alike.

### The Sun: Our Life-Giving Star

**The Sun** is a massive ball of hot plasma that provides the energy necessary for life on Earth. It contains 99.86% of the total mass of our solar system and generates energy through nuclear fusion in its core.

### The Eight Planets

Our solar system contains eight planets, each with unique characteristics:

- **Mercury**: The closest planet to the Sun and the smallest planet
- **Venus**: Known for its extreme greenhouse effect and retrograde rotation
- **Earth**: Our home planet, the only known planet with life
- **Mars**: The "Red Planet" with evidence of ancient water flows
- **Jupiter**: The largest planet with over 80 known moons
- **Saturn**: Famous for its spectacular ring system
- **Uranus**: An ice giant that rotates on its side
- **Neptune**: The windiest planet with speeds up to 2,100 km/h

### Dwarf Planets and Other Objects

Beyond the eight planets, our solar system contains dwarf planets like Pluto, asteroids, comets, and countless smaller objects that make up the rich tapestry of our cosmic neighborhood.

### Formation and Evolution

Scientists believe our solar system formed about 4.6 billion years ago from a giant molecular cloud. Understanding this process helps us learn about other planetary systems throughout the galaxy.`,
        category: 'basics',
        readTime: 5,
        difficulty: 'beginner',
        image: '🌞',
        tags: ['solar system', 'planets', 'astronomy', 'basics']
      },
      {
        id: 'article-002',
        title: 'The International Space Station: Humanity\'s Orbital Laboratory',
        content: `## Living and Working in Microgravity

The International Space Station (ISS) represents one of humanity's greatest achievements in space exploration. This orbiting laboratory has been continuously occupied since November 2000.

### ISS Overview

**Location**: 408 km above Earth
**Speed**: 27,600 km/h
**Orbit time**: 90 minutes
**Crew capacity**: 6-7 astronauts

### Daily Life on the ISS

Life aboard the ISS is vastly different from Earth. Astronauts must adapt to microgravity, where there is no up or down, and everything floats.

### Scientific Research

The ISS serves as a unique platform for scientific research in various fields:

- **Biology and Biotechnology**: Studying how living organisms adapt to microgravity
- **Physics**: Conducting experiments impossible on Earth
- **Earth and Climate Science**: Monitoring our planet from space
- **Technology Development**: Testing equipment for future space missions

### International Cooperation

The ISS is a joint project involving space agencies from the United States (NASA), Russia (Roscosmos), Europe (ESA), Japan (JAXA), and Canada (CSA).

### Future of the ISS

As the ISS ages, plans are underway for commercial space stations to take its place, continuing humanity's presence in low Earth orbit.`,
        category: 'astronauts',
        readTime: 7,
        difficulty: 'intermediate',
        image: '🛰️',
        tags: ['ISS', 'astronauts', 'research', 'microgravity']
      },
      {
        id: 'article-003',
        title: 'Rocket Propulsion: The Science of Getting to Space',
        content: `## Breaking Free from Earth's Gravity

Rocket propulsion is the fundamental technology that enables space travel. Understanding how rockets work is key to appreciating the complexity of space missions.

### Newton's Third Law

**"For every action, there is an equal and opposite reaction"** - This principle governs all rocket propulsion.

### Types of Rocket Engines

### Chemical Rockets
- **Liquid-fueled**: Use liquid propellants like hydrogen and oxygen
- **Solid-fueled**: Use solid propellant mixtures
- **Hybrid**: Combine liquid and solid propellants

### Advanced Propulsion Systems
- **Ion drives**: Use electric fields to accelerate ions
- **Nuclear thermal**: Use nuclear reactors to heat propellant
- **Solar sails**: Use radiation pressure from sunlight

### The Rocket Equation

The Tsiolkovsky rocket equation describes the relationship between a rocket's mass, exhaust velocity, and achievable velocity change:

**Δv = ve × ln(m0/mf)**

Where:
- Δv = change in velocity
- ve = exhaust velocity
- m0 = initial mass
- mf = final mass

### Multi-Stage Rockets

Most rockets use multiple stages to achieve the high velocities needed for orbital insertion. Each stage is discarded when its fuel is expended, reducing the mass that subsequent stages must accelerate.

### Future Propulsion Technologies

Scientists are developing new propulsion methods including fusion rockets, antimatter propulsion, and breakthrough propulsion physics concepts that could revolutionize space travel.`,
        category: 'technology',
        readTime: 10,
        difficulty: 'advanced',
        image: '🚀',
        tags: ['rockets', 'propulsion', 'physics', 'technology']
      },
      {
        id: 'article-004',
        title: 'The Apollo Program: Humanity\'s Greatest Adventure',
        content: `## "That's One Small Step for Man, One Giant Leap for Mankind"

The Apollo program represents the pinnacle of human achievement in space exploration. Between 1961 and 1972, NASA successfully landed 12 astronauts on the Moon across six missions.

### The Challenge

On May 25, 1961, President John F. Kennedy announced the ambitious goal of landing humans on the Moon and returning them safely to Earth before the end of the decade.

### Key Missions

### Apollo 1 (1967)
A tragic fire during a ground test killed astronauts Gus Grissom, Ed White, and Roger Chaffee, leading to major safety improvements.

### Apollo 8 (1968)
The first crewed mission to leave Earth orbit and travel to the Moon, capturing the famous "Earthrise" photograph.

### Apollo 11 (1969)
Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon on July 20, 1969.

### Apollo 13 (1970)
An explosion en route to the Moon turned this into a "successful failure" as NASA worked to bring the crew home safely.

### The Technology

The Apollo program required developing entirely new technologies:

- **Saturn V rocket**: The most powerful rocket ever successfully flown
- **Command Module**: Protected astronauts during launch and re-entry
- **Lunar Module**: Designed specifically for Moon landing
- **Life support systems**: Kept astronauts alive in the vacuum of space

### Scientific Discoveries

Apollo missions brought back 842 pounds of Moon rocks and made numerous scientific discoveries about the Moon's composition, age, and formation.

### Legacy

The Apollo program demonstrated that seemingly impossible goals could be achieved through determination, innovation, and international cooperation. It continues to inspire new generations of explorers and scientists.`,
        category: 'history',
        readTime: 8,
        difficulty: 'intermediate',
        image: '🌙',
        tags: ['Apollo', 'Moon landing', 'history', 'NASA']
      },
      {
        id: 'article-005',
        title: 'Mars Exploration: The Red Planet Beckons',
        content: `## Humanity's Next Giant Leap

Mars has captured human imagination for centuries. Today, we're closer than ever to sending humans to the Red Planet, with robotic missions paving the way.

### Why Mars?

Mars is the most Earth-like planet in our solar system, making it the most viable target for human colonization:

- **Day length**: 24 hours and 37 minutes
- **Seasons**: Similar to Earth due to axial tilt
- **Water evidence**: Past and present water activity
- **Atmosphere**: Thin but contains useful gases

### Robotic Exploration

### Current Missions
- **Perseverance Rover**: Searching for signs of ancient microbial life
- **Ingenuity Helicopter**: First powered flight on another planet
- **Mars Reconnaissance Orbiter**: High-resolution imaging of the surface

### Past Successes
- **Viking missions (1976)**: First successful Mars landings
- **Sojourner (1997)**: First Mars rover
- **Spirit and Opportunity**: Long-duration surface operations
- **Curiosity (2012)**: Nuclear-powered laboratory on wheels

### Challenges for Human Missions

### Radiation
Mars lacks a strong magnetic field and thick atmosphere, exposing surface dwellers to dangerous cosmic radiation.

### Atmosphere
The thin atmosphere (less than 1% of Earth's pressure) requires pressurized habitats and spacesuits.

### Distance
Mars is 140-400 million miles from Earth, creating communication delays and making rescue missions impossible.

### Dust Storms
Planet-wide dust storms can last months, blocking solar power and creating navigation hazards.

### Future Human Missions

NASA's Artemis program aims to use Moon missions as stepping stones to Mars, while private companies like SpaceX are developing the technology for Mars colonization.

### Terraforming Possibilities

Scientists debate whether Mars could be "terraformed" - transformed to have a more Earth-like environment suitable for human life without spacesuits.`,
        category: 'missions',
        readTime: 9,
        difficulty: 'intermediate',
        image: '🔴',
        tags: ['Mars', 'rovers', 'exploration', 'colonization']
      },
      {
        id: 'article-006',
        title: 'Becoming an Astronaut: The Ultimate Career',
        content: `## Requirements, Training, and Life in Space

Becoming an astronaut represents the pinnacle of human achievement. Only about 600 people have ever traveled to space, making it one of the most exclusive careers on Earth.

### Basic Requirements

### Physical Requirements
- **Height**: 62-75 inches (NASA requirement)
- **Vision**: 20/20 correctable vision
- **Health**: Pass comprehensive medical examinations
- **Age**: No specific age limit, but most are selected between 26-46

### Educational Requirements
- Bachelor's degree in engineering, biological science, physical science, or mathematics
- Advanced degree preferred
- Three years of professional experience or 1,000 hours of pilot-in-command time

### The Selection Process

### Application Phase
NASA receives thousands of applications but selects only 8-14 candidates every few years.

### Initial Screening
- Resume review
- Medical evaluation
- Psychological assessment
- Background investigation

### Final Selection
- Week-long interview and evaluation at Johnson Space Center
- Team exercises and simulations
- Medical and psychological tests

### Astronaut Training

### Basic Training (2 years)
- **Technical training**: Spacecraft systems and operations
- **Physical training**: Maintaining fitness in microgravity
- **Survival training**: Water and wilderness survival
- **Language training**: Russian language for ISS missions

### Mission-Specific Training (1-2 years)
- **Mission simulation**: Practice specific mission tasks
- **EVA training**: Spacewalk procedures in underwater facilities
- **Robotics training**: Operating robotic arms and systems
- **Emergency procedures**: Responding to various emergencies

### Life as an Astronaut

### Pre-Mission
- Intensive training and preparation
- Quarantine before launch
- Final mission briefings

### In Space
- Conducting scientific experiments
- Maintaining spacecraft systems
- Exercise 2.5 hours daily to combat muscle atrophy
- Communication with ground and family

### Post-Mission
- Medical monitoring and rehabilitation
- Data analysis and reporting
- Public outreach and education

### Different Types of Astronauts

- **Mission Specialists**: Conduct experiments and EVAs
- **Pilots**: Operate spacecraft systems
- **Commanders**: Lead missions and make critical decisions
- **Flight Engineers**: Maintain and repair spacecraft systems

### Future Opportunities

With commercial spaceflight expanding, new opportunities are emerging for astronauts beyond traditional government programs.`,
        category: 'astronauts',
        readTime: 11,
        difficulty: 'beginner',
        image: '👨‍🚀',
        tags: ['astronaut', 'training', 'career', 'selection']
      },
      {
        id: 'article-007',
        title: 'Space Telescopes: Windows to the Universe',
        content: `## Seeing Beyond Human Vision

Space telescopes have revolutionized our understanding of the universe by observing celestial objects without atmospheric interference.

### Why Space Telescopes?

### Atmospheric Limitations
- **Light pollution**: City lights interfere with observations
- **Atmospheric absorption**: Blocks many wavelengths of light
- **Atmospheric turbulence**: Causes stars to twinkle and blurs images
- **Weather**: Clouds and storms interrupt observations

### Advantages of Space
- **Perfect vacuum**: No atmospheric interference
- **Stable platform**: Precise pointing and tracking
- **Full spectrum access**: Can observe all wavelengths of light
- **24/7 operations**: No day/night cycle limitations

### Famous Space Telescopes

### Hubble Space Telescope (1990-present)
- **Primary mirror**: 2.4 meters
- **Orbit**: 547 km above Earth
- **Notable discoveries**: Age of the universe, dark energy, exoplanets
- **Famous images**: Pillars of Creation, deep field images

### James Webb Space Telescope (2021-present)
- **Primary mirror**: 6.5 meters (segmented)
- **Location**: L2 Lagrange point, 1.5 million km from Earth
- **Specialty**: Infrared observations
- **Goals**: Study first galaxies, star formation, exoplanet atmospheres

### Spitzer Space Telescope (2003-2020)
- **Specialty**: Infrared astronomy
- **Discoveries**: Exoplanets, brown dwarfs, cosmic dust

### Kepler Space Telescope (2009-2018)
- **Mission**: Search for Earth-like exoplanets
- **Discoveries**: Over 2,600 confirmed exoplanets
- **Method**: Transit photometry

### Types of Space Telescopes

### Optical Telescopes
Observe visible light, similar to what human eyes see.

### Infrared Telescopes
Detect heat radiation, useful for studying cool objects and distant galaxies.

### X-ray Telescopes
Observe high-energy phenomena like black holes and neutron stars.

### Radio Telescopes
Study radio waves from space, can penetrate cosmic dust.

### Gamma-ray Telescopes
Detect the highest-energy radiation in the universe.

### Future Missions

### Nancy Grace Roman Space Telescope
- Launch: Mid-2020s
- Mission: Dark energy and exoplanet research
- Features: Wide field of view for survey astronomy

### Extremely Large Telescopes
Ground-based telescopes with 30+ meter mirrors using adaptive optics to rival space telescopes.

### Impact on Science

Space telescopes have fundamentally changed our understanding of:
- The age and expansion of the universe
- Black holes and neutron stars
- Exoplanets and the possibility of life elsewhere
- Star and galaxy formation
- Dark matter and dark energy`,
        category: 'technology',
        readTime: 12,
        difficulty: 'intermediate',
        image: '🔭',
        tags: ['telescopes', 'Hubble', 'Webb', 'astronomy']
      },
      {
        id: 'article-008',
        title: 'Space Suits: Personal Spacecraft for Astronauts',
        content: `## Engineering Marvels That Keep Humans Alive in Space

Space suits are incredibly sophisticated pieces of technology that serve as personal spacecraft, protecting astronauts from the harsh environment of space.

### The Space Environment

### Challenges
- **Vacuum**: No air pressure (essentially zero)
- **Temperature extremes**: +250°F in sunlight, -250°F in shadow
- **Radiation**: Cosmic rays and solar radiation
- **Micrometeorites**: High-speed particles that can puncture materials
- **No oxygen**: Breathable atmosphere must be provided

### Modern Space Suit Components

### Extravehicular Mobility Unit (EMU)
NASA's current spacewalk suit consists of multiple integrated systems:

### Life Support System
- **Primary Life Support System (PLSS)**: Backpack containing vital systems
- **Oxygen supply**: 6-8 hours of breathable oxygen
- **Carbon dioxide removal**: Lithium hydroxide scrubbers
- **Cooling system**: Water-cooled garments
- **Power supply**: Batteries for all electronic systems

### Pressure Garment
- **Multiple layers**: Protection against pressure, temperature, and radiation
- **Joints**: Specially designed to allow movement under pressure
- **Gloves**: Most complex part, allowing dexterous finger movements
- **Helmet**: Provides visibility and communication systems

### Environmental Protection
- **Thermal Micrometeoroid Garment (TMG)**: Outer layer protection
- **Pressure bladder**: Maintains internal pressure
- **Restraint layer**: Prevents ballooning of the pressure bladder

### Communication Systems
- **Radio**: Direct communication with ground and other astronauts
- **Caution and warning system**: Alerts for suit malfunctions
- **Display and control module**: Interface for suit operations

### Evolution of Space Suits

### Mercury Program (1961-1963)
- Modified naval aviation pressure suits
- No life support backpack
- Limited mobility

### Gemini Program (1965-1966)
- First suits designed for spacewalks
- Chest-mounted life support
- Gold-plated visor for sun protection

### Apollo Program (1967-1975)
- Lunar surface suits with integrated life support
- Enhanced mobility for Moon walks
- Designed for 8+ hour operations

### Shuttle Program (1981-2011)
- EMU suits for spacewalks in Earth orbit
- Reusable and maintainable design
- Modular components for different astronaut sizes

### Future Space Suit Development

### Artemis Program - xEMU
- **Improved mobility**: Better joint design for lunar surface operations
- **Enhanced life support**: 8+ hour operation capability
- **Better sizing**: Accommodates wider range of astronaut sizes
- **Dust tolerance**: Designed to handle lunar dust

### Commercial Space Suits
- **SpaceX**: Pressure suits for Dragon spacecraft
- **Boeing**: Starliner pressure suits
- **Blue Origin**: New Shepard flight suits

### Mars Suit Requirements
Future Mars suits will need:
- **Dust protection**: Mars dust is extremely fine and abrasive
- **Extended operation**: Multi-day surface operations
- **Enhanced mobility**: Complex terrain navigation
- **Local resource utilization**: Potentially using Mars atmosphere

### Manufacturing and Testing

### Materials Science
- **Advanced fabrics**: Multi-layer thermal protection
- **Sealing systems**: Pressure seals that maintain integrity
- **Flexible joints**: Allow natural body movement

### Testing Procedures
- **Vacuum chambers**: Simulate space environment
- **Neutral buoyancy**: Underwater training facilities
- **Thermal testing**: Extreme temperature exposure
- **Durability testing**: Long-term wear and tear simulation`,
        category: 'technology',
        readTime: 10,
        difficulty: 'advanced',
        image: '🧑‍🚀',
        tags: ['space suits', 'EVA', 'life support', 'engineering']
      },
      {
        id: 'article-009',
        title: 'The Search for Extraterrestrial Life',
        content: `## Are We Alone in the Universe?

The search for extraterrestrial life represents one of humanity's most profound scientific quests, combining astronomy, biology, and philosophy.

### Types of Life We're Looking For

### Microbial Life
- **Extremophiles**: Life in extreme conditions
- **Biosignatures**: Chemical evidence of life processes
- **Subsurface oceans**: Life in liquid water beneath ice

### Intelligent Life
- **Technosignatures**: Evidence of technology
- **Radio signals**: Communication attempts
- **Megastructures**: Large-scale engineering projects

### Where We're Looking

### Within Our Solar System

### Mars
- **Ancient life**: Evidence of past habitable conditions
- **Current life**: Possible microbes in subsurface environments
- **Sample return missions**: Bringing Mars rocks to Earth for analysis

### Europa (Jupiter's Moon)
- **Subsurface ocean**: More water than all Earth's oceans
- **Hydrothermal vents**: Energy sources for life
- **Future missions**: Europa Clipper spacecraft

### Enceladus (Saturn's Moon)
- **Water geysers**: Direct sampling of subsurface ocean
- **Organic molecules**: Building blocks of life detected
- **Hydrothermal activity**: Energy source at ocean floor

### Titan (Saturn's Moon)
- **Methane lakes**: Alternative biochemistry possibilities
- **Complex organic chemistry**: Prebiotic molecules
- **Dragonfly mission**: Nuclear-powered helicopter explorer

### Beyond Our Solar System

### Exoplanets
- **Habitable zone**: "Goldilocks zone" around stars
- **Atmospheric analysis**: Looking for oxygen, water vapor, methane
- **Transit spectroscopy**: Analyzing starlight through atmospheres

### Methods of Detection

### SETI (Search for Extraterrestrial Intelligence)
- **Radio telescopes**: Listening for artificial signals
- **Optical SETI**: Looking for laser communications
- **Breakthrough Listen**: Comprehensive search program

### Biosignature Detection
- **Atmospheric composition**: Gases that indicate life
- **Seasonal variations**: Changes that suggest biological processes
- **Phosphine**: Recently detected in Venus's atmosphere

### Direct Imaging
- **Coronagraphs**: Blocking starlight to see planets
- **Interferometry**: Combining multiple telescopes
- **Future space telescopes**: Designed for exoplanet imaging

### The Drake Equation

Formulated by Frank Drake in 1961, this equation estimates the number of communicating civilizations in our galaxy:

**N = R* × fp × ne × fl × fi × fc × L**

Where:
- N = Number of civilizations
- R* = Rate of star formation
- fp = Fraction of stars with planets
- ne = Number of Earth-like planets per system
- fl = Fraction where life develops
- fi = Fraction where intelligence develops
- fc = Fraction that develop communication
- L = Length of time civilizations communicate

### Fermi Paradox

If the universe should be teeming with life, where is everybody? Possible explanations:

- **Great Filter**: A evolutionary step that's extremely difficult to pass
- **Rare Earth Hypothesis**: Earth-like conditions are extremely rare
- **Zoo Hypothesis**: Advanced civilizations are avoiding contact
- **Self-destruction**: Civilizations tend to destroy themselves

### Recent Discoveries

### Phosphine on Venus
Detection of phosphine gas in Venus's atmosphere suggests possible microbial life.

### Oumuamua
The first confirmed interstellar object through our solar system showed unusual acceleration.

### Fast Radio Bursts
Mysterious radio signals from distant galaxies that repeat in patterns.

### Future Missions and Projects

### James Webb Space Telescope
Analyzing exoplanet atmospheres for biosignatures.

### Europa Clipper
Detailed study of Jupiter's ice moon Europa.

### Vera Rubin Observatory
Sky survey that will discover thousands of new objects.

### Breakthrough Starshot
Proposed mission to send tiny probes to Proxima Centauri.

### Implications of Discovery

Finding extraterrestrial life would be the most significant discovery in human history, fundamentally changing our understanding of our place in the universe and raising profound philosophical questions about the nature of life itself.`,
        category: 'basics',
        readTime: 13,
        difficulty: 'intermediate',
        image: '👽',
        tags: ['SETI', 'exoplanets', 'astrobiology', 'life']
      },
      {
        id: 'article-010',
        title: 'Commercial Space: The New Space Race',
        content: `## Private Companies Revolutionizing Space Access

The commercial space industry has transformed from science fiction to reality, with private companies leading innovations in space technology and dramatically reducing costs.

### The Revolution Begins

### Traditional Space Programs
- **Government monopoly**: Space access controlled by national agencies
- **High costs**: Hundreds of millions per mission
- **Limited access**: Few launches per year
- **Conservative approach**: Risk-averse, slow development

### Commercial Transformation
- **Competition drives innovation**: Multiple companies competing
- **Cost reduction**: Order of magnitude decreases in launch costs
- **Rapid development**: Iterative design and testing
- **Reusability**: Rockets that can be used multiple times

### Key Players

### SpaceX
- **Founded**: 2002 by Elon Musk
- **Breakthrough**: First private company to reach orbit (2008)
- **Falcon 9**: Reusable rocket with proven track record
- **Dragon spacecraft**: Cargo and crew missions to ISS
- **Starship**: Next-generation vehicle for Mars missions

### Blue Origin
- **Founded**: 2000 by Jeff Bezos
- **New Shepard**: Suborbital tourism vehicle
- **New Glenn**: Orbital-class rocket in development
- **Lunar lander**: Partnering with NASA for Moon missions

### Virgin Galactic
- **Founded**: 2004 by Richard Branson
- **SpaceShipTwo**: Air-launched suborbital vehicle
- **Commercial astronauts**: Private individuals reaching space

### Boeing
- **Starliner**: Crew vehicle for ISS missions
- **Traditional aerospace**: Adapting to commercial model

### Commercial Applications

### Satellite Internet
- **Starlink**: SpaceX's constellation of thousands of satellites
- **Project Kuiper**: Amazon's planned constellation
- **OneWeb**: Global broadband coverage

### Earth Observation
- **Planet Labs**: Daily imaging of entire Earth
- **Maxar**: High-resolution satellite imagery
- **Agricultural monitoring**: Crop health and yield prediction

### Space Tourism
- **Suborbital flights**: Brief experience of weightlessness
- **Orbital tourism**: Multi-day stays in space
- **Space hotels**: Commercial space stations in development

### Manufacturing in Space
- **Microgravity advantages**: Unique manufacturing conditions
- **Fiber optics**: Superior quality in zero gravity
- **Pharmaceuticals**: Crystal growth in microgravity

### Technology Innovations

### Reusable Rockets
- **First stage recovery**: Landing rockets for reuse
- **Cost savings**: 10x reduction in launch costs
- **Rapid turnaround**: Same rocket flying multiple times per year

### Mass Production
- **Assembly line approach**: Building rockets like cars
- **3D printing**: Rapid prototyping and production
- **Automated systems**: Reducing human labor costs

### Small Satellites
- **CubeSats**: Standardized small satellite format
- **Rideshare missions**: Multiple customers per launch
- **Rapid deployment**: Constellation deployment

### Challenges and Opportunities

### Space Debris
- **Growing problem**: Dead satellites and rocket parts
- **Collision risks**: Cascading debris creation
- **Cleanup missions**: Active debris removal concepts

### Regulation
- **International coordination**: Managing crowded orbits
- **Safety standards**: Ensuring reliable operations
- **Environmental concerns**: Impact of rocket emissions

### Economic Impact

### Job Creation
- **New space economy**: Hundreds of thousands of jobs
- **Geographic distribution**: Space industry spread globally
- **Skilled workforce**: High-tech manufacturing jobs

### Investment
- **Venture capital**: Billions in private investment
- **Public markets**: Space SPACs and IPOs
- **Government contracts**: NASA Commercial Crew and Cargo

### Future Outlook

### Space Manufacturing
- **Zero-gravity factories**: Unique production capabilities
- **Resource extraction**: Asteroid mining possibilities
- **Space-based solar power**: Clean energy from space

### Deep Space Exploration
- **Private Mars missions**: Commercial Mars transportation
- **Asteroid missions**: Resource prospecting
- **Interstellar probes**: Commercial deep space missions

### Space Settlements
- **Commercial space stations**: Orbital communities
- **Lunar bases**: Commercial Moon operations
- **Mars colonies**: Private Mars settlement initiatives

### Global Competition
- **International players**: Companies worldwide entering space
- **National programs**: Countries developing space industries
- **Technology transfer**: Sharing innovations globally

The commercial space revolution is just beginning, with possibilities limited only by our imagination and engineering capabilities. As costs continue to fall and capabilities expand, space will become increasingly accessible to businesses, researchers, and eventually ordinary citizens.`,
        category: 'missions',
        readTime: 14,
        difficulty: 'intermediate',
        image: '🏢',
        tags: ['commercial space', 'SpaceX', 'Blue Origin', 'space economy']
      }
    ]

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

    // Educational space videos collection
    const videosData: Video[] = [
      {
        id: 'video-001',
        title: 'How SpaceX Starship Will Get Us to Mars',
        description: 'Detailed explanation of SpaceX\'s Mars colonization vehicle and mission architecture',
        youtubeId: 'zu7WJD8vpAQ',
        duration: '12:45',
        category: 'missions',
        difficulty: 'intermediate',
        views: '2.1M',
        channel: 'SpaceX',
        tags: ['SpaceX', 'Mars', 'Starship', 'colonization']
      },
      {
        id: 'video-002',
        title: 'The Insane Engineering of the International Space Station',
        description: 'How humanity built and maintains a laboratory in space',
        youtubeId: 'oLrOnEmy_GA',
        duration: '20:45',
        category: 'astronauts',
        difficulty: 'intermediate',
        views: '12.5M',
        channel: 'Real Engineering',
        tags: ['ISS', 'engineering', 'space station', 'construction']
      },
      {
        id: 'video-003',
        title: 'How Rocket Engines Work',
        description: 'Complete guide to rocket propulsion systems and engine types',
        youtubeId: 'DKtVpvzUF1Y',
        duration: '11:32',
        category: 'technology',
        difficulty: 'beginner',
        views: '3.1M',
        channel: 'Everyday Astronaut',
        tags: ['rockets', 'engines', 'propulsion', 'physics']
      },
      {
        id: 'video-004',
        title: 'Apollo 11 Moon Landing: Real Footage',
        description: 'Historical footage and audio from humanity\'s first Moon landing',
        youtubeId: 'cwZb2mqId0A',
        duration: '13:15',
        category: 'history',
        difficulty: 'beginner',
        views: '15.7M',
        channel: 'NASA',
        tags: ['Apollo 11', 'Moon landing', 'Armstrong', 'history']
      },
      {
        id: 'video-005',
        title: 'Life as a NASA Astronaut',
        description: 'Day-to-day experiences of living and working on the International Space Station',
        youtubeId: 'doN4t5NKW-k',
        duration: '18:42',
        category: 'astronauts',
        difficulty: 'beginner',
        views: '2.8M',
        channel: 'NASA',
        tags: ['astronaut life', 'ISS', 'daily routine', 'microgravity']
      },
      {
        id: 'video-006',
        title: 'James Webb Space Telescope: Engineering Marvel',
        description: 'How the most powerful space telescope ever built works',
        youtubeId: '4P8fKd0IVOs',
        duration: '25:31',
        category: 'technology',
        difficulty: 'intermediate',
        views: '4.6M',
        channel: 'Veritasium',
        tags: ['JWST', 'telescope', 'infrared', 'astronomy']
      },
      {
        id: 'video-007',
        title: 'The Search for Life on Mars',
        description: 'Current Mars missions and the hunt for signs of past or present life',
        youtubeId: 'ZEyAs3NWH4A',
        duration: '14:28',
        category: 'basics',
        difficulty: 'beginner',
        views: '1.9M',
        channel: 'SciShow Space',
        tags: ['Mars', 'life', 'Perseverance', 'astrobiology']
      },
      {
        id: 'video-008',
        title: 'Space Suit Design and Function',
        description: 'Engineering challenges of creating a personal spacecraft',
        youtubeId: '3RkhZgRNC1k',
        duration: '12:17',
        category: 'technology',
        difficulty: 'intermediate',
        views: '847K',
        channel: 'NASA',
        tags: ['space suits', 'EVA', 'engineering', 'protection']
      },
      {
        id: 'video-009',
        title: 'Exoplanets: Worlds Beyond Our Solar System',
        description: 'Discovery methods and characteristics of planets around other stars',
        youtubeId: 'GoW8Tf7hTGA',
        duration: '17:26',
        category: 'basics',
        difficulty: 'intermediate',
        views: '9.1M',
        channel: 'National Geographic',
        tags: ['exoplanets', 'discovery', 'planets', 'astronomy']
      },
      {
        id: 'video-010',
        title: 'Commercial Space Revolution',
        description: 'How private companies are changing space access',
        youtubeId: 'zqE-ultsWt0',
        duration: '22:14',
        category: 'missions',
        difficulty: 'intermediate',
        views: '1.5M',
        channel: 'ColdFusion',
        tags: ['commercial space', 'SpaceX', 'Blue Origin', 'economy']
      },
      {
        id: 'video-011',
        title: 'The Scale of the Universe',
        description: 'Journey from Earth to the edge of the observable universe',
        youtubeId: 'GoW8Tf7hTGA',
        duration: '17:26',
        category: 'basics',
        difficulty: 'beginner',
        views: '9.1M',
        channel: 'National Geographic',
        tags: ['universe', 'scale', 'astronomy', 'cosmos']
      },
      {
        id: 'video-012',
        title: 'Future of Space Exploration',
        description: 'Upcoming missions to Mars, Europa, and beyond',
        youtubeId: 'YH3c1QZzRK4',
        duration: '15:38',
        category: 'missions',
        difficulty: 'intermediate',
        views: '3.7M',
        channel: 'Isaac Arthur',
        tags: ['future missions', 'exploration', 'colonization', 'technology']
      }
    ]

    setArticles(articlesData)
    setQuizzes(sampleQuizzes)
    setBadges(sampleBadges)
    setVideos(videosData)
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

  const filteredVideos = selectedCategory === 'all'
    ? videos
    : videos.filter(video => video.category === selectedCategory)

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

  const VideoCard = ({ video }: { video: Video }) => (
    <motion.div
      className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600 hover:border-red-500 transition-colors cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')}
    >
      <div className="relative mb-4">
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
          alt={video.title}
          className="w-full h-48 object-cover rounded-lg"
          onError={(e) => {
            e.currentTarget.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
          }}
        />
        <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
          {video.duration}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-600 rounded-full p-3 hover:bg-red-700 transition-colors">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex items-start justify-between mb-2">
        <div className={`px-3 py-1 rounded-full text-xs border ${getDifficultyColor(video.difficulty)}`}>
          {video.difficulty}
        </div>
      </div>
      
      <h3 className="text-lg font-bold mb-2 line-clamp-2">{video.title}</h3>
      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{video.description}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>📺 {video.channel}</span>
        <span>👁️ {video.views} views</span>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {video.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded">
            {tag}
          </span>
        ))}
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
              <p className="text-gray-400 mt-1">Expand your space knowledge with articles, videos, quizzes, and achievements</p>
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
              { id: 'videos', name: 'Videos', icon: '🎥' },
              { id: 'quizzes', name: 'Quizzes', icon: '🧠' },
              { id: 'badges', name: 'Badges', icon: '🏆' },
              { id: 'progress', name: 'Progress', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'articles' | 'quizzes' | 'badges' | 'progress' | 'videos')}
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
          {(activeTab === 'articles' || activeTab === 'quizzes' || activeTab === 'videos') && (
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

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
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
                
                <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-xl p-6">
                  <div className="text-3xl mb-2">🎥</div>
                  <div className="text-2xl font-bold">{userProgress.videosWatched}</div>
                  <div className="text-sm text-red-200">Videos Watched</div>
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
                      <span>Watch educational videos</span>
                      <span>4/6</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '66%' }} />
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