from flask import Blueprint, jsonify
import random
import math
import datetime

simulation_bp = Blueprint('simulation', __name__)

@simulation_bp.route('/rocket-trajectory', methods=['GET'])
def rocket_trajectory():
    """Simulate rocket trajectory data"""
    try:
        # Simulate rocket trajectory points
        trajectory = []
        time_points = list(range(0, 301, 5))  # 0 to 300 seconds, every 5 seconds
        
        for t in time_points:
            # Simple trajectory physics simulation
            altitude = (t * 150) - (0.5 * 9.81 * (t/10)**2) + random.uniform(-100, 100)
            altitude = max(0, altitude)  # Can't go below ground
            
            velocity = 150 - (9.81 * t/10) + random.uniform(-20, 20)
            
            trajectory.append({
                'time': t,
                'altitude': round(altitude, 2),
                'velocity': round(velocity, 2),
                'fuel_remaining': max(0, 100 - (t/3))
            })
        
        return jsonify({
            'status': 'success',
            'trajectory': trajectory,
            'metadata': {
                'duration_seconds': 300,
                'max_altitude': max([point['altitude'] for point in trajectory]),
                'simulation_type': 'basic_rocket_trajectory'
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Simulation error: {str(e)}',
            'status': 'error'
        }), 500

@simulation_bp.route('/orbital-mechanics', methods=['GET'])
def orbital_mechanics():
    """Simulate orbital mechanics data"""
    try:
        # Generate orbital data points
        orbital_data = []
        time_steps = 100
        
        for i in range(time_steps):
            angle = (i * 360 / time_steps) * (math.pi / 180)  # Convert to radians
            radius = 6800 + random.uniform(-50, 50)  # ISS orbital radius ~408km above Earth
            
            x = radius * math.cos(angle)
            y = radius * math.sin(angle)
            
            orbital_data.append({
                'time_step': i,
                'x': round(x, 2),
                'y': round(y, 2),
                'velocity': round(7.66 + random.uniform(-0.1, 0.1), 2),  # ISS orbital velocity
                'altitude': round(radius - 6371, 2)  # Earth radius ~6371km
            })
        
        return jsonify({
            'status': 'success',
            'orbital_data': orbital_data,
            'metadata': {
                'orbital_period_minutes': 93,
                'simulation_type': 'circular_orbit',
                'reference_body': 'Earth'
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Orbital simulation error: {str(e)}',
            'status': 'error'
        }), 500

@simulation_bp.route('/space-weather', methods=['GET'])
def space_weather():
    """Simulate space weather conditions"""
    try:
        weather_data = {
            'solar_wind_speed': round(random.uniform(300, 800), 1),
            'proton_density': round(random.uniform(1, 15), 2),
            'magnetic_field_strength': round(random.uniform(2, 25), 1),
            'kp_index': random.randint(0, 9),
            'solar_flux': round(random.uniform(70, 300), 1),
            'x_ray_class': random.choice(['A', 'B', 'C', 'M', 'X']),
            'geomagnetic_activity': random.choice(['quiet', 'unsettled', 'active', 'minor storm', 'major storm']),
            'timestamp': datetime.datetime.now().isoformat(),
            'forecast': {
                'next_24h': random.choice(['stable', 'increasing', 'decreasing']),
                'solar_storm_probability': round(random.uniform(0, 100), 1)
            }
        }
        
        return jsonify({
            'status': 'success',
            'space_weather': weather_data,
            'alerts': [
                'Solar wind speed elevated',
                'Moderate geomagnetic activity expected'
            ] if weather_data['kp_index'] > 4 else []
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Space weather simulation error: {str(e)}',
            'status': 'error'
        }), 500

@simulation_bp.route('/health', methods=['GET'])
def simulation_health():
    """Health check for simulation service"""
    return jsonify({
        'status': 'healthy',
        'service': 'Space Simulation Service',
        'available_simulations': [
            'rocket-trajectory',
            'orbital-mechanics', 
            'space-weather'
        ],
        'timestamp': datetime.datetime.now().isoformat()
    })
