// Advanced orbital mechanics calculations for mission simulation

export interface OrbitalParameters {
  altitude: number; // km
  inclination: number; // degrees
  eccentricity: number;
  argumentOfPeriapsis?: number; // degrees
  longitudeOfAscendingNode?: number; // degrees
  trueAnomaly?: number; // degrees
}

export interface LaunchSite {
  name: string;
  latitude: number; // degrees
  longitude: number; // degrees
  elevation: number; // meters
}

export interface MissionCalculations {
  deltaV: number; // m/s
  burnTime: number; // seconds
  fuelRequired: number; // kg
  orbitalPeriod: number; // minutes
  orbitalVelocity: number; // m/s
  apogee: number; // km
  perigee: number; // km
  launchWindow: {
    start: Date;
    end: Date;
    optimal: Date;
  };
  planeChangeRequired: boolean;
  planeChangeDeltaV: number; // m/s
}

// Physical constants
const EARTH_RADIUS = 6371; // km
const EARTH_MU = 398600.4418; // km³/s²
const EARTH_ROTATION_RATE = 7.2921159e-5; // rad/s
const STANDARD_GRAVITY = 9.81; // m/s²

// Launch sites data
export const LAUNCH_SITES: Record<string, LaunchSite> = {
  'Kennedy Space Center': {
    name: 'Kennedy Space Center',
    latitude: 28.5721,
    longitude: -80.6480,
    elevation: 3
  },
  'Baikonur Cosmodrome': {
    name: 'Baikonur Cosmodrome',
    latitude: 45.9200,
    longitude: 63.3400,
    elevation: 144
  },
  'Guiana Space Centre': {
    name: 'Guiana Space Centre',
    latitude: 5.2362,
    longitude: -52.7683,
    elevation: 9
  },
  'Vandenberg SFB': {
    name: 'Vandenberg Space Force Base',
    latitude: 34.7420,
    longitude: -120.5724,
    elevation: 112
  }
};

// Rocket engine specifications
export interface EngineSpecs {
  specificImpulse: number; // seconds
  thrust: number; // N
  massFlowRate: number; // kg/s
  burnTime: number; // seconds
  efficiency: number; // 0-1
}

export const ROCKET_ENGINES: Record<string, EngineSpecs> = {
  'Merlin 1D': {
    specificImpulse: 282,
    thrust: 845000,
    massFlowRate: 305,
    burnTime: 162,
    efficiency: 0.85
  },
  'RS-25': {
    specificImpulse: 452,
    thrust: 2279000,
    massFlowRate: 514,
    burnTime: 480,
    efficiency: 0.91
  },
  'RD-180': {
    specificImpulse: 311,
    thrust: 3827000,
    massFlowRate: 1256,
    burnTime: 236,
    efficiency: 0.87
  }
};

/**
 * Calculate orbital velocity at given altitude
 */
export function calculateOrbitalVelocity(altitude: number): number {
  const radius = (EARTH_RADIUS + altitude) * 1000; // Convert to meters
  return Math.sqrt(EARTH_MU * 1e9 / radius); // m/s
}

/**
 * Calculate orbital period
 */
export function calculateOrbitalPeriod(altitude: number): number {
  const radius = (EARTH_RADIUS + altitude) * 1000; // Convert to meters
  const period = 2 * Math.PI * Math.sqrt(Math.pow(radius, 3) / (EARTH_MU * 1e9));
  return period / 60; // Convert to minutes
}

/**
 * Calculate delta-V requirements for orbit insertion
 */
export function calculateDeltaV(
  targetOrbit: OrbitalParameters,
  launchSite: LaunchSite
): number {
  // Circular orbit velocity
  const targetVelocity = calculateOrbitalVelocity(targetOrbit.altitude);
  
  // Earth rotation velocity at launch site
  const launchSiteRadius = (EARTH_RADIUS + launchSite.elevation / 1000) * 1000;
  const earthRotationVelocity = EARTH_ROTATION_RATE * launchSiteRadius * 
    Math.cos(launchSite.latitude * Math.PI / 180);
  
  // Gravity losses (simplified)
  const gravityLoss = 1500; // m/s (typical for LEO)
  
  // Atmospheric drag losses
  const dragLoss = 300; // m/s (typical)
  
  // Basic delta-V calculation
  let deltaV = targetVelocity - earthRotationVelocity + gravityLoss + dragLoss;
  
  // Add plane change penalty if inclination is less than launch site latitude
  if (targetOrbit.inclination < Math.abs(launchSite.latitude)) {
    const planeChangeDV = 2 * targetVelocity * 
      Math.sin(Math.abs(targetOrbit.inclination - Math.abs(launchSite.latitude)) * Math.PI / 360);
    deltaV += planeChangeDV;
  }
  
  // Eccentricity penalty
  if (targetOrbit.eccentricity > 0.01) {
    deltaV += targetVelocity * targetOrbit.eccentricity * 0.5;
  }
  
  return Math.max(deltaV, 7800); // Minimum for LEO
}

/**
 * Calculate fuel requirements based on rocket equation
 */
export function calculateFuelRequirements(
  deltaV: number,
  payloadMass: number,
  engine: EngineSpecs,
  structuralMassRatio: number = 0.1
): number {
  const exhaustVelocity = engine.specificImpulse * STANDARD_GRAVITY;
  const massRatio = Math.exp(deltaV / exhaustVelocity);
  
  // Total initial mass required
  const totalInitialMass = payloadMass / (1 - structuralMassRatio) * massRatio;
  
  // Fuel mass
  const fuelMass = totalInitialMass - payloadMass - (totalInitialMass * structuralMassRatio);
  
  return Math.max(fuelMass, 0);
}

