from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import datetime
import random
from routes.ai_chat import ai_chat_bp
from routes.simulation import simulation_bp

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Register blueprints
app.register_blueprint(ai_chat_bp, url_prefix='/api/ai')
app.register_blueprint(simulation_bp, url_prefix='/api/simulation')

@app.route('/')
def home():
    return jsonify({
        'message': 'Space Mission Platform Flask API',
        'status': 'active',
        'endpoints': {
            '/api/ai/chat': 'AI Chat endpoint',
            '/api/simulation/mission': 'Mission simulation endpoint',
            '/api/nasa/iss': 'ISS tracking data',
            '/api/nasa/satellites': 'Satellite tracking data'
        },
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/nasa/iss')
def get_iss_data():
    """Mock ISS tracking data (in production, integrate with NASA APIs)"""
    return jsonify({
        'position': {
            'latitude': round(random.uniform(-51.6, 51.6), 4),
            'longitude': round(random.uniform(-180, 180), 4),
            'altitude': round(408 + random.uniform(-10, 10), 2)
        },
        'velocity': round(27600 + random.uniform(-100, 100), 2),
        'timestamp': datetime.datetime.now().isoformat(),
        'crew_count': 7,
        'next_pass': {
            'duration': random.randint(300, 600),
            'max_elevation': random.randint(10, 90)
        }
    })

@app.route('/api/nasa/satellites')
def get_satellite_data():
    """Mock satellite tracking data"""
    satellites = [
        {'id': 'NOAA-19', 'type': 'Weather', 'altitude': 870},
        {'id': 'GPS-IIF-2', 'type': 'Navigation', 'altitude': 20200},
        {'id': 'STARLINK-1007', 'type': 'Communication', 'altitude': 550},
        {'id': 'HUBBLE', 'type': 'Scientific', 'altitude': 547},
        {'id': 'TERRA', 'type': 'Earth Observation', 'altitude': 705}
    ]
    
    satellite_data = []
    for sat in satellites:
        satellite_data.append({
            'id': sat['id'],
            'name': sat['id'],
            'type': sat['type'],
            'position': {
                'latitude': round(random.uniform(-80, 80), 4),
                'longitude': round(random.uniform(-180, 180), 4),
                'altitude': sat['altitude']
            },
            'velocity': round(7.66 + random.uniform(-0.5, 0.5), 2),  # km/s
            'status': 'operational'
        })
    
    return jsonify({
        'satellites': satellite_data,
        'total_count': len(satellite_data),
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/space/debris')
def get_debris_data():
    """Mock space debris tracking data"""
    debris_objects = []
    for i in range(10):
        debris_objects.append({
            'id': f'DEBRIS-{str(i+1).zfill(4)}',
            'position': {
                'latitude': round(random.uniform(-60, 60), 4),
                'longitude': round(random.uniform(-180, 180), 4),
                'altitude': round(random.uniform(300, 1200), 2)
            },
            'size': random.choice(['small', 'medium', 'large']),
            'risk_level': random.choice(['low', 'medium', 'high']),
            'velocity': round(random.uniform(6, 8), 2),
            'tracking_confidence': round(random.uniform(0.7, 1.0), 2)
        })
    
    return jsonify({
        'debris': debris_objects,
        'total_tracked': len(debris_objects),
        'high_risk_count': len([d for d in debris_objects if d['risk_level'] == 'high']),
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/astronauts/current')
def get_current_astronauts():
    """Current astronauts in space"""
    astronauts = [
        {
            'name': 'Frank Rubio',
            'nationality': 'USA',
            'agency': 'NASA',
            'mission': 'ISS Expedition 68-69',
            'launch_date': '2022-09-21',
            'days_in_space': (datetime.datetime.now() - datetime.datetime(2022, 9, 21)).days,
            'role': 'Flight Engineer'
        },
        {
            'name': 'Sergey Prokopyev',
            'nationality': 'Russia',
            'agency': 'Roscosmos',
            'mission': 'ISS Expedition 68-69',
            'launch_date': '2022-09-21',
            'days_in_space': (datetime.datetime.now() - datetime.datetime(2022, 9, 21)).days,
            'role': 'Commander'
        },
        {
            'name': 'Dmitri Petelin',
            'nationality': 'Russia',
            'agency': 'Roscosmos',
            'mission': 'ISS Expedition 68-69',
            'launch_date': '2022-09-21',
            'days_in_space': (datetime.datetime.now() - datetime.datetime(2022, 9, 21)).days,
            'role': 'Flight Engineer'
        }
    ]
    
    return jsonify({
        'astronauts': astronauts,
        'total_count': len(astronauts),
        'average_days_in_space': sum(a['days_in_space'] for a in astronauts) // len(astronauts),
        'timestamp': datetime.datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 
