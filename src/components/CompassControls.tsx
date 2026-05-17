'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Quaternion, Vector3 } from 'three'

// Sensor-fusion camera controller. Quaternion state `q` represents
// the device's orientation in world frame (device-local → world).
// Updated by:
//   1. Integrating gyro rotation rates (smooth, fast, but drifts).
//   2. Small accelerometer correction toward gravity (kills pitch/roll drift).
//   3. Small compass correction toward magnetic north (kills yaw drift).
//
// No Euler angles — the previous implementation hit gimbal lock at
// |beta|=90° because YXZ Euler math projects roll into yaw at that
// pose. This filter operates entirely on quaternions and is immune.
//
// World convention: +X east, +Y up, +Z north (user inside the cube
// looking out). Internal fusion frame is three.js default; a final
// 180° world-yaw flips "scene-forward" from -Z (three.js) to +Z (north).

// --- Tuning ---

// Per-event correction proportional gains. Conservative defaults: prefer
// stable filter behavior over fast convergence to absolute references.
const ACCEL_KP = 0.5
const COMPASS_KP = 0.005

// Compass correction is gated by yaw extractability. When the camera-
// forward vector's horizontal projection is shorter than this, the
// yaw component of q is ill-defined and any "correction" we apply
// would be based on noise. Skip the correction in that regime.
const YAW_STABILITY_THRESHOLD = 0.3

// Set true to disable compass correction entirely (gyro + accel only).
// Useful for isolating filter behavior — without compass, yaw will
// slowly drift but the camera will remain smooth and well-behaved.
const COMPASS_DISABLED = false

// Cap integration step so a long event gap (tab inactive, debugger
// paused) doesn't produce a giant rotation on resume.
const MAX_DT_S = 0.1

// --- Constants ---

const WORLD_UP = new Vector3(0, 1, 0)
const WORLD_NORTH_REF = new Vector3(0, 0, -1)
const Y_AXIS = new Vector3(0, 1, 0)
const DEG_TO_RAD = Math.PI / 180

const WORLD_NORTH_ADJUST = new Quaternion().setFromAxisAngle(Y_AXIS, Math.PI)

// Per-frame scratch.
const tmpQuat = new Quaternion()
const tmpQuatInv = new Quaternion()
const tmpVecMeasured = new Vector3()
const tmpVecExpected = new Vector3()
const tmpVecError = new Vector3()
const tmpVecOmega = new Vector3()
const tmpVecFwd = new Vector3()
const tmpVecRotation = new Vector3()

