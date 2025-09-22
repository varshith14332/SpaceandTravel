'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  analyzeMission, 
  calculateSuccessProbability,
  LAUNCH_SITES,
  ROCKET_ENGINES,
  MissionCalculations
} from '../../utils/orbitalMechanics'

// Dynamically import 3D visualization to avoid SSR issues
const Mission3DVisualization = dynamic(() => import('../../components/Mission3DVisualization'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-white">Loading 3D Mission Visualization...</div>
    </div>
  )
})

// Mission parameters interface
interface MissionParams {
  payload: number // kg
  fuel: number // kg
  targetOrbit: {
    altitude: number // km
    inclination: number // degrees
    eccentricity: number
  }
  launchSite: string
  missionType: 'LEO' | 'GEO' | 'POLAR' | 'LUNAR' | 'MARS'
}

// Mission results interface
interface MissionResults {
  success: boolean
  deltaV: number // m/s
  fuelConsumption: number // kg
  orbitAccuracy: number // percentage
  missionTime: number // minutes
  score: number
  issues: string[]
}

export default function MissionSimulator() {
  const [currentStep, setCurrentStep] = useState<'setup' | 'launch' | 'orbit' | 'results'>('setup')
  const [missionParams, setMissionParams] = useState<MissionParams>({
    payload: 1000,
    fuel: 50000,
    targetOrbit: {
      altitude: 408,
      inclination: 51.6,
      eccentricity: 0.01
    },
    launchSite: 'Kennedy Space Center',
    missionType: 'LEO'
  })
  const [results, setResults] = useState<MissionResults | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [missionTime, setMissionTime] = useState(0) // seconds since launch
  const [selectedEngine, setSelectedEngine] = useState('Merlin 1D')
  const [missionAnalysis, setMissionAnalysis] = useState<MissionCalculations | null>(null)

  // Update mission analysis when parameters change
  useEffect(() => {
    try {
      const analysis = analyzeMission(
        missionParams.targetOrbit,
        missionParams.payload,
        missionParams.fuel,
        missionParams.launchSite,
        selectedEngine
      );
      setMissionAnalysis(analysis);
    } catch (error) {
      console.error('Mission analysis error:', error);
    }
  }, [missionParams, selectedEngine]);

  // Mission timer for real-time simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating) {
      timer = setInterval(() => {
        setMissionTime(prev => prev + 1);
      }, 100); // Update every 100ms for smooth animation
    }
    return () => clearInterval(timer);
  }, [isSimulating]);

  // Run mission simulation with advanced calculations
  const runSimulation = () => {
    if (!missionAnalysis) return;
    
    setIsSimulating(true);
    setMissionTime(0);
    
    // Simulate mission execution with realistic timeline
    setTimeout(() => {
      const successProbability = calculateSuccessProbability(
        missionAnalysis,
        missionParams.fuel,
        0.85, // Weather conditions
        0.95  // Vehicle reliability
      );
      
      const randomFactor = Math.random();
      const missionSuccess = randomFactor < successProbability;
      
      const missionResults: MissionResults = {
        success: missionSuccess,
        deltaV: missionAnalysis.deltaV,
        fuelConsumption: missionAnalysis.fuelRequired,
        orbitAccuracy: missionSuccess ? 85 + Math.random() * 15 : 60 + Math.random() * 25,
        missionTime: missionAnalysis.burnTime / 60, // Convert to minutes
        score: 0,
        issues: []
      };
      
      // Calculate score based on mission success and efficiency
      missionResults.score = Math.round(
        (missionResults.success ? 60 : 0) +
        (missionResults.orbitAccuracy * 0.25) +
        (missionAnalysis.fuelRequired < missionParams.fuel * 0.8 ? 15 : 0)
      );
      
      // Add realistic issues
      if (!missionSuccess) {
        if (missionAnalysis.fuelRequired > missionParams.fuel) {
          missionResults.issues.push('Insufficient fuel for target orbit');
        }
        if (randomFactor < 0.3) {
          missionResults.issues.push('Engine anomaly during ascent');
        }
        if (randomFactor < 0.5 && randomFactor >= 0.3) {
          missionResults.issues.push('Guidance system malfunction');
        }
      }
      
      if (missionResults.orbitAccuracy < 80) {
        missionResults.issues.push('Orbit insertion accuracy below nominal');
      }
      
      setResults(missionResults);
      setCurrentStep('results');
      setIsSimulating(false);
      setMissionTime(0);
    }, 8000); // 8 seconds for full mission simulation
  };

  // Mission setup form
  const renderSetupForm = () => (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-black/80 backdrop-blur rounded-2xl text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">🚀 Mission Planning</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Left Column - Basic Parameters */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-base sm:text-lg font-semibold mb-2">Mission Type</label>
            <select
              value={missionParams.missionType}
              onChange={(e) => setMissionParams(prev => ({
                ...prev,
                missionType: e.target.value as MissionParams['missionType']
              }))}
              className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 touch-manipulation"
            >
              <option value="LEO">Low Earth Orbit (LEO)</option>
              <option value="GEO">Geostationary Orbit (GEO)</option>
              <option value="POLAR">Polar Orbit</option>
              <option value="LUNAR">Lunar Mission</option>
              <option value="MARS">Mars Mission</option>
            </select>
          </div>
          
          <div>
            <label className="block text-lg font-semibold mb-2">Launch Site</label>
            <select
              value={missionParams.launchSite}
              onChange={(e) => setMissionParams(prev => ({
                ...prev,
                launchSite: e.target.value
              }))}
              className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 touch-manipulation"
            >
              <option value="Kennedy Space Center">Kennedy Space Center (28.6°N)</option>
              <option value="Baikonur Cosmodrome">Baikonur Cosmodrome (45.9°N)</option>
              <option value="Guiana Space Centre">Guiana Space Centre (5.2°N)</option>
              <option value="Vandenberg SFB">Vandenberg SFB (34.7°N)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-lg font-semibold mb-2">Rocket Engine</label>
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 touch-manipulation"
            >
              {Object.keys(ROCKET_ENGINES).map(engine => (
                <option key={engine} value={engine}>
                  {engine} (Isp: {ROCKET_ENGINES[engine].specificImpulse}s)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-lg font-semibold mb-2">Payload Mass: {missionParams.payload.toLocaleString()} kg</label>
            <input
              type="range"
              min="100"
              max="50000"
              step="100"
              value={missionParams.payload}
              onChange={(e) => setMissionParams(prev => ({
                ...prev,
                payload: parseInt(e.target.value)
              }))}
              className="w-full accent-blue-500"
            />
            <div className="text-sm text-gray-400 mt-1">
              {missionParams.payload < 1000 ? 'Small satellite' :
               missionParams.payload < 10000 ? 'Medium satellite' :
               missionParams.payload < 25000 ? 'Large spacecraft' : 'Heavy payload'}
            </div>
          </div>
          
          <div>
            <label className="block text-lg font-semibold mb-2">Fuel Mass: {missionParams.fuel.toLocaleString()} kg</label>
            <input
              type="range"
              min="1000"
              max="500000"
              step="1000"
              value={missionParams.fuel}
              onChange={(e) => setMissionParams(prev => ({
                ...prev,
                fuel: parseInt(e.target.value)
              }))}
              className="w-full accent-green-500"
            />
          </div>
        </div>
        
        {/* Right Column - Orbital Parameters */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-blue-400">Target Orbit Parameters</h3>
          
          <div>
            <label className="block text-lg font-semibold mb-2">Altitude: {missionParams.targetOrbit.altitude.toLocaleString()} km</label>
            <input
              type="range"
              min="200"
              max="35786"
              step="50"
              value={missionParams.targetOrbit.altitude}
              onChange={(e) => setMissionParams(prev => ({
                ...prev,
                targetOrbit: { ...prev.targetOrbit, altitude: parseInt(e.target.value) }
              }))}
              className="w-full accent-purple-500"
            />
            <div className="text-sm text-gray-400 mt-1">
              {missionParams.targetOrbit.altitude < 1000 ? 'Low Earth Orbit (LEO)' :
               missionParams.targetOrbit.altitude < 35000 ? 'Medium Earth Orbit (MEO)' :
               'Geostationary Orbit (GEO)'}
            </div>
          </div>
          
          <div>
            <label className="block text-lg font-semibold mb-2">Inclination: {missionParams.targetOrbit.inclination}°</label>
            <input
              type="range"
              min="0"
              max="180"
              step="0.1"
              value={missionParams.targetOrbit.inclination}
              onChange={(e) => setMissionParams(prev => ({
                ...prev,
                targetOrbit: { ...prev.targetOrbit, inclination: parseFloat(e.target.value) }
              }))}
              className="w-full accent-orange-500"
            />
            <div className="text-sm text-gray-400 mt-1">
              {missionParams.targetOrbit.inclination < 10 ? 'Equatorial orbit' :
               missionParams.targetOrbit.inclination > 80 ? 'Polar orbit' :
               'Inclined orbit'}
            </div>
          </div>
          
          <div>
            <label className="block text-lg font-semibold mb-2">Eccentricity: {missionParams.targetOrbit.eccentricity.toFixed(3)}</label>
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.001"
              value={missionParams.targetOrbit.eccentricity}
              onChange={(e) => setMissionParams(prev => ({
                ...prev,
                targetOrbit: { ...prev.targetOrbit, eccentricity: parseFloat(e.target.value) }
              }))}
              className="w-full accent-red-500"
            />
            <div className="text-sm text-gray-400 mt-1">
              {missionParams.targetOrbit.eccentricity < 0.01 ? 'Nearly circular' :
               missionParams.targetOrbit.eccentricity < 0.5 ? 'Elliptical' :
               'Highly elliptical'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mission Feasibility Analysis */}
      <div className="mt-8 p-6 bg-gray-900/50 rounded-xl">
        <h3 className="text-xl font-bold mb-4 text-yellow-400">Mission Analysis</h3>
        {missionAnalysis ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className={`p-3 rounded-lg ${missionAnalysis.fuelRequired <= missionParams.fuel ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
              <div className="font-bold">Feasibility</div>
              <div>{missionAnalysis.fuelRequired <= missionParams.fuel ? '✅ Achievable' : '❌ Insufficient fuel'}</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-500">
              <div className="font-bold">Delta-V Required</div>
              <div>{Math.round(missionAnalysis.deltaV).toLocaleString()} m/s</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-500">
              <div className="font-bold">Fuel Required</div>
              <div>{Math.round(missionAnalysis.fuelRequired).toLocaleString()} kg</div>
            </div>
            <div className="p-3 rounded-lg bg-cyan-900/30 border border-cyan-500">
              <div className="font-bold">Orbital Period</div>
              <div>{Math.round(missionAnalysis.orbitalPeriod)} minutes</div>
            </div>
            <div className="p-3 rounded-lg bg-orange-900/30 border border-orange-500">
              <div className="font-bold">Orbital Velocity</div>
              <div>{Math.round(missionAnalysis.orbitalVelocity).toLocaleString()} m/s</div>
            </div>
            <div className="p-3 rounded-lg bg-pink-900/30 border border-pink-500">
              <div className="font-bold">Burn Time</div>
              <div>{Math.round(missionAnalysis.burnTime)} seconds</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">Calculating mission parameters...</div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-8">
        <button
          onClick={() => setCurrentStep('launch')}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
        >
          Proceed to Launch
        </button>
        <button
          onClick={() => {
            // Reset to default ISS parameters
            setMissionParams({
              payload: 1000,
              fuel: 50000,
              targetOrbit: { altitude: 408, inclination: 51.6, eccentricity: 0.01 },
              launchSite: 'Kennedy Space Center',
              missionType: 'LEO'
            })
          }}
          className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
        >
          Reset to ISS Parameters
        </button>
      </div>
    </div>
  )

  // Launch phase
  const renderLaunchPhase = () => (
    <div className="relative h-screen">
      <Mission3DVisualization
        targetAltitude={missionParams.targetOrbit.altitude}
        inclination={missionParams.targetOrbit.inclination}
        eccentricity={missionParams.targetOrbit.eccentricity}
        launchSite={LAUNCH_SITES[missionParams.launchSite] || LAUNCH_SITES['Kennedy Space Center']}
        isLaunching={isSimulating}
        currentTime={missionTime}
        onMissionEvent={(event) => console.log('Mission event:', event)}
      />
      
      {/* Launch Controls Overlay */}
      <div className="absolute top-20 right-4 bg-black/80 backdrop-blur p-6 rounded-xl text-white max-w-sm">
        <h3 className="text-xl font-bold mb-4">🚀 Launch Control</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Mission:</span>
            <span className="text-blue-400">{missionParams.missionType}</span>
          </div>
          <div className="flex justify-between">
            <span>Payload:</span>
            <span>{missionParams.payload.toLocaleString()} kg</span>
          </div>
          <div className="flex justify-between">
            <span>Target Altitude:</span>
            <span>{missionParams.targetOrbit.altitude} km</span>
          </div>
          <div className="flex justify-between">
            <span>Target Inclination:</span>
            <span>{missionParams.targetOrbit.inclination}°</span>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-6">
          <button
            onClick={() => setCurrentStep('orbit')}
            className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm transition-colors"
          >
            Continue to Orbit
          </button>
          <button
            onClick={() => setCurrentStep('setup')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm transition-colors"
          >
            Back to Setup
          </button>
        </div>
      </div>
    </div>
  )

  // Orbit phase
  const renderOrbitPhase = () => (
    <div className="relative h-screen">
      <Mission3DVisualization
        targetAltitude={missionParams.targetOrbit.altitude}
        inclination={missionParams.targetOrbit.inclination}
        eccentricity={missionParams.targetOrbit.eccentricity}
        launchSite={LAUNCH_SITES[missionParams.launchSite] || LAUNCH_SITES['Kennedy Space Center']}
        isLaunching={false}
        currentTime={missionTime + 600} // In orbit phase
        onMissionEvent={(event) => console.log('Orbital event:', event)}
      />
      
      {/* Orbit Analysis Overlay */}
      <div className="absolute top-20 right-4 bg-black/80 backdrop-blur p-6 rounded-xl text-white max-w-sm">
        <h3 className="text-xl font-bold mb-4">🛰️ Orbital Analysis</h3>
        <div className="space-y-3 text-sm">
          <div>Status: <span className="text-green-400">In Target Orbit</span></div>
          <div>Orbital Period: {missionAnalysis ? Math.round(missionAnalysis.orbitalPeriod) : 'Calculating...'} min</div>
          <div>Velocity: {missionAnalysis ? Math.round(missionAnalysis.orbitalVelocity).toLocaleString() : 'Calculating...'} m/s</div>
          <div>Apogee: {missionAnalysis ? Math.round(missionAnalysis.apogee).toLocaleString() : 'Calculating...'} km</div>
          <div>Perigee: {missionAnalysis ? Math.round(missionAnalysis.perigee).toLocaleString() : 'Calculating...'} km</div>
        </div>
        
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="w-full mt-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-3 rounded font-bold transition-colors touch-manipulation"
        >
          {isSimulating ? 'Running Analysis...' : 'Complete Mission'}
        </button>
      </div>
    </div>
  )

  // Results phase
  const renderResults = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black text-white p-6 flex items-center justify-center">
      <motion.div
        className="max-w-4xl w-full bg-black/80 backdrop-blur rounded-2xl p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className={`text-6xl mb-4 ${results?.success ? 'text-green-400' : 'text-red-400'}`}>
            {results?.success ? '🎉' : '💥'}
          </div>
          <h2 className="text-4xl font-bold mb-2">
            Mission {results?.success ? 'Successful!' : 'Failed'}
          </h2>
          <div className="text-2xl text-blue-400">Score: {results?.score}/100</div>
        </div>
        
        {results && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-yellow-400">Mission Statistics</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-900/50 rounded">
                  <span>Delta-V Used:</span>
                  <span>{Math.round(results.deltaV).toLocaleString()} m/s</span>
                </div>
                
                <div className="flex justify-between p-3 bg-gray-900/50 rounded">
                  <span>Fuel Consumed:</span>
                  <span>{Math.round(results.fuelConsumption).toLocaleString()} kg</span>
                </div>
                
                <div className="flex justify-between p-3 bg-gray-900/50 rounded">
                  <span>Orbit Accuracy:</span>
                  <span className={results.orbitAccuracy > 80 ? 'text-green-400' : 'text-yellow-400'}>
                    {results.orbitAccuracy.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between p-3 bg-gray-900/50 rounded">
                  <span>Mission Duration:</span>
                  <span>{results.missionTime.toFixed(1)} minutes</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-yellow-400">Analysis Report</h3>
              
              {results.issues.length > 0 && (
                <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">Issues Detected:</h4>
                  <ul className="space-y-1">
                    {results.issues.map((issue, index) => (
                      <li key={index} className="text-sm">• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
                <h4 className="font-bold text-blue-400 mb-2">Recommendations:</h4>
                <ul className="text-sm space-y-1">
                  {results.orbitAccuracy < 90 && <li>• Consider higher precision guidance systems</li>}
                  {results.fuelConsumption > missionParams.fuel * 0.9 && <li>• Increase fuel reserves for safety margin</li>}
                  {results.success && <li>• Excellent mission execution!</li>}
                  <li>• Mission parameters logged for future reference</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => {
              setCurrentStep('setup')
              setResults(null)
            }}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            Plan New Mission
          </button>
          
          <button
            onClick={() => setCurrentStep('orbit')}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
          >
            Review Orbit
          </button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      {/* Loading Overlay */}
      {isSimulating && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-white text-center">
            <motion.div
              className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <h3 className="text-2xl font-bold mb-2">Analyzing Mission Performance</h3>
            <p className="text-gray-300">Computing orbital mechanics and fuel efficiency...</p>
          </div>
        </motion.div>
      )}
      
      {/* Step Navigation */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 bg-black/80 backdrop-blur rounded-full px-6 py-3">
        <div className="flex items-center space-x-4 text-white text-sm">
          {[
            { id: 'setup', name: 'Mission Setup', icon: '⚙️' },
            { id: 'launch', name: 'Launch', icon: '🚀' },
            { id: 'orbit', name: 'Orbit', icon: '🛰️' },
            { id: 'results', name: 'Results', icon: '📊' }
          ].map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                px-3 py-2 rounded-full text-xs font-bold
                ${currentStep === step.id ? 'bg-blue-600 text-white' : 
                  ['launch', 'orbit', 'results'].includes(currentStep) && index < 
                  (['setup', 'launch', 'orbit', 'results'].indexOf(currentStep)) 
                  ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}
              `}>
                <span className="mr-1">{step.icon}</span>
                {step.name}
              </div>
              {index < 3 && <div className="w-8 h-px bg-gray-600 mx-2"></div>}
            </div>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      <div className="pt-20">
        {currentStep === 'setup' && renderSetupForm()}
        {currentStep === 'launch' && renderLaunchPhase()}
        {currentStep === 'orbit' && renderOrbitPhase()}
        {currentStep === 'results' && renderResults()}
      </div>
    </div>
  )
}