'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import { CompassControls } from '@/components/CompassControls'
import { Shape, TextureLoader, type Mesh, type Texture } from 'three'

import { cardBySlug, thumbImage } from '@/content/data/tarot'
import { getColor } from '@/lib/colors'

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

// BOTA Cube of Space — 12 edges → 12 simple Hebrew letters / zodiac.
const edges: Record<string, string> = {
  'T-E': 'the-lovers',
  'T-N': 'the-star',
  'T-W': 'temperance',
  'T-S': 'strength',
  'B-E': 'the-chariot',
  'B-N': 'the-moon',
  'B-W': 'the-devil',
  'B-S': 'the-hermit',
  'NE': 'the-hierophant',
  'SE': 'the-emperor',
  'SW': 'justice',
  'NW': 'death',
}

// Cube corners. Coord convention: +X=east, -X=west, +Y=up, -Y=down,
// +Z=north, -Z=south.
type Vec3 = [number, number, number]
const CORNER: Record<string, Vec3> = {
  'top-NE': [+HALF, +HALF, +HALF],
  'top-NW': [-HALF, +HALF, +HALF],
  'top-SE': [+HALF, +HALF, -HALF],
  'top-SW': [-HALF, +HALF, -HALF],
  'bot-NE': [+HALF, -HALF, +HALF],
  'bot-NW': [-HALF, -HALF, +HALF],
  'bot-SE': [+HALF, -HALF, -HALF],
  'bot-SW': [-HALF, -HALF, -HALF],
}

// Direction each edge's flow runs in, keyed by zodiac sign (lowercase).
// Every simple Hebrew letter / zodiac sign sits on one cube edge, so a
// sign IS an edge for our purposes. Flip a sign to the opposite word
// along its axis:
//
//   East-West axis  (Aquarius, Leo, Pisces, Virgo)         ......  'east'  ↔ 'west'
//   Up-Down axis    (Taurus, Aries, Scorpio, Libra)        ......  'up'    ↔ 'down'
//   North-South axis (Gemini, Sagittarius, Cancer, Capricorn)  ..  'north' ↔ 'south'
//
// Defaults honor the reported "Upper and Eastern faces are circular,
// other four are not" constraint from BOTA sources.
type FlowDirection =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'up'
  | 'down'

const FLOW_DIRECTION: Record<string, FlowDirection> = {
  // Upper face — clockwise from above.
  'aquarius':    'east',     // T-N
  'gemini':      'south',    // T-E
  'leo':         'west',     // T-S
  'sagittarius': 'north',    // T-W
  // Eastern face — clockwise from outside.
  'taurus':      'up',       // NE
  'cancer':      'north',    // B-E
  'aries':       'down',     // SE
  // Remaining verticals.
  'scorpio':     'up',       // NW
  'libra':       'down',       // SW
  // Bottom horizontals.
  'pisces':      'east',     // B-N
  'virgo':       'west',     // B-S
  'capricorn':   'north',    // B-W
}

// Two corners per edge, geometric. Internal — flip directions via
// FLOW_DIRECTION above, not here.
const EDGE_CORNERS: Record<string, [keyof typeof CORNER, keyof typeof CORNER]> = {
  'T-N': ['top-NW', 'top-NE'],
  'T-E': ['top-NE', 'top-SE'],
  'T-S': ['top-SE', 'top-SW'],
  'T-W': ['top-SW', 'top-NW'],
  'B-N': ['bot-NW', 'bot-NE'],
  'B-E': ['bot-NE', 'bot-SE'],
  'B-S': ['bot-SE', 'bot-SW'],
  'B-W': ['bot-SW', 'bot-NW'],
  'NE':  ['bot-NE', 'top-NE'],
  'NW':  ['bot-NW', 'top-NW'],
  'SE':  ['bot-SE', 'top-SE'],
  'SW':  ['bot-SW', 'top-SW'],
}

// Sign → edge corners, derived once from `edges` + tarot card astrology.
// Lets resolveFlow() take a zodiac key directly.
const SIGN_CORNERS: Record<string, [keyof typeof CORNER, keyof typeof CORNER]> =
  Object.fromEntries(
    Object.entries(edges).map(([edgeId, slug]) => {
      const card = cardBySlug[slug]
      if (!card) throw new Error(`No tarot card for edge ${edgeId} (${slug})`)
      return [card.astrology.toLowerCase(), EDGE_CORNERS[edgeId]]
    }),
  )

