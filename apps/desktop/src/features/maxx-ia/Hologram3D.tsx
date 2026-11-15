import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import femaleHeadData from './female-head-data.json'
import {
  type HologramPalette,
  type HologramVisualState,
  type PerformanceTier,
  STATE_CONFIGS,
} from './types.ts'

export interface Hologram3DProps {
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

// Procedural textures for glowing neural particles and starry constellation nodes
function createParticleTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)')
    gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.05)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  return texture
}

function createStarNodeTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    // 4-point glowing star
    ctx.translate(32, 32)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 28)
    g.addColorStop(0, 'rgba(255, 255, 255, 1)')
    g.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)')
    g.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)')
    g.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, 0, 24, 0, Math.PI * 2)
    ctx.fill()

    // Cross flares
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(-24, -1, 48, 2)
    ctx.fillRect(-1, -24, 2, 48)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  return texture
}

export function Hologram3D({
  visualState,
  tier = 'balanced',
  reducedMotion = false,
  audioLevel = 0,
  className = '',
  width,
  height,
  cameraMode = 'auto',
  speakingOverride = false,
  interactive = true,
}: Hologram3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCompatibility, setIsCompatibility] = useState(tier === 'compatibility')

  const stateRef = useRef({
    visualState,
    tier,
    reducedMotion,
    audioLevel,
    cameraMode,
    speakingOverride,
  })

  useEffect(() => {
    stateRef.current = {
      visualState,
      tier,
      reducedMotion,
      audioLevel,
      cameraMode,
      speakingOverride,
    }
    setIsCompatibility(tier === 'compatibility')
  }, [visualState, tier, reducedMotion, audioLevel, cameraMode, speakingOverride])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl || tier === 'compatibility') {
      setIsCompatibility(true)
      return
    }

    // 1. Setup Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const container = containerRef.current || canvas.parentElement
    const initialWidth = width || container?.clientWidth || 560
    const initialHeight = height || container?.clientHeight || 420

    const camera = new THREE.PerspectiveCamera(35, initialWidth / initialHeight, 0.1, 100)
    camera.position.set(0, 0, 11.2)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: tier !== 'eco',
        powerPreference: 'high-performance',
      })
    } catch {
      setIsCompatibility(true)
      return
    }

    renderer.setSize(initialWidth, initialHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier === 'high' ? 2 : 1.5))

    // 2. Groups
    const masterGroup = new THREE.Group()
    scene.add(masterGroup)

    const headGroup = new THREE.Group()
    headGroup.position.set(0, 0.15, 0)
    masterGroup.add(headGroup)

    const auraGroup = new THREE.Group()
    auraGroup.position.set(0, 0.15, 0)
    masterGroup.add(auraGroup)

    const baseGroup = new THREE.Group()
    baseGroup.position.set(0, -3.2, 0)
    masterGroup.add(baseGroup)

    const crownGroup = new THREE.Group()
    crownGroup.position.set(0, 3.6, 0)
    masterGroup.add(crownGroup)

    // Dynamic Theme Tokens
    const getThemeColors = () => {
      const styles = getComputedStyle(canvas)
      const accent = styles.getPropertyValue('--color-accent').trim() || '#2fd1c5'
      const accentStrong = styles.getPropertyValue('--color-accent-strong').trim() || '#1d8f85'
      const accentSoft = styles.getPropertyValue('--color-accent-soft').trim() || '#6ee7de'
      return {
        accent: new THREE.Color(accent),
        accentStrong: new THREE.Color(accentStrong),
        accentSoft: new THREE.Color(accentSoft),
        // Secondary contrast highlight (magenta/violet for cosmic depth like reference)
        secondary: new THREE.Color('#9d4edd'),
      }
    }

    let currentTheme = getThemeColors()
    const particleTex = createParticleTexture()
    const starTex = createStarNodeTexture()

    // 3. Shaders & Materials
    // Refined Fresnel Hologram Shader (Delicate feminine luminescence with FrontSide culling)
    const fresnelVertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vPosition = position;
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `

    const fresnelFragmentShader = `
      uniform vec3 uColor;
      uniform vec3 uAccent;
      uniform float uTime;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        
        // Soft, high-precision Fresnel rim lighting
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);
        
        // Ethereal vertical energy shimmer & scanlines
        float scanline = sin(vPosition.y * 36.0 - uTime * 2.5) * 0.07 + 0.93;
        float shimmer = sin(vPosition.x * 10.0 + vPosition.z * 10.0 + uTime * 3.0) * 0.05 + 0.95;
        
        // Deep ethereal glow in center, brilliant radiant turquoise/accent on delicate outer contours
        vec3 col = mix(uColor * 0.30, uAccent, fresnel * 0.90);
        float alpha = clamp((fresnel * 0.75 + 0.09) * uIntensity * scanline * shimmer, 0.0, 0.88);
        gl_FragColor = vec4(col, alpha);
      }
    `

    const fresnelMaterial = new THREE.ShaderMaterial({
      vertexShader: fresnelVertexShader,
      fragmentShader: fresnelFragmentShader,
      uniforms: {
        uColor: { value: currentTheme.accent },
        uAccent: { value: currentTheme.accentSoft },
        uTime: { value: 0 },
        uIntensity: { value: 0.85 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      depthWrite: false,
    })

    // Delicate Neural Wireframe Material
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: currentTheme.accent,
      transparent: true,
      opacity: tier === 'high' ? 0.22 : 0.16,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
    })

    // Surface Neural Particles
    const pointsMaterial = new THREE.PointsMaterial({
      color: currentTheme.accentSoft,
      size: tier === 'high' ? 0.10 : 0.14,
      map: particleTex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      sizeAttenuation: true,
    })

    // 4. Construct Feminine Face Geometry from Embedded Model
    const faceGeom = new THREE.BufferGeometry()
    faceGeom.setAttribute('position', new THREE.Float32BufferAttribute(femaleHeadData.positions, 3))
    faceGeom.setAttribute('normal', new THREE.Float32BufferAttribute(femaleHeadData.normals, 3))
    faceGeom.setIndex(femaleHeadData.indices)
    faceGeom.computeVertexNormals()
    faceGeom.center()

    // Scale so feminine head height is ~6.5 units
    const bounds = new THREE.Box3().setFromBufferAttribute(faceGeom.attributes.position as THREE.BufferAttribute)
    const size = new THREE.Vector3()
    bounds.getSize(size)
    const scaleFactor = 6.5 / size.y
    faceGeom.scale(scaleFactor, scaleFactor, scaleFactor)
    faceGeom.computeVertexNormals()

    const basePositions = new Float32Array(faceGeom.attributes.position.array)

    // Layer 1: Fresnel Glow Mesh
    const headMesh = new THREE.Mesh(faceGeom, fresnelMaterial)
    headGroup.add(headMesh)

    // Layer 2: Wireframe Neural Grid
    const wireGeom = new THREE.WireframeGeometry(faceGeom)
    const wireframeLines = new THREE.LineSegments(wireGeom, wireframeMaterial)
    headGroup.add(wireframeLines)

    // Layer 3: Surface Particle Points
    const pointCloud = new THREE.Points(faceGeom, pointsMaterial)
    headGroup.add(pointCloud)

    // Layer 4: Delicate Eyeliner Contours (following exact 3D facial mesh vertices)
    const posAttr = faceGeom.attributes.position as THREE.BufferAttribute
    const eyelidPositions: number[] = []
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i)
      const y = posAttr.getY(i)
      const z = posAttr.getZ(i)
      if (Math.abs(x) > 0.45 && Math.abs(x) < 1.15 && y > 0.55 && y < 0.85 && z > 2.3) {
        eyelidPositions.push(x, y, z)
      }
    }
    const eyelidGeom = new THREE.BufferGeometry()
    eyelidGeom.setAttribute('position', new THREE.Float32BufferAttribute(eyelidPositions, 3))
    const eyelidMat = new THREE.PointsMaterial({
      color: currentTheme.accentSoft,
      size: 0.15,
      map: particleTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      sizeAttenuation: true,
    })
    const eyelidPoints = new THREE.Points(eyelidGeom, eyelidMat)
    headGroup.add(eyelidPoints)

    // 5. Flowing Ethereal Energy Tendrils / Neural Waves (Like Reference)
    // 8 curving ribbon strips billowing out from the head
    const ribbonMeshes: THREE.Mesh[] = []
    const ribbonCount = tier === 'high' ? 8 : 4

    const ribbonVertexShader = `
      uniform float uTime;
      uniform float uOffset;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        
        // Harmonic billowing motion
        float wave1 = sin(pos.y * 1.5 - uTime * 2.0 + uOffset) * 0.35;
        float wave2 = cos(pos.y * 2.2 - uTime * 1.6 + uOffset * 1.5) * 0.25;
        pos.x += wave1 * (1.0 - uv.y * 0.3);
        pos.z += wave2 * (1.0 - uv.y * 0.3);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `

    const ribbonFragmentShader = `
      uniform vec3 uColor;
      uniform vec3 uAccent;
      varying vec2 vUv;
      void main() {
        // Spine glow: brightest in center, fading smoothly to edges
        float spine = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 2.2);
        // Vertical fade: soft start and delicate tapered tip
        float vertical = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.65, vUv.y);
        
        vec3 col = mix(uColor, uAccent, vUv.y * 0.8);
        float alpha = spine * vertical * 0.45;
        gl_FragColor = vec4(col, alpha);
      }
    `

    for (let r = 0; r < ribbonCount; r++) {
      const angle = (r / ribbonCount) * Math.PI * 2
      const ribbonGeom = new THREE.PlaneGeometry(0.85, 7.5, 8, 32)
      const ribbonMat = new THREE.ShaderMaterial({
        vertexShader: ribbonVertexShader,
        fragmentShader: ribbonFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uOffset: { value: r * 1.2 },
          uColor: { value: currentTheme.accent },
          uAccent: { value: currentTheme.accentSoft },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })

      const mesh = new THREE.Mesh(ribbonGeom, ribbonMat)
      // Position around crown and temples curving outwards
      mesh.position.set(Math.cos(angle) * 1.8, 1.2 - r * 0.15, Math.sin(angle) * 1.4)
      mesh.rotation.y = angle + Math.PI / 2
      mesh.rotation.z = (Math.random() - 0.5) * 0.3
      auraGroup.add(mesh)
      ribbonMeshes.push(mesh)
    }

    // 6. Luminous Neural Constellation Network (Synaptic Starfield like Reference)
    const nodeCount = tier === 'high' ? 90 : 45
    const nodePositions: THREE.Vector3[] = []
    const nodeColors: number[] = []

    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI
      const rad = 3.2 + Math.random() * 2.6
      const pos = new THREE.Vector3(
        rad * Math.cos(phi) * Math.sin(theta),
        rad * Math.sin(phi) + 0.4,
        rad * Math.cos(phi) * Math.cos(theta) * 0.85
      )
      nodePositions.push(pos)

      // Tri-color distribution: primary accent, secondary magenta, white spark
      const colRand = Math.random()
      if (colRand < 0.6) {
        nodeColors.push(currentTheme.accentSoft.r, currentTheme.accentSoft.g, currentTheme.accentSoft.b)
      } else if (colRand < 0.85) {
        nodeColors.push(currentTheme.secondary.r, currentTheme.secondary.g, currentTheme.secondary.b)
      } else {
        nodeColors.push(1, 1, 1) // diamond white spark
      }
    }

    // Star node points
    const starGeom = new THREE.BufferGeometry().setFromPoints(nodePositions)
    starGeom.setAttribute('color', new THREE.Float32BufferAttribute(nodeColors, 3))
    const starMat = new THREE.PointsMaterial({
      size: 0.28,
      map: starTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const starPoints = new THREE.Points(starGeom, starMat)
    auraGroup.add(starPoints)

    // Dynamic Filaments connecting nearby nodes
    const lineIndices: number[] = []
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 1.85) {
          lineIndices.push(i, j)
        }
      }
    }

    const filamentGeom = new THREE.BufferGeometry().setFromPoints(nodePositions)
    filamentGeom.setIndex(lineIndices)
    const filamentMat = new THREE.LineBasicMaterial({
      color: currentTheme.accent,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const filamentLines = new THREE.LineSegments(filamentGeom, filamentMat)
    auraGroup.add(filamentLines)

    // 7. Holographic Pedestal Dais Rings & Crown Halo
    // Base Rings (3 concentric rings beneath chin)
    const baseRings: THREE.Mesh[] = []
    for (let b = 0; b < 3; b++) {
      const rInner = 3.6 + b * 0.7
      const rOuter = rInner + 0.05
      const ringGeom = new THREE.RingGeometry(rInner, rOuter, 64)
      const ringMat = new THREE.MeshBasicMaterial({
        color: b === 0 ? currentTheme.accentSoft : currentTheme.accent,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55 - b * 0.12,
        blending: THREE.AdditiveBlending,
      })
      const ring = new THREE.Mesh(ringGeom, ringMat)
      ring.rotation.x = Math.PI / 2
      ring.position.y = -b * 0.22
      baseGroup.add(ring)
      baseRings.push(ring)
    }

    // Crown Halo Rings (2 tilted elliptical rings above head)
    const crownRings: THREE.Mesh[] = []
    for (let c = 0; c < 2; c++) {
      const crInner = 2.8 + c * 0.6
      const crOuter = crInner + 0.04
      const cRingGeom = new THREE.RingGeometry(crInner, crOuter, 64)
      const cRingMat = new THREE.MeshBasicMaterial({
        color: c === 0 ? currentTheme.accentSoft : currentTheme.accent,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45 - c * 0.10,
        blending: THREE.AdditiveBlending,
      })
      const cRing = new THREE.Mesh(cRingGeom, cRingMat)
      cRing.rotation.x = Math.PI * 0.42 + c * 0.15
      cRing.rotation.y = (c - 0.5) * 0.25
      cRing.position.y = c * 0.35
      crownGroup.add(cRing)
      crownRings.push(cRing)
    }

    // 8. Stereo Audio Frequency Spectrum (Flanking Left & Right like Official Reference)
    const barCountPerSide = 18
    const totalBars = barCountPerSide * 2
    const barGeom = new THREE.BufferGeometry()
    const barPositions = new Float32Array(totalBars * 2 * 3)

    for (let s = 0; s < 2; s++) {
      const sign = s === 0 ? -1 : 1
      for (let i = 0; i < barCountPerSide; i++) {
        const idx = (s * barCountPerSide + i) * 6
        // Position bars outward from 2.4 to 7.8, leaving center face 100% clear
        const x = sign * (2.4 + (i / (barCountPerSide - 1)) * 5.4)
        barPositions[idx] = x
        barPositions[idx + 1] = -0.65 + 0.15
        barPositions[idx + 2] = -0.4
        barPositions[idx + 3] = x
        barPositions[idx + 4] = -0.65 - 0.15
        barPositions[idx + 5] = -0.4
      }
    }
    barGeom.setAttribute('position', new THREE.BufferAttribute(barPositions, 3))
    const barMat = new THREE.LineBasicMaterial({
      color: currentTheme.accentSoft,
      transparent: true,
      opacity: 0.70,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const audioSpectrumLines = new THREE.LineSegments(barGeom, barMat)
    masterGroup.add(audioSpectrumLines)

    // 9. Interactive Mouse Cursor Tracking
    let mouseX = 0
    let mouseY = 0
    let targetYaw = 0
    let targetPitch = 0

    const onMouseMove = (e: MouseEvent) => {
      if (!interactive || stateRef.current.cameraMode !== 'auto') return
      const rect = canvas.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      mouseX = nx
      mouseY = ny
    }

    window.addEventListener('mousemove', onMouseMove)

    // 10. Animation Loop
    let animId: number
    let clock = new THREE.Clock()
    let lastThemeCheck = 0

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop)

      const time = clock.getElapsedTime()
      const { visualState, reducedMotion, audioLevel, cameraMode, speakingOverride } =
        stateRef.current

      // Dynamic Theme Sync (sample tokens every 250ms)
      if (time - lastThemeCheck > 0.25) {
        lastThemeCheck = time
        const nextTheme = getThemeColors()
        fresnelMaterial.uniforms.uColor.value.copy(nextTheme.accent)
        fresnelMaterial.uniforms.uAccent.value.copy(nextTheme.accentSoft)
        wireframeMaterial.color.copy(nextTheme.accent)
        pointsMaterial.color.copy(nextTheme.accentSoft)
        filamentMat.color.copy(nextTheme.accent)
        barMat.color.copy(nextTheme.accentSoft)
        for (const rib of ribbonMeshes) {
          const mat = rib.material as THREE.ShaderMaterial
          mat.uniforms.uColor.value.copy(nextTheme.accent)
          mat.uniforms.uAccent.value.copy(nextTheme.accentSoft)
        }
        for (const br of baseRings) {
          ;(br.material as THREE.MeshBasicMaterial).color.copy(nextTheme.accent)
        }
        for (const cr of crownRings) {
          ;(cr.material as THREE.MeshBasicMaterial).color.copy(nextTheme.accentSoft)
        }
      }

      // Update shader time
      fresnelMaterial.uniforms.uTime.value = time
      const stateCfg = STATE_CONFIGS[visualState] || STATE_CONFIGS.ready
      fresnelMaterial.uniforms.uIntensity.value =
        0.82 + Math.sin(time * stateCfg.pulseFrequency) * 0.12

      // Animate flowing ribbon tendrils
      for (const rib of ribbonMeshes) {
        const mat = rib.material as THREE.ShaderMaterial
        mat.uniforms.uTime.value = time
      }

      // Rotate Constellation & Dais Rings
      if (!reducedMotion) {
        auraGroup.rotation.y = time * 0.12 * stateCfg.speedMultiplier
        baseGroup.rotation.z = time * 0.18 * stateCfg.speedMultiplier
        crownGroup.rotation.z = -time * 0.22 * stateCfg.speedMultiplier
      }

      // Camera Angles & 3D Perspective
      if (cameraMode === 'front') {
        targetYaw = 0
        targetPitch = 0
        camera.position.set(0, 0, 11.2)
        camera.lookAt(0, 0, 0)
      } else if (cameraMode === 'perspective45') {
        targetYaw = Math.PI * 0.25 // 45 degrees
        targetPitch = -0.06
        camera.position.set(0, 0, 11.2)
        camera.lookAt(0, 0, 0)
      } else if (cameraMode === 'profile') {
        targetYaw = Math.PI * 0.48
        targetPitch = 0
        camera.position.set(0, 0, 11.2)
        camera.lookAt(0, 0, 0)
      } else {
        camera.position.set(0, 0, 11.2)
        camera.lookAt(0, 0, 0)
        if (!reducedMotion) {
          const swayYaw = Math.sin(time * 0.55) * 0.14 + mouseX * 0.20
          const swayPitch = Math.cos(time * 0.75) * 0.05 + mouseY * 0.12
          targetYaw = THREE.MathUtils.lerp(targetYaw, swayYaw, 0.05)
          targetPitch = THREE.MathUtils.lerp(targetPitch, swayPitch, 0.05)
        } else {
          targetYaw = 0
          targetPitch = 0
        }
      }

      headGroup.rotation.y = targetYaw
      headGroup.rotation.x = targetPitch

      // Floating elevation
      headGroup.position.y = !reducedMotion ? 0.15 + Math.sin(time * 1.2) * 0.10 : 0.15

      // 11. Animate Stereo Audio Frequency Spectrum Bars (Like Reference Image)
      const barPosAttr = barGeom.attributes.position as THREE.BufferAttribute
      const barArr = barPosAttr.array as Float32Array
      const isSpeaking =
        speakingOverride ||
        visualState === 'speaking' ||
        visualState === 'streaming' ||
        audioLevel > 0.05

      const baseAmp = isSpeaking ? 0.75 + audioLevel * 1.4 : 0.25
      for (let s = 0; s < 2; s++) {
        for (let i = 0; i < barCountPerSide; i++) {
          const idx = (s * barCountPerSide + i) * 6
          const envelope = Math.sin(((i + 1) / (barCountPerSide + 1)) * Math.PI)
          const freq =
            Math.abs(Math.sin(i * 0.65 - time * 6.5 + s * 1.5)) * 0.7 +
            Math.abs(Math.cos(i * 1.25 + time * 3.8)) * 0.3
          const h = freq * baseAmp * envelope + 0.06

          barArr[idx + 1] = -0.65 + h
          barArr[idx + 4] = -0.65 - h
        }
      }
      barPosAttr.needsUpdate = true

      // 12. 3D Facial Articulation (Speaking / Pronunciation)
      if (headMesh && basePositions) {
        const geom = headMesh.geometry
        const posAttr = geom.attributes.position as THREE.BufferAttribute
        const posArray = posAttr.array as Float32Array
        const count = posAttr.count

        if (isSpeaking) {
          const mouthOpen = Math.abs(Math.sin(time * 16.0)) * (0.28 + audioLevel * 0.35)

          for (let i = 0; i < count; i++) {
            const bx = basePositions[i * 3]
            const by = basePositions[i * 3 + 1]
            const bz = basePositions[i * 3 + 2]

            // Articulate lower lip and jaw vertices (delicate feminine mouth: by in [-1.5, -0.4], |bx| < 0.6, bz > 2.0)
            if (by < -0.4 && by > -1.6 && Math.abs(bx) < 0.8 && bz > 2.0) {
              const weight = (1.0 - Math.min(1.0, Math.abs(bx) / 0.7)) * Math.max(0, -0.4 - by)
              posArray[i * 3 + 1] = by - mouthOpen * weight * 0.40
              posArray[i * 3 + 2] = bz + mouthOpen * weight * 0.15
            } else {
              posArray[i * 3 + 1] = by
              posArray[i * 3 + 2] = bz
            }
          }
          posAttr.needsUpdate = true
          if (wireframeLines) {
            wireframeLines.geometry.dispose()
            wireframeLines.geometry = new THREE.WireframeGeometry(geom)
          }
        } else {
          if (posArray[1] !== basePositions[1]) {
            posArray.set(basePositions)
            posAttr.needsUpdate = true
            if (wireframeLines) {
              wireframeLines.geometry.dispose()
              wireframeLines.geometry = new THREE.WireframeGeometry(geom)
            }
          }
        }
      }

      renderer.render(scene, camera)
    }

    renderLoop()

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        const h = entry.contentRect.height
        if (w > 0 && h > 0) {
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }
      }
    })

    if (container) resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      if (container) resizeObserver.unobserve(container)

      fresnelMaterial.dispose()
      wireframeMaterial.dispose()
      pointsMaterial.dispose()
      starMat.dispose()
      filamentMat.dispose()
      barMat.dispose()
      barGeom.dispose()
      particleTex.dispose()
      starTex.dispose()
      if (headMesh) headMesh.geometry.dispose()
      if (wireframeLines) wireframeLines.geometry.dispose()
      renderer.dispose()
    }
  }, [width, height, tier])

  if (isCompatibility) {
    return <Canvas2DCompatibilityFallback visualState={visualState} className={className} />
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: width || '100%', height: height || '100%' }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full object-contain pointer-events-auto"
        aria-label="Holograma 3D Feminino Neural MAXX IA"
      />
    </div>
  )
}

function Canvas2DCompatibilityFallback({
  visualState,
  className = '',
}: {
  visualState: HologramVisualState
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let t = 0

    const render = () => {
      t += 0.02
      animId = requestAnimationFrame(render)

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const styles = getComputedStyle(canvas)
      const accent = styles.getPropertyValue('--color-accent').trim() || '#2fd1c5'

      ctx.save()
      ctx.translate(w / 2, h / 2)

      const fov = 350
      ctx.strokeStyle = accent
      ctx.lineWidth = 1.2
      ctx.globalAlpha = 0.65

      const yaw = Math.sin(t * 0.8) * 0.35
      const pitch = Math.cos(t * 0.6) * 0.15

      for (let lat = -6; lat <= 6; lat++) {
        const y3d = (lat / 6) * 120
        const r = Math.sqrt(Math.max(0, 14400 - y3d * y3d)) * 0.85

        ctx.beginPath()
        for (let a = 0; a <= Math.PI * 2; a += 0.25) {
          let x = r * Math.cos(a)
          let z = r * Math.sin(a)
          let y = y3d

          const xRot = x * Math.cos(yaw) + z * Math.sin(yaw)
          const zRot = -x * Math.sin(yaw) + z * Math.cos(yaw) + 400
          const yRot = y * Math.cos(pitch) - zRot * Math.sin(pitch)

          const projX = (xRot * fov) / zRot
          const projY = (yRot * fov) / zRot

          if (a === 0) ctx.moveTo(projX, projY)
          else ctx.lineTo(projX, projY)
        }
        ctx.stroke()
      }

      ctx.restore()
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [visualState])

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="h-full w-full object-contain"
        aria-label="Holograma 2D Compatibilidade"
      />
    </div>
  )
}
