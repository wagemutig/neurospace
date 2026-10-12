"use client";

import { useEffect, useState } from "react";

const TOTAL_SECONDS = 45;
const OUTLINE =
  "M 120 20 C 168 20 222 56 224 118 C 226 180 186 222 120 222 C 58 222 16 184 18 116 C 20 56 72 20 120 20 Z";

export function ExerciseTimer() {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(false);
  const active = running && remaining > 0;

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setRemaining((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [active]);

  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");
  const left = remaining / TOTAL_SECONDS;

  return (
    <>
      <div className="timer" role="timer" aria-live="off">
        <svg viewBox="0 0 240 240" aria-hidden="true">
          <path d={OUTLINE} fill="var(--surface)" />
          <path
            d={OUTLINE}
            fill="var(--balance)"
            style={{ clipPath: `inset(${(1 - left) * 100}% 0 0 0)` }}
          />
        </svg>
        <span className="display timer-value">
          {minutes}:{seconds}
        </span>
      </div>

      <div className="controls timer-controls">
        <button
          type="button"
          className="round"
          aria-label={active ? "Pause" : "Weiter"}
          style={{ background: "var(--ink)", color: "var(--paper)" }}
          onClick={() => setRunning((r) => !r)}
          disabled={remaining === 0}
        >
          {active ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="7" y="5.5" width="3.6" height="13" rx="1.8" />
              <rect x="13.4" y="5.5" width="3.6" height="13" rx="1.8" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M 8 5.5 Q 7 5 7 6.2 L 7 17.8 Q 7 19 8 18.5 L 18.5 12.7 Q 19.3 12 18.5 11.3 Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <button
          type="button"
          className="pill"
          style={{ flex: 1, background: "var(--surface)", color: "var(--ink)" }}
          onClick={() => {
            setRunning(false);
            setRemaining(TOTAL_SECONDS);
          }}
        >
          Neu starten
        </button>
      </div>
    </>
  );
}
