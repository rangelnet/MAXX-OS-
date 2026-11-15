import { Hologram3D } from './Hologram3D.tsx'
import {
  type HologramPalette,
  type HologramVisualState,
  type PerformanceTier,
} from './types.ts'

export interface HologramCanvasProps {
  visualState: HologramVisualState
  palette?: HologramPalette
  tier?: PerformanceTier
  reducedMotion?: boolean
  audioLevel?: number
  className?: string
  width?: number
  height?: number
  cameraMode?: 'auto' | 'front' | 'perspective45' | 'profile'
  speakingOverride?: boolean
  interactive?: boolean
}

export function HologramCanvas({
  visualState,
  palette,
  tier = 'balanced',
  reducedMotion,
  audioLevel = 0,
  className = '',
  width = 640,
  height = 480,
  cameraMode = 'auto',
  speakingOverride = false,
  interactive = true,
}: HologramCanvasProps) {
  return (
    <Hologram3D
      visualState={visualState}
      palette={palette}
      tier={tier}
      reducedMotion={reducedMotion}
      audioLevel={audioLevel}
      className={className}
      width={width}
      height={height}
      cameraMode={cameraMode}
      speakingOverride={speakingOverride}
      interactive={interactive}
    />
  )
}