/**
 * Calculate launch window for optimal conditions
 */
export function calculateLaunchWindow(
  targetOrbit: OrbitalParameters,
  launchSite: LaunchSite,
  targetDate: Date = new Date()
): { start: Date; end: Date; optimal: Date } {
  // Simplified launch window calculation
  // In reality, this would consider orbital mechanics, lighting conditions, etc.
  
  const optimal = new Date(targetDate);
  optimal.setHours(12, 0, 0, 0); // Noon UTC for simplicity
  
  const start = new Date(optimal);
  start.setHours(optimal.getHours() - 2); // 2-hour window before
  
  const end = new Date(optimal);
  end.setHours(optimal.getHours() + 2); // 2-hour window after
  
  return { start, end, optimal };
}

/**
 * Comprehensive mission analysis
 */
export function analyzeMission(
  targetOrbit: OrbitalParameters,
  payloadMass: number,
  availableFuel: number,
  launchSiteName: string,
  engineType: string = 'Merlin 1D'
): MissionCalculations {
  const launchSite = LAUNCH_SITES[launchSiteName];
  const engine = ROCKET_ENGINES[engineType];
  
  if (!launchSite || !engine) {
    throw new Error('Invalid launch site or engine type');
  }
  
  const deltaV = calculateDeltaV(targetOrbit, launchSite);
  const fuelRequired = calculateFuelRequirements(deltaV, payloadMass, engine);
  const orbitalVelocity = calculateOrbitalVelocity(targetOrbit.altitude);
  const orbitalPeriod = calculateOrbitalPeriod(targetOrbit.altitude);
  
  // Calculate apogee and perigee for elliptical orbits
  const semiMajorAxis = EARTH_RADIUS + targetOrbit.altitude;
  const apogee = semiMajorAxis * (1 + targetOrbit.eccentricity) - EARTH_RADIUS;
  const perigee = semiMajorAxis * (1 - targetOrbit.eccentricity) - EARTH_RADIUS;
  
  // Burn time calculation
  const burnTime = fuelRequired / engine.massFlowRate;
  
  // Plane change requirements
  const planeChangeRequired = targetOrbit.inclination < Math.abs(launchSite.latitude);
  const planeChangeDeltaV = planeChangeRequired ? 
    2 * orbitalVelocity * Math.sin(Math.abs(targetOrbit.inclination - Math.abs(launchSite.latitude)) * Math.PI / 360) : 0;
  
  const launchWindow = calculateLaunchWindow(targetOrbit, launchSite);
  
  return {
    deltaV,
    burnTime,
    fuelRequired,
    orbitalPeriod,
    orbitalVelocity,
    apogee,
    perigee,
    launchWindow,
    planeChangeRequired,
    planeChangeDeltaV
  };
}

/**
 * Calculate mission success probability
 */
export function calculateSuccessProbability(
  calculations: MissionCalculations,
  availableFuel: number,
  weatherConditions: number = 0.8, // 0-1 scale
  vehicleReliability: number = 0.95 // 0-1 scale
): number {
  let successProbability = vehicleReliability * weatherConditions;
  
  // Fuel margin factor
  const fuelMargin = (availableFuel - calculations.fuelRequired) / calculations.fuelRequired;
  if (fuelMargin < 0) {
    return 0; // Insufficient fuel
  } else if (fuelMargin < 0.1) {
    successProbability *= 0.6; // Very tight margins
  } else if (fuelMargin < 0.2) {
    successProbability *= 0.8; // Tight margins
  }
  
  // Complexity penalties
  if (calculations.planeChangeRequired) {
    successProbability *= 0.9; // Plane changes add complexity
  }
  
  if (calculations.deltaV > 12000) {
    successProbability *= 0.85; // High energy missions are riskier
  }
  
  return Math.min(successProbability, 0.99); // Cap at 99%
}

/**
 * Generate mission timeline
 */
export function generateMissionTimeline(calculations: MissionCalculations): Array<{
  time: number; // seconds from launch
  event: string;
  description: string;
}> {
  const timeline = [];
  
  timeline.push({
    time: 0,
    event: 'Launch',
    description: 'Rocket engines ignition and liftoff'
  });
  
  timeline.push({
    time: 120,
    event: 'Max Q',
    description: 'Maximum dynamic pressure'
  });
  
  timeline.push({
    time: 150,
    event: 'Booster Separation',
    description: 'First stage separation'
  });
  
  timeline.push({
    time: 180,
    event: 'Second Stage Ignition',
    description: 'Upper stage engine start'
  });
  
  timeline.push({
    time: calculations.burnTime + 180,
    event: 'SECO',
    description: 'Second stage engine cutoff'
  });
  
  timeline.push({
    time: calculations.burnTime + 300,
    event: 'Payload Deployment',
    description: 'Spacecraft separation from launcher'
  });
  
  if (calculations.planeChangeRequired) {
    timeline.push({
      time: calculations.orbitalPeriod * 60 * 0.5, // Half orbit later
      event: 'Plane Change Maneuver',
      description: 'Orbital inclination adjustment'
    });
  }
  
  return timeline.sort((a, b) => a.time - b.time);
}