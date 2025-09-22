import json
import random
import re
from typing import Dict, List, Any

class SpaceKnowledgeBot:
    """AI chatbot for space-related queries with knowledge base"""
    
    def __init__(self):
        self.knowledge_base = self._load_knowledge_base()
        self.confidence_threshold = 0.6
        
    def _load_knowledge_base(self) -> Dict[str, Any]:
        """Load the space knowledge base"""
        return {
            'space_basics': {
                'keywords': ['gravity', 'vacuum', 'orbit', 'atmosphere', 'pressure', 'temperature', 'radiation'],
                'responses': {
                    'gravity': "In space, there's virtually no gravity as we know it on Earth. Astronauts experience microgravity, which makes them appear weightless. This happens because they're in continuous free fall around Earth while the ISS orbits at about 408 km above the surface.",
                    'vacuum': "Space is a near-perfect vacuum, meaning there's almost no air or matter. This creates unique challenges like the need for pressurized spacecraft and space suits to protect astronauts from the harsh environment.",
                    'orbit': "An orbit occurs when an object moves around another object in a curved path due to gravitational forces. Spacecraft maintain orbit by balancing their forward velocity with Earth's gravitational pull."
                }
            },
            'astronauts': {
                'keywords': ['astronaut', 'training', 'sleep', 'eat', 'exercise', 'daily life', 'spacewalk', 'eva'],
                'responses': {
                    'training': "Astronaut training is incredibly rigorous and takes years. It includes physical fitness, spacecraft systems training, survival training, underwater EVA practice, and learning to work in microgravity using specialized facilities.",
                    'sleep': "Astronauts sleep in sleeping bags attached to walls in small crew quarters. They use eye masks and earplugs since the ISS orbits Earth every 90 minutes, experiencing 16 sunrises and sunsets daily.",
                    'eat': "Space food is specially prepared to prevent crumbs and spills. Astronauts eat rehydrated meals, thermostabilized foods, and fresh fruits when supply missions arrive. They drink through straws from pouches.",
                    'exercise': "Astronauts exercise 2.5 hours daily using specialized equipment like treadmills with harness systems and resistance devices to prevent muscle atrophy and bone loss in microgravity."
                }
            },
            'spacecraft': {
                'keywords': ['rocket', 'iss', 'space station', 'shuttle', 'capsule', 'propulsion', 'fuel'],
                'responses': {
                    'rocket': "Rockets work by Newton's third law - for every action, there's an equal and opposite reaction. They burn fuel to create hot gases that are expelled downward, pushing the rocket upward. Modern rockets use liquid oxygen and rocket fuel.",
                    'iss': "The International Space Station is a habitable artificial satellite in low Earth orbit. It's about the size of a football field and travels at 28,000 km/h. It serves as a microgravity research laboratory with crew from multiple countries.",
                    'propulsion': "Spacecraft use various propulsion methods: chemical rockets for launch and major maneuvers, ion thrusters for long-duration missions, and reaction control systems for precise positioning."
                }
            },
            'missions': {
                'keywords': ['apollo', 'mars', 'moon', 'landing', 'rover', 'probe', 'exploration', 'mission'],
                'responses': {
                    'apollo': "The Apollo program achieved the first human moon landings from 1969-1972. Apollo 11's Neil Armstrong and Buzz Aldrin were the first humans to walk on the moon on July 20, 1969, while Michael Collins orbited above.",
                    'mars': "Mars exploration includes numerous robotic missions. Current rovers like Perseverance search for signs of ancient life and collect samples. Future crewed missions to Mars are planned for the 2030s.",
                    'rover': "Mars rovers are robotic vehicles designed to traverse the Martian surface. They carry scientific instruments to analyze soil, rocks, and atmosphere. Rovers like Curiosity and Perseverance have made groundbreaking discoveries."
                }
            },
            'planets': {
                'keywords': ['mars', 'jupiter', 'saturn', 'venus', 'mercury', 'planet', 'moon', 'rings'],
                'responses': {
                    'mars': "Mars is called the Red Planet due to iron oxide on its surface. It has seasons like Earth, polar ice caps, and the largest volcano in the solar system (Olympus Mons). A day on Mars is about 24 hours and 37 minutes.",
                    'jupiter': "Jupiter is the largest planet in our solar system with over 80 known moons. Its Great Red Spot is a storm larger than Earth that's been raging for centuries. It acts as a 'cosmic vacuum cleaner' protecting inner planets from asteroids.",
                    'saturn': "Saturn is famous for its spectacular ring system made of ice and rock particles. It's less dense than water and has over 80 moons, including Titan, which has lakes of liquid methane."
                }
            },
            'history': {
                'keywords': ['sputnik', 'gagarin', 'armstrong', 'space race', 'first', 'history', 'timeline'],
                'responses': {
                    'sputnik': "Sputnik 1, launched by the Soviet Union on October 4, 1957, was the first artificial satellite. This beach ball-sized satellite started the Space Age and the Space Race between the US and USSR.",
                    'gagarin': "Yuri Gagarin became the first human in space on April 12, 1961, aboard Vostok 1. His 108-minute orbital flight around Earth was a major milestone in human space exploration.",
                    'space race': "The Space Race was a 20th-century competition between the US and Soviet Union to achieve superior spaceflight capabilities. It drove rapid advancement in space technology and culminated in the moon landing."
                }
            }
        }
    
    def get_response(self, user_message: str) -> Dict[str, Any]:
        """Generate a response to user message"""
        user_message_lower = user_message.lower()
        
        # Find matching topics and calculate confidence
        best_match = None
        highest_confidence = 0
        
        for topic, data in self.knowledge_base.items():
            confidence = self._calculate_confidence(user_message_lower, data['keywords'])
            if confidence > highest_confidence:
                highest_confidence = confidence
                best_match = (topic, data)
        
        if best_match and highest_confidence >= self.confidence_threshold:
            topic, data = best_match
            response = self._generate_specific_response(user_message_lower, data)
            sources = [f"Space Knowledge Base - {topic.replace('_', ' ').title()}"]
            suggestions = self._generate_suggestions(topic)
        else:
            # Fallback response for unclear queries
            response = self._generate_fallback_response(user_message)
            sources = ["General Space Knowledge"]
            suggestions = self._generate_general_suggestions()
        
        return {
            'message': response,
            'confidence': round(highest_confidence, 2),
            'sources': sources,
            'suggestions': suggestions
        }
    
    def _calculate_confidence(self, message: str, keywords: List[str]) -> float:
        """Calculate confidence score based on keyword matches"""
        words = re.findall(r'\b\w+\b', message)
        matches = sum(1 for word in words if any(keyword in word for keyword in keywords))
        
        if not words:
            return 0.0
        
        base_confidence = matches / len(words)
        
        # Boost confidence for exact keyword matches
        exact_matches = sum(1 for keyword in keywords if keyword in message)
        exact_boost = exact_matches * 0.3
        
        return min(base_confidence + exact_boost, 1.0)
    
    def _generate_specific_response(self, message: str, data: Dict[str, Any]) -> str:
        """Generate specific response based on matched topic"""
        responses = data['responses']
        
        # Find the most relevant specific response
        best_key = None
        for key in responses.keys():
            if key in message:
                best_key = key
                break
        
        if best_key:
            return responses[best_key]
        
        # Return a random response from the topic if no specific match
        return random.choice(list(responses.values()))
    
    def _generate_fallback_response(self, message: str) -> str:
        """Generate fallback response for unclear queries"""
        fallback_responses = [
            "That's an interesting question about space! While I don't have specific information about that topic, space exploration involves many fascinating aspects like orbital mechanics, life support systems, and the challenges of working in microgravity.",
            "I'd love to help with your space question! Could you be more specific? I have knowledge about astronaut life, spacecraft technology, planetary science, and space missions.",
            "Space is full of amazing phenomena! While I'm not sure about that specific topic, I can tell you about things like how rockets work, life on the International Space Station, or the history of space exploration.",
            "That's a great space-related question! I specialize in topics like astronaut training, spacecraft systems, planetary exploration, and the history of space missions. Could you rephrase your question to be more specific?"
        ]
        
        return random.choice(fallback_responses)
    
    def _generate_suggestions(self, topic: str) -> List[str]:
        """Generate follow-up suggestions based on topic"""
        suggestions_map = {
            'space_basics': [
                "How does gravity work in space?",
                "Why is space a vacuum?",
                "How do satellites stay in orbit?"
            ],
            'astronauts': [
                "How do astronauts train for space?",
                "What is it like to sleep in space?",
                "How do astronauts exercise in microgravity?"
            ],
            'spacecraft': [
                "How do rockets work?",
                "Tell me about the International Space Station",
                "What are different types of spacecraft?"
            ],
            'missions': [
                "Tell me about the Apollo moon missions",
                "What are the current Mars missions?",
                "What was the first space mission?"
            ],
            'planets': [
                "What makes Mars special?",
                "Tell me about Jupiter's moons",
                "Why does Saturn have rings?"
            ],
            'history': [
                "What was the Space Race?",
                "Who was the first person in space?",
                "When was the first satellite launched?"
            ]
        }
        
        return suggestions_map.get(topic, self._generate_general_suggestions())
    
    def _generate_general_suggestions(self) -> List[str]:
        """Generate general suggestions"""
        return [
            "How does a rocket work?",
            "What is life like on the ISS?",
            "Tell me about Mars exploration",
            "What was the Apollo program?",
            "How do astronauts train?",
            "What are the challenges of space travel?"
        ]