export function CompassControls() {
  const camera = useThree((state) => state.camera)

  const q = useRef(new Quaternion())
  const gyroDevice = useRef(new Vector3())
  const accelDevice = useRef(new Vector3())
  const compassHeading = useRef(Number.NaN)
  const hasAccel = useRef(false)
  const lastEventTime = useRef(0)
  const initialized = useRef(false)

  useEffect(() => {
    function onMotion(e: DeviceMotionEvent) {
      const rate = e.rotationRate
      if (rate == null) return
      if (rate.alpha == null && rate.beta == null && rate.gamma == null) return

      gyroDevice.current.set(
        (rate.beta ?? 0) * DEG_TO_RAD,
        (rate.gamma ?? 0) * DEG_TO_RAD,
        (rate.alpha ?? 0) * DEG_TO_RAD,
      )

      const aig = e.accelerationIncludingGravity
      if (aig != null && (aig.x != null || aig.y != null || aig.z != null)) {
        accelDevice.current.set(aig.x ?? 0, aig.y ?? 0, aig.z ?? 0)
        hasAccel.current = true
      }

      const now = e.timeStamp
      const dt =
        lastEventTime.current === 0
          ? 0
          : Math.min((now - lastEventTime.current) / 1000, MAX_DT_S)
      lastEventTime.current = now
      if (dt <= 0) {
        initialized.current = true
        return
      }

      // ---- accumulate angular velocity in device frame ----
      tmpVecOmega.copy(gyroDevice.current)

      // Pitch/roll correction: where does q say world-up is in device
      // frame, vs where does the accelerometer say up is?
      if (hasAccel.current && accelDevice.current.lengthSq() > 1e-6) {
        tmpVecMeasured.copy(accelDevice.current).normalize()
        tmpQuatInv.copy(q.current).conjugate()
        tmpVecExpected.copy(WORLD_UP).applyQuaternion(tmpQuatInv)
        // error = measured × expected. This rotation vector, applied
        // intrinsically to q, nudges q's "expected up" toward "measured up".
        tmpVecError.crossVectors(tmpVecMeasured, tmpVecExpected)
        tmpVecOmega.addScaledVector(tmpVecError, ACCEL_KP)
      }

      // ---- integrate omega · dt into q (in device frame) ----
      tmpVecRotation.copy(tmpVecOmega).multiplyScalar(dt)
      quaternionFromRotationVector(tmpQuat, tmpVecRotation)
      q.current.multiply(tmpQuat)

      // ---- yaw correction from compass (world-frame) ----
      // Gated by stability of the yaw extraction. When the camera-forward
      // vector is near-vertical, its horizontal projection is tiny and
      // atan2 amplifies noise into huge yaw errors that the filter would
      // then chase — the classic "violent shake when phone points up at
      // the sky" symptom. Skipping the correction in that pose preserves
      // gyro+accel tracking with no shake; yaw will drift slowly but
      // resumes correcting as soon as the user returns to a non-vertical
      // pose.
      if (!COMPASS_DISABLED && Number.isFinite(compassHeading.current)) {
        tmpVecFwd.copy(WORLD_NORTH_REF).applyQuaternion(q.current)
        const horizMag = Math.hypot(tmpVecFwd.x, tmpVecFwd.z)
        if (horizMag > YAW_STABILITY_THRESHOLD) {
          const currentYaw = Math.atan2(tmpVecFwd.x, -tmpVecFwd.z)
          const targetYaw = -compassHeading.current * DEG_TO_RAD

          let yawError = targetYaw - currentYaw
          yawError = ((yawError + Math.PI * 3) % (Math.PI * 2)) - Math.PI

          const yawCorrection = yawError * COMPASS_KP
          if (Math.abs(yawCorrection) > 1e-6) {
            tmpQuat.setFromAxisAngle(Y_AXIS, yawCorrection)
            q.current.premultiply(tmpQuat)
          }
        }
      }

      q.current.normalize()
      initialized.current = true
    }

    window.addEventListener('devicemotion', onMotion, true)
    return () => window.removeEventListener('devicemotion', onMotion, true)
  }, [])

  useEffect(() => {
    function onOrient(e: DeviceOrientationEvent) {
      const we = e as DeviceOrientationEvent & {
        webkitCompassHeading?: number
      }
      if (typeof we.webkitCompassHeading === 'number') {
        compassHeading.current = we.webkitCompassHeading
      }
    }
    window.addEventListener('deviceorientation', onOrient, true)
    return () => window.removeEventListener('deviceorientation', onOrient, true)
  }, [])

  useFrame(() => {
    if (!initialized.current) return
    camera.quaternion.copy(q.current)
    camera.quaternion.premultiply(WORLD_NORTH_ADJUST)
  })

  return null
}

// Quaternion from rotation vector (axis · angle). Standard exponential
// map: for rotation θ around unit axis n, the quaternion is
// (sin(θ/2)·n, cos(θ/2)). Returns identity for very small magnitudes.
function quaternionFromRotationVector(out: Quaternion, v: Vector3): Quaternion {
  const mag = v.length()
  if (mag < 1e-9) return out.set(0, 0, 0, 1)
  const half = mag * 0.5
  const s = Math.sin(half) / mag
  return out.set(v.x * s, v.y * s, v.z * s, Math.cos(half))
}