// Resolves a zodiac sign's two corners + direction word into [startVec,
// endVec] for animation. Picks whichever corner is "toward" the direction
// word as the END of the flow.
function resolveFlow(sign: string): [Vec3, Vec3] {
  const [cornerA, cornerB] = SIGN_CORNERS[sign]
  const a = CORNER[cornerA]
  const b = CORNER[cornerB]
  const dir = FLOW_DIRECTION[sign]
  // axis index: 0=X (east+/west-), 1=Y (up+/down-), 2=Z (north+/south-)
  const axisOf: Record<FlowDirection, 0 | 1 | 2> = {
    east: 0, west: 0, up: 1, down: 1, north: 2, south: 2,
  }
  const positive: Record<FlowDirection, boolean> = {
    east: true, up: true, north: true,
    west: false, down: false, south: false,
  }
  const axis = axisOf[dir]
  const aIsEnd = positive[dir] ? a[axis] > b[axis] : a[axis] < b[axis]
  return aIsEnd ? [b, a] : [a, b]
}

interface FaceDef {
  id: string
  cardSlug: string
  position: [number, number, number]
  rotation: [number, number, number]
  cardRotation?: [number, number, number]
  borders: { top: string; bottom: string; right: string; left: string }
  halfCardSet: 'lateral' | 'above' | 'below'
}

