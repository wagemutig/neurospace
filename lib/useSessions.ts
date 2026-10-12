"use client";

import { useSyncExternalStore } from "react";
import { getSessions, noSessions, subscribeSessions, type Session } from "@/lib/progress";

// Empty during server rendering and the first client render, then the saved sessions.
export function useSessions(): Session[] {
  return useSyncExternalStore(subscribeSessions, getSessions, noSessions);
}
