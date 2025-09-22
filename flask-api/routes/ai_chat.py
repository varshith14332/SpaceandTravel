from flask import Blueprint, request, jsonify
import json
import random
import datetime
from services.ml_model import SpaceKnowledgeBot

ai_chat_bp = Blueprint('ai_chat', __name__)

# Initialize the space knowledge bot
space_bot = SpaceKnowledgeBot()

@ai_chat_bp.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint for space-related queries"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'error': 'Missing message in request body',
                'status': 'error'
            }), 400
        
        user_message = data['message'].strip()
        user_id = data.get('user_id', 'anonymous')
        
        if not user_message:
            return jsonify({
                'error': 'Empty message provided',
                'status': 'error'
            }), 400
        
        # Get response from the AI bot
        bot_response = space_bot.get_response(user_message)
        
        # Log the conversation (in production, save to database)
        conversation_log = {
            'user_id': user_id,
            'user_message': user_message,
            'bot_response': bot_response['message'],
            'confidence': bot_response['confidence'],
            'timestamp': datetime.datetime.now().isoformat()
        }
        
        return jsonify({
            'response': bot_response['message'],
            'confidence': bot_response['confidence'],
            'suggestions': bot_response.get('suggestions', []),
            'sources': bot_response.get('sources', []),
            'timestamp': datetime.datetime.now().isoformat(),
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Internal server error: {str(e)}',
            'status': 'error'
        }), 500

@ai_chat_bp.route('/suggestions', methods=['GET'])
def get_suggestions():
    """Get conversation starter suggestions"""
    suggestions = [
        "How does a rocket work?",
        "Tell me about the International Space Station",
        "What is it like to be an astronaut?",
        "How do astronauts sleep in space?",
        "What are the challenges of living in space?",
        "How fast does the ISS travel?",
        "What is the history of space exploration?",
        "How do space suits protect astronauts?",
        "What is the future of Mars exploration?",
        "How do satellites stay in orbit?",
        "What is space debris and why is it dangerous?",
        "How do astronauts train for space missions?"
    ]
    
    return jsonify({
        'suggestions': random.sample(suggestions, 6),
        'total_available': len(suggestions),
        'status': 'success'
    })

@ai_chat_bp.route('/topics', methods=['GET'])
def get_topics():
    """Get available knowledge topics"""
    topics = {
        'space_basics': {
            'name': 'Space Basics',
            'description': 'Fundamental concepts about space and space travel',
            'examples': ['gravity', 'vacuum of space', 'orbital mechanics']
        },
        'astronauts': {
            'name': 'Astronaut Life',
            'description': 'Daily life, training, and experiences of astronauts',
            'examples': ['astronaut training', 'living in microgravity', 'spacewalks']
        },
        'spacecraft': {
            'name': 'Spacecraft & Technology',
            'description': 'Rockets, space stations, and space technology',
            'examples': ['rocket engines', 'ISS modules', 'space suits']
        },
        'missions': {
            'name': 'Space Missions',
            'description': 'Past, present, and future space missions',
            'examples': ['Apollo missions', 'Mars rovers', 'Voyager probes']
        },
        'planets': {
            'name': 'Planetary Science',
            'description': 'Information about planets and celestial bodies',
            'examples': ['Mars exploration', 'Jupiter\'s moons', 'Saturn\'s rings']
        },
        'history': {
            'name': 'Space History',
            'description': 'Historical milestones in space exploration',
            'examples': ['first satellite', 'moon landing', 'space race']
        }
    }
    
    return jsonify({
        'topics': topics,
        'count': len(topics),
        'status': 'success'
    })

@ai_chat_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for the AI chat service"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Chat Service',
        'model_status': 'loaded',
        'timestamp': datetime.datetime.now().isoformat()
    }) 