const faces: Array<FaceDef> = [
  {
    id: 'east',
    cardSlug: 'the-empress',
    position: [HALF, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
    borders: { top: 'T-E', bottom: 'B-E', right: 'NE', left: 'SE' },
    halfCardSet: 'lateral',
  },
  {
    id: 'west',
    cardSlug: 'wheel-of-fortune',
    position: [-HALF, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    borders: { top: 'T-W', bottom: 'B-W', right: 'SW', left: 'NW' },
    halfCardSet: 'lateral',
  },
  {
    id: 'above',
    cardSlug: 'the-magician',
    position: [0, HALF, 0],
    rotation: [Math.PI / 2, 0, 0],
    cardRotation: [0, 0, -Math.PI / 2],
    borders: { top: 'T-N', bottom: 'T-S', right: 'T-E', left: 'T-W' },
    halfCardSet: 'above',
  },
  {
    id: 'below',
    cardSlug: 'high-priestess',
    position: [0, -HALF, 0],
    rotation: [-Math.PI / 2, 0, 0],
    cardRotation: [0, 0, -Math.PI / 2],
    borders: { top: 'B-S', bottom: 'B-N', right: 'B-E', left: 'B-W' },
    halfCardSet: 'below',
  },
  {
    id: 'north',
    cardSlug: 'the-sun',
    position: [0, 0, HALF],
    rotation: [0, Math.PI, 0],
    borders: { top: 'T-N', bottom: 'B-N', right: 'NW', left: 'NE' },
    halfCardSet: 'lateral',
  },
  {
    id: 'south',
    cardSlug: 'the-tower',
    position: [0, 0, -HALF],
    rotation: [0, 0, 0],
    borders: { top: 'T-S', bottom: 'B-S', right: 'SE', left: 'SW' },
    halfCardSet: 'lateral',
  },
]

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

const halfCard: Record<
  'lateral' | 'above' | 'below',
  Record<'top' | 'bottom' | 'left' | 'right', HalfCardProps>
> = {
  lateral: {
    top: { size: [1.0, 0.8], position: [0, HALF - 0.4, 0.012], rotation: [0, 0, 0], uvOffset: [0, 0], uvRepeat: [1, 0.5] },
    bottom: { size: [1.0, 0.8], position: [0, -HALF + 0.4, 0.012], rotation: [0, 0, 0], uvOffset: [0, 0.5], uvRepeat: [1, 0.5] },
    right: { size: [0.5, 1.6], position: [HALF - 0.25, 0, 0.012], rotation: [0, 0, 0], uvOffset: [0, 0], uvRepeat: [0.5, 1] },
    left: { size: [0.5, 1.6], position: [-HALF + 0.25, 0, 0.012], rotation: [0, 0, 0], uvOffset: [0.5, 0], uvRepeat: [0.5, 1] },
  },
  above: {
    top: { size: [1.0, 0.8], position: [0, HALF - 0.4, 0.012], rotation: [0, 0, Math.PI], uvOffset: [0, 0.5], uvRepeat: [1, 0.5] },
    bottom: { size: [1.0, 0.8], position: [0, -HALF + 0.4, 0.012], rotation: [0, 0, 0], uvOffset: [0, 0.5], uvRepeat: [1, 0.5] },
    right: { size: [1.0, 0.8], position: [HALF - 0.4, 0, 0.012], rotation: [0, 0, Math.PI / 2], uvOffset: [0, 0.5], uvRepeat: [1, 0.5] },
    left: { size: [1.0, 0.8], position: [-HALF + 0.4, 0, 0.012], rotation: [0, 0, -Math.PI / 2], uvOffset: [0, 0.5], uvRepeat: [1, 0.5] },
  },
  below: {
    top: { size: [1.0, 0.8], position: [0, HALF - 0.4, 0.012], rotation: [0, 0, 0], uvOffset: [0, 0], uvRepeat: [1, 0.5] },
    bottom: { size: [1.0, 0.8], position: [0, -HALF + 0.4, 0.012], rotation: [0, 0, Math.PI], uvOffset: [0, 0], uvRepeat: [1, 0.5] },
    right: { size: [1.0, 0.8], position: [HALF - 0.4, 0, 0.012], rotation: [0, 0, -Math.PI / 2], uvOffset: [0, 0], uvRepeat: [1, 0.5] },
    left: { size: [1.0, 0.8], position: [-HALF + 0.4, 0, 0.012], rotation: [0, 0, Math.PI / 2], uvOffset: [0, 0], uvRepeat: [1, 0.5] },
  },
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
    const t = baseTexture.clone()
    t.needsUpdate = true
    t.offset.set(uvOffset[0], uvOffset[1])
    t.repeat.set(uvRepeat[0], uvRepeat[1])
    return t
  }, [baseTexture, uvOffset, uvRepeat])

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

function Face({ face }: { face: FaceDef }) {
  const card = cardBySlug[face.cardSlug]
  const texture = useLoader(TextureLoader, thumbImage(card)) as Texture
  const wallColor = getColor(card.color) ?? 'white'

  return (
    <group position={face.position} rotation={face.rotation}>
      <mesh>
        <planeGeometry args={[2 * HALF, 2 * HALF]} />
        <meshBasicMaterial color={wallColor} toneMapped={false} />
      </mesh>

      {borderDefs.map((b) => {
        const edgeCard = cardBySlug[edges[face.borders[b.key]]]
        const edgeColor = getColor(edgeCard.color) ?? 'white'
        const half = halfCard[face.halfCardSet][b.key]
        return (
          <group key={b.key}>
            <mesh position={[0, 0, 0.005]}>
              <shapeGeometry args={[borderShapes[b.key]]} />
              <meshBasicMaterial color={edgeColor} toneMapped={false} />
            </mesh>
            <EdgeHalf
              imageSrc={thumbImage(edgeCard)}
              size={half.size}
              position={half.position}
              rotation={half.rotation}
              uvOffset={half.uvOffset}
              uvRepeat={half.uvRepeat}
            />
          </group>
        )
      })}

      <mesh position={[0, 0, 0.01]} rotation={face.cardRotation ?? [0, 0, 0]}>
        <planeGeometry args={[1.0, 1.6]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
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
      {Object.keys(FLOW_DIRECTION).map((sign) => {
        const [start, end] = resolveFlow(sign)
        return (
          <group key={sign}>
            {Array.from({ length: FLOW_COUNT }, (_, j) => (
              <FlowDot
                key={j}
                start={start}
                end={end}
                phase={j / FLOW_COUNT}
              />
            ))}
          </group>
        )
      })}
    </>
  )
}

function Cube({ flow = false }: { flow?: boolean }) {
  return (
    <>
      {faces.map((face) => (
        <Face key={face.id} face={face} />
      ))}
      {flow && <FlowParticles />}
    </>
  )
}

// Renders the BOTA Cube of Space — a camera-inside-the-cube three.js scene
// where each face is a tarot card with mitered colored borders and
// half-card wraparounds at the edges. The container's size is left to the
// caller; pass any sized div around it.
//   `flow`    — animated particles along each edge in the canonical direction.
//   `compass` — drive camera rotation from the device's gyroscope/compass
//               instead of touch/drag. World +X is east, so the east face
//               of the cube ends up actually facing east. Permission must
//               be obtained from a user gesture (see CompassToggle).
export function CubeCanvas({
  flow = false,
  compass = false,
}: {
  flow?: boolean
  compass?: boolean
}) {
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
    >
      <Cube flow={flow} />
      {compass ? (
        <CompassControls />
      ) : (
        <OrbitControls
          target={[0, 0, 0]}
          enableZoom={false}
          enablePan={false}
          minDistance={0.001}
          maxDistance={0.001}
          rotateSpeed={-0.4}
        />
      )}
    </Canvas>
  )
}
