import type { ZoneId } from "@/lib/zones";

/*
 * Completed exercises, kept in this browser's local storage. This is per
 * device and per browser, not a record on any server: it survives reloads
 * and is shown only to the person using it. If storage is blocked, sessions
 * still work for the visit but are not kept.
 */
export type Session = {
  exerciseId: string;
  zone: ZoneId;
  seconds: number;
  completedAt: string;
};

const KEY = "neurospace.sessions.v1";
const EVENT = "neurospace:sessions";
const EMPTY: Session[] = [];

let cachedRaw: string | null | undefined;
let cachedSessions: Session[] = EMPTY;

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.exerciseId === "string" &&
    typeof s.zone === "string" &&
    typeof s.seconds === "number" &&
    typeof s.completedAt === "string"
  );
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

// Returns the same array until the stored value changes, so React subscribers do not loop.
export function getSessions(): Session[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedSessions;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedSessions = Array.isArray(parsed) ? parsed.filter(isSession) : EMPTY;
  } catch {
    cachedSessions = EMPTY;
  }
  return cachedSessions;
}

export function addSession(session: Session) {
  const next = [...getSessions(), session];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage is blocked or full: the session is not kept.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeSessions(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export const noSessions = () => EMPTY;

const DAY_MS = 24 * 60 * 60 * 1000;

// Weeks start on Monday, as the week view on Today does.
function mondayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

// Seven flags, Monday first: true if a session was completed on that day this week.
export function weekDoneFlags(sessions: Session[], now: Date): boolean[] {
  const monday = startOfDay(now).getTime() - mondayIndex(now) * DAY_MS;
  const flags = [false, false, false, false, false, false, false];
  for (const session of sessions) {
    const done = new Date(session.completedAt);
    const offset = Math.floor((startOfDay(done).getTime() - monday) / DAY_MS);
    if (offset >= 0 && offset < 7) flags[offset] = true;
  }
  return flags;
}

export function sessionsWithin(sessions: Session[], now: Date, days: number) {
  const cutoff = startOfDay(now).getTime() - (days - 1) * DAY_MS;
  return sessions.filter((session) => new Date(session.completedAt).getTime() >= cutoff);
}
