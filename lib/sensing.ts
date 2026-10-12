/*
 * Body sway from the phone's motion sensors. The readings stay on this device:
 * they are never stored, logged or sent anywhere. Nothing here is a score or
 * a judgement; it only tells the screen how much the phone is moving.
 */

export type Level = "calm" | "wobbly" | "strong";

export type Snapshot = {
  // Average size of the sideways and up-down movement over the last moments, in m/s².
  amp: number;
  // Lean relative to where the phone was when the exercise started, -1..1.
  tiltX: number;
  tiltY: number;
};

// Thresholds on the average movement, m/s². Estimates: tune on a real phone.
const WOBBLY_FROM = 0.12;
const STRONG_FROM = 0.4;

export function levelOf(amp: number): Level {
  if (amp >= STRONG_FROM) return "strong";
  if (amp >= WOBBLY_FROM) return "wobbly";
  return "calm";
}

type PermissionAPI = { requestPermission?: () => Promise<"granted" | "denied"> };

// iOS asks for permission, and only from a tap. Android and desktop do not ask.
export async function requestMotionAccess(): Promise<boolean> {
  if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) return false;
  const motion = DeviceMotionEvent as unknown as PermissionAPI;
  if (typeof motion.requestPermission !== "function") return true;
  try {
    return (await motion.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Starts listening and calls onSnapshot for each reading. Returns a stop function.
export function startMotion(onSnapshot: (snapshot: Snapshot) => void): () => void {
  // Gravity is slowly estimated so only the movement of the hand and body remains.
  // It starts from the first reading, so the first moments do not look like movement.
  let gravity: { x: number; y: number; z: number } | null = null;
  let recent: number[] = [];
  let baseline: { beta: number; gamma: number } | null = null;
  let beta = 0;
  let gamma = 0;

  const onMotion = (event: DeviceMotionEvent) => {
    const raw = event.accelerationIncludingGravity;
    if (!raw || raw.x == null || raw.y == null || raw.z == null) return;

    const keep = 0.9;
    const previous = gravity ?? { x: raw.x, y: raw.y, z: raw.z };
    const g = {
      x: keep * previous.x + (1 - keep) * raw.x,
      y: keep * previous.y + (1 - keep) * raw.y,
      z: keep * previous.z + (1 - keep) * raw.z,
    };
    gravity = g;
    const magnitude = Math.hypot(raw.x - g.x, raw.y - g.y, raw.z - g.z);

    recent.push(magnitude);
    if (recent.length > 40) recent = recent.slice(-40);
    const amp = recent.reduce((sum, value) => sum + value, 0) / recent.length;

    const tiltX = baseline ? clamp((gamma - baseline.gamma) / 20, -1, 1) : 0;
    const tiltY = baseline ? clamp((beta - baseline.beta) / 20, -1, 1) : 0;
    onSnapshot({ amp, tiltX, tiltY });
  };

  const onOrientation = (event: DeviceOrientationEvent) => {
    if (event.beta == null || event.gamma == null) return;
    beta = event.beta;
    gamma = event.gamma;
    if (!baseline) baseline = { beta, gamma };
  };

  window.addEventListener("devicemotion", onMotion);
  window.addEventListener("deviceorientation", onOrientation);
  return () => {
    window.removeEventListener("devicemotion", onMotion);
    window.removeEventListener("deviceorientation", onOrientation);
  };
}
