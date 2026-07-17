'use client'

import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import {
  Component,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'

import {
  Shape,
  SRGBColorSpace,
  TextureLoader,
  type Mesh,
  type Texture,
} from 'three'

import { getTarot, thumbImage } from '@/content/data'
import {
  cubeEdgeById,
  cubeEdgeIdBySign,
  cubeFaces,
  cubeFlowBySign,
  type CubeFace,
  type CubeFlowDirection,
} from '@/content/data/cube-of-space'
import { useColorPalette } from '@/lib/colorPalette'
import { getColor } from '@/lib/colors'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { useTarotStyle } from '@/lib/tarotStyle'

// Only the structural `color` attribution (a palette key) is read here
// — English on purpose.
const { cardBySlug } = getTarot(DEFAULT_LOCALE)

const HALF = 2
const BORDER_T = 0.12

// ---- Flow animation knobs (tweak freely) ---------------------------------
// Particles per edge, edge-lengths-per-second speed, sphere radius, alpha.
// 12 edges × FLOW_COUNT spheres total; safe well into the hundreds on
// modern phones. Speed is in "fraction of edge length per second" — 0.25
// means a particle takes 4s to traverse an edge.
const FLOW_COUNT = 4
const FLOW_SPEED = 0.25
const FLOW_SIZE = 0.1
const FLOW_OPACITY = 0.5
const FLOW_SEGMENTS = 12

// The edge/face → card attributions and per-edge flow directions live in
// content/data/cube-of-space.json (see its accessor). This file owns only
// the 3D geometry that realizes them.

// Cube corners. Coord convention: +X=east, -X=west, +Y=up, -Y=down,
// +Z=SOUTH, -Z=NORTH. (Facing the Empress on the east face from inside,
// the Tower/north is on your left at -Z and the Sun/south on your right
// at +Z — matching the BOTA diagrams.)
type Vec3 = [number, number, number]
const CORNER: Record<string, Vec3> = {
  'top-SE': [+HALF, +HALF, +HALF],
  'top-SW': [-HALF, +HALF, +HALF],
  'top-NE': [+HALF, +HALF, -HALF],
  'top-NW': [-HALF, +HALF, -HALF],
  'bot-SE': [+HALF, -HALF, +HALF],
  'bot-SW': [-HALF, -HALF, +HALF],
  'bot-NE': [+HALF, -HALF, -HALF],
  'bot-NW': [-HALF, -HALF, -HALF],
}

// Two corners per edge, geometric. Internal — flow directions live in
// content/data/cube-of-space.json, not here.
const EDGE_CORNERS: Record<string, [keyof typeof CORNER, keyof typeof CORNER]> =
  {
    'T-N': ['top-NW', 'top-NE'],
    'T-E': ['top-SE', 'top-NE'],
    'T-S': ['top-SW', 'top-SE'],
    'T-W': ['top-NW', 'top-SW'],
    'B-N': ['bot-NW', 'bot-NE'],
    'B-E': ['bot-SE', 'bot-NE'],
    'B-S': ['bot-SW', 'bot-SE'],
    'B-W': ['bot-NW', 'bot-SW'],
    NE: ['bot-NE', 'top-NE'],
    NW: ['bot-NW', 'top-NW'],
    SE: ['bot-SE', 'top-SE'],
    SW: ['bot-SW', 'top-SW'],
  }

// Sign → edge corners, derived once from the cube data's sign ↔ edge
// mapping. Lets resolveFlow() take a zodiac key directly.
const SIGN_CORNERS: Record<string, [keyof typeof CORNER, keyof typeof CORNER]> =
  Object.fromEntries(
    Object.entries(cubeEdgeIdBySign).map(([sign, edgeId]) => [
      sign,
      EDGE_CORNERS[edgeId],
    ]),
  )

// Resolves a zodiac sign's two corners + direction word into [startVec,
// endVec] for animation. Picks whichever corner is "toward" the direction
// word as the END of the flow.
function resolveFlow(sign: string): [Vec3, Vec3] {
  const [cornerA, cornerB] = SIGN_CORNERS[sign]
  const a = CORNER[cornerA]
  const b = CORNER[cornerB]
  const dir = cubeFlowBySign[sign]
  // axis index: 0=X (east+/west-), 1=Y (up+/down-), 2=Z (south+/north-)
  const axisOf: Record<CubeFlowDirection, 0 | 1 | 2> = {
    east: 0,
    west: 0,
    up: 1,
    down: 1,
    north: 2,
    south: 2,
  }
  const positive: Record<CubeFlowDirection, boolean> = {
    east: true,
    up: true,
    south: true,
    west: false,
    down: false,
    north: false,
  }
  const axis = axisOf[dir]
  const aIsEnd = positive[dir] ? a[axis] > b[axis] : a[axis] < b[axis]
  return aIsEnd ? [b, a] : [a, b]
}

// Per-face 3D placement. The card + border attributions come from
// content/data/cube-of-space.json; this table holds only geometry.
interface FaceGeometry {
  position: [number, number, number]
  rotation: [number, number, number]
  cardRotation?: [number, number, number]
  halfCardSet: 'lateral' | 'above' | 'below'
}

const FACE_GEOMETRY: Record<CubeFace['id'], FaceGeometry> = {
  east: {
    position: [HALF, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
    halfCardSet: 'lateral',
  },
  west: {
    position: [-HALF, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    halfCardSet: 'lateral',
  },
  above: {
    position: [0, HALF, 0],
    rotation: [Math.PI / 2, 0, 0],
    cardRotation: [0, 0, -Math.PI / 2],
    halfCardSet: 'above',
  },
  below: {
    position: [0, -HALF, 0],
    rotation: [-Math.PI / 2, 0, 0],
    cardRotation: [0, 0, -Math.PI / 2],
    halfCardSet: 'below',
  },
  north: {
    position: [0, 0, -HALF],
    rotation: [0, 0, 0],
    halfCardSet: 'lateral',
  },
  south: {
    position: [0, 0, HALF],
    rotation: [0, Math.PI, 0],
    halfCardSet: 'lateral',
  },
}

type FaceDef = CubeFace & FaceGeometry

const faces: Array<FaceDef> = cubeFaces.map((f) => ({
  ...f,
  ...FACE_GEOMETRY[f.id],
}))

function makeBorderShape(side: 'top' | 'bottom' | 'left' | 'right') {
  const H = HALF
  const T = BORDER_T
  const s = new Shape()
  switch (side) {
    case 'top':
      s.moveTo(-H + T, H - T)
      s.lineTo(H - T, H - T)
      s.lineTo(H, H)
      s.lineTo(-H, H)
      break
    case 'bottom':
      s.moveTo(H - T, -H + T)
      s.lineTo(-H + T, -H + T)
      s.lineTo(-H, -H)
      s.lineTo(H, -H)
      break
    case 'left':
      s.moveTo(-H + T, -H + T)
      s.lineTo(-H + T, H - T)
      s.lineTo(-H, H)
      s.lineTo(-H, -H)
      break
    case 'right':
      s.moveTo(H - T, H - T)
      s.lineTo(H - T, -H + T)
      s.lineTo(H, -H)
      s.lineTo(H, H)
      break
  }
  s.closePath()
  return s
}

const borderShapes = {
  top: makeBorderShape('top'),
  bottom: makeBorderShape('bottom'),
  left: makeBorderShape('left'),
  right: makeBorderShape('right'),
}

const borderDefs: Array<{ key: 'top' | 'bottom' | 'left' | 'right' }> = [
  { key: 'top' },
  { key: 'bottom' },
  { key: 'left' },
  { key: 'right' },
]

interface HalfCardProps {
  size: [number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  uvOffset: [number, number]
  uvRepeat: [number, number]
}

// NOTE: a 2D variant of this table (same uvOffset/uvRepeat per side, rotZ
// instead of 3D rotation) is hand-mirrored in scripts/gen-cube-pdf.ts
// so the paper cube wraps identically — edit both together.
const halfCard: Record<
  'lateral' | 'above' | 'below',
  Record<'top' | 'bottom' | 'left' | 'right', HalfCardProps>
> = {
  lateral: {
    top: {
      size: [1.0, 0.8],
      position: [0, HALF - 0.4, 0.012],
      rotation: [0, 0, 0],
      uvOffset: [0, 0],
      uvRepeat: [1, 0.5],
    },
    bottom: {
      size: [1.0, 0.8],
      position: [0, -HALF + 0.4, 0.012],
      rotation: [0, 0, 0],
      uvOffset: [0, 0.5],
      uvRepeat: [1, 0.5],
    },
    right: {
      size: [0.5, 1.6],
      position: [HALF - 0.25, 0, 0.012],
      rotation: [0, 0, 0],
      uvOffset: [0, 0],
      uvRepeat: [0.5, 1],
    },
    left: {
      size: [0.5, 1.6],
      position: [-HALF + 0.25, 0, 0.012],
      rotation: [0, 0, 0],
      uvOffset: [0.5, 0],
      uvRepeat: [0.5, 1],
    },
  },
  above: {
    top: {
      size: [1.0, 0.8],
      position: [0, HALF - 0.4, 0.012],
      rotation: [0, 0, Math.PI],
      uvOffset: [0, 0.5],
      uvRepeat: [1, 0.5],
    },
    bottom: {
      size: [1.0, 0.8],
      position: [0, -HALF + 0.4, 0.012],
      rotation: [0, 0, 0],
      uvOffset: [0, 0.5],
      uvRepeat: [1, 0.5],
    },
    right: {
      size: [1.0, 0.8],
      position: [HALF - 0.4, 0, 0.012],
      rotation: [0, 0, Math.PI / 2],
      uvOffset: [0, 0.5],
      uvRepeat: [1, 0.5],
    },
    left: {
      size: [1.0, 0.8],
      position: [-HALF + 0.4, 0, 0.012],
      rotation: [0, 0, -Math.PI / 2],
      uvOffset: [0, 0.5],
      uvRepeat: [1, 0.5],
    },
  },
  below: {
    top: {
      size: [1.0, 0.8],
      position: [0, HALF - 0.4, 0.012],
      rotation: [0, 0, 0],
      uvOffset: [0, 0],
      uvRepeat: [1, 0.5],
    },
    bottom: {
      size: [1.0, 0.8],
      position: [0, -HALF + 0.4, 0.012],
      rotation: [0, 0, Math.PI],
      uvOffset: [0, 0],
      uvRepeat: [1, 0.5],
    },
    right: {
      size: [1.0, 0.8],
      position: [HALF - 0.4, 0, 0.012],
      rotation: [0, 0, -Math.PI / 2],
      uvOffset: [0, 0],
      uvRepeat: [1, 0.5],
    },
    left: {
      size: [1.0, 0.8],
      position: [-HALF + 0.4, 0, 0.012],
      rotation: [0, 0, Math.PI / 2],
      uvOffset: [0, 0],
      uvRepeat: [1, 0.5],
    },
  },
}

// Isolates one card-image texture so that if it fails to load (a dropped
// request, a flaky network, a blocked asset), only that single overlay
// disappears — the colored wall/border scaffolding underneath still
// renders. Without this, one rejected texture crashes the whole canvas
// with a "Could not load …" error. No retry: the wall/border color is an
// acceptable, quiet degradation, and retrying a genuinely bad response
// (e.g. a poisoned browser cache) just loops. Loading itself is unchanged
// (useLoader + Suspense) — this only catches the failure case.
class TextureFallback extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error) {
    console.warn('Cube of Space: a card texture failed to load', error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function EdgeHalf({
  imageSrc,
  size,
  position,
  rotation,
  uvOffset,
  uvRepeat,
}: { imageSrc: string } & HalfCardProps) {
  const baseTexture = useLoader(TextureLoader, imageSrc) as Texture
  const texture = useMemo(() => {
    // Clone per instance: offset/repeat live on the texture, and the 24
    // edge-halves each need their own window into the shared image.
    const t = baseTexture.clone()
    // Card JPEGs are sRGB; without this they sample as linear and render
    // washed out next to the color-managed border/wall colors.
    t.colorSpace = SRGBColorSpace
    t.needsUpdate = true
    t.offset.set(uvOffset[0], uvOffset[1])
    t.repeat.set(uvRepeat[0], uvRepeat[1])
    return t
  }, [baseTexture, uvOffset, uvRepeat])

  // Dispose superseded clones (style switches orphan all 24 otherwise —
  // unbounded GPU texture growth is exactly what invites iOS context loss).
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

// The card image on a face. Split out so it can sit inside a
// TextureFallback: if this texture fails, the face keeps its wall color.
function FaceImage({
  src,
  rotation,
}: {
  src: string
  rotation?: [number, number, number]
}) {
  const texture = useLoader(TextureLoader, src) as Texture
  // Shared cached texture — mark it sRGB once (idempotent; see EdgeHalf).
  useMemo(() => {
    if (texture.colorSpace !== SRGBColorSpace) {
      // three.js objects are mutable by design; tagging the shared cached
      // texture sRGB once is idempotent and cheaper than cloning it.
      // eslint-disable-next-line react-hooks/immutability
      texture.colorSpace = SRGBColorSpace
      // eslint-disable-next-line react-hooks/immutability
      texture.needsUpdate = true
    }
  }, [texture])
  return (
    <mesh position={[0, 0, 0.01]} rotation={rotation ?? [0, 0, 0]}>
      <planeGeometry args={[1.0, 1.6]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

function Face({ face, style }: { face: FaceDef; style: string }) {
  const { colorPalette } = useColorPalette()
  const card = cardBySlug[face.cardSlug]
  const wallColor = getColor(card.color, colorPalette) ?? 'white'

  return (
    <group position={face.position} rotation={face.rotation}>
      <mesh>
        <planeGeometry args={[2 * HALF, 2 * HALF]} />
        <meshBasicMaterial color={wallColor} toneMapped={false} />
      </mesh>

      {borderDefs.map((b) => {
        const edgeCard = cardBySlug[cubeEdgeById[face.borders[b.key]].cardSlug]
        const edgeColor = getColor(edgeCard.color, colorPalette) ?? 'white'
        const half = halfCard[face.halfCardSet][b.key]
        return (
          <group key={b.key}>
            <mesh position={[0, 0, 0.005]}>
              <shapeGeometry args={[borderShapes[b.key]]} />
              <meshBasicMaterial color={edgeColor} toneMapped={false} />
            </mesh>
            <TextureFallback>
              <EdgeHalf
                imageSrc={thumbImage(edgeCard, style)}
                size={half.size}
                position={half.position}
                rotation={half.rotation}
                uvOffset={half.uvOffset}
                uvRepeat={half.uvRepeat}
              />
            </TextureFallback>
          </group>
        )
      })}

      <TextureFallback>
        <FaceImage src={thumbImage(card, style)} rotation={face.cardRotation} />
      </TextureFallback>
    </group>
  )
}

// One small sphere whose position lerps along its edge. Each edge gets
// FLOW_COUNT instances at staggered phases. Position is a deterministic
// function of time, so no per-particle state — just a transform update
// per frame. Cheap enough that 48 spheres (12 edges × 4) is invisible
// even on modest hardware.
function FlowDot({
  start,
  end,
  phase,
}: {
  start: Vec3
  end: Vec3
  phase: number
}) {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = (clock.elapsedTime * FLOW_SPEED + phase) % 1
    ref.current.position.set(
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
      start[2] + (end[2] - start[2]) * t,
    )
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[FLOW_SIZE, FLOW_SEGMENTS, FLOW_SEGMENTS]} />
      <meshBasicMaterial
        color="white"
        transparent
        opacity={FLOW_OPACITY}
        toneMapped={false}
      />
    </mesh>
  )
}

function FlowParticles() {
  return (
    <>
      {Object.keys(cubeFlowBySign).map((sign) => {
        const [start, end] = resolveFlow(sign)
        return (
          <group key={sign}>
            {Array.from({ length: FLOW_COUNT }, (_, j) => (
              <FlowDot key={j} start={start} end={end} phase={j / FLOW_COUNT} />
            ))}
          </group>
        )
      })}
    </>
  )
}

function Cube({ flow = false, style }: { flow?: boolean; style: string }) {
  return (
    <>
      {faces.map((face) => (
        <Face key={face.id} face={face} style={style} />
      ))}
      {flow && <FlowParticles />}
    </>
  )
}

// Renders the BOTA Cube of Space — a camera-inside-the-cube three.js scene
// where each face is a tarot card with mitered colored borders and
// half-card wraparounds at the edges. The container's size is left to the
// caller; pass any sized div around it.
//   `flow` — animated particles along each edge in the canonical direction.
export function CubeCanvas({ flow = false }: { flow?: boolean }) {
  const { majorStyle } = useTarotStyle()
  // Deferred so a style switch keeps showing the current textures while
  // the new set loads, instead of hard-suspending the whole canvas.
  const style = useDeferredValue(majorStyle)
  return (
    <Canvas
      camera={{ position: [-0.001, 0, 0], fov: 90, near: 0.001, far: 10 }}
      // Cap DPR at 2: full-DPR on Retina iPhones (×3) made the
      // framebuffer ~2.25× larger than necessary for this scene.
      dpr={[1, 2]}
      // antialias disabled on purpose. MSAA on a full-screen retina
      // canvas is a known iOS Safari Context-Lost trigger. Tarot card
      // edges already have hard color borders, so jagginess is minimal.
      gl={{ antialias: false }}
      // The scene is static unless flow particles animate — render on
      // demand otherwise (OrbitControls invalidates while dragging).
      frameloop={flow ? 'always' : 'demand'}
      // preventDefault on context-lost tells the browser it may restore
      // the context (three re-uploads resources on restore).
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) =>
          e.preventDefault(),
        )
      }}
    >
      <Cube flow={flow} style={style} />
      <OrbitControls
        target={[0, 0, 0]}
        enableZoom={false}
        enablePan={false}
        minDistance={0.001}
        maxDistance={0.001}
        rotateSpeed={-0.4}
      />
    </Canvas>
  )
}
