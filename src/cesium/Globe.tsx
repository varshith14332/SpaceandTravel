'use client'

import React from 'react'
// @ts-expect-error - CesiumGlobeComponent has no types
import CesiumGlobeComponent from './CesiumGlobeComponent.tsx'

interface GlobeProps {
  showSatellites?: boolean
  showISS?: boolean
  showDebris?: boolean
  showWeather?: boolean
}

export default function Globe({ 
  showSatellites = true, 
  showISS = true, 
  showDebris = false,
  showWeather = false 
}: GlobeProps) {
  return (
    <div className="w-full h-screen relative">
      <CesiumGlobeComponent 
        showSatellites={showSatellites}
        showISS={showISS}
        showDebris={showDebris}
        showWeather={showWeather}
      />
    </div>
  )
}
