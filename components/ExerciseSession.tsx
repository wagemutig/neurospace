"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { ZoneChip } from "@/components/ZoneChip";
import type { Exercise } from "@/lib/exercises";
import { addSession } from "@/lib/progress";
import { zones } from "@/lib/zones";

const OUTLINE =
  "M 120 20 C 168 20 222 56 224 118 C 226 180 186 222 120 222 C 58 222 16 184 18 116 C 20 56 72 20 120 20 Z";

type Props = {
  exercise: Exercise;
  position: number;
  total: number;
  nextHref?: string;
};

export function ExerciseSession({ exercise, position, total, nextHref }: Props) {
  const [remaining, setRemaining] = useState(exercise.seconds);
  const [running, setRunning] = useState(false);
  const active = running && remaining > 0;
  const finished = remaining === 0;

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setRemaining((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [active]);

  // Record the session once each time the timer reaches zero.
  useEffect(() => {
    if (!finished) return;
    addSession({
      exerciseId: exercise.id,
      zone: exercise.zone,
      seconds: exercise.seconds,
      completedAt: new Date().toISOString(),
    });
  }, [finished, exercise.id, exercise.zone, exercise.seconds]);

  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");
  const left = remaining / exercise.seconds;
  const color = zones[exercise.zone].color;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px 0",
        }}
      >
        <ButtonLink href="/" shape="round-sm" variant="surface" aria-label="Schließen">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6 L18 18 M18 6 L6 18" />
          </svg>
        </ButtonLink>
        <span className="zone-chip chip-surface">
          {position} von {total}
        </span>
      </div>

      <div className="lead" style={{ paddingTop: 28 }}>
        <p className="display" style={{ fontSize: 30, lineHeight: 1.05 }}>
          {finished ? "Gut gemacht." : exercise.body}
        </p>
        <div style={{ marginTop: 16 }}>
          <ZoneChip zone={exercise.zone} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
        <div className={`timer${active ? " is-running" : ""}`} role="timer" aria-live="off">
          <svg viewBox="0 0 240 240" aria-hidden="true">
            <path d={OUTLINE} fill="var(--surface)" />
            <path
              d={OUTLINE}
              fill={finished ? "var(--pulse)" : color}
              style={{ clipPath: finished ? "none" : `inset(${(1 - left) * 100}% 0 0 0)` }}
            />
          </svg>
          <span className="display timer-value">
            {finished ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-label="Erledigt" role="img">
                <path d="M5 12.5 L10 17 L19 7" />
              </svg>
            ) : (
              <>
                {minutes}:{seconds}
              </>
            )}
          </span>
        </div>
      </div>

      {finished ? (
        <>
          <p className="muted" style={{ textAlign: "center", margin: "24px 28px 0" }}>
            Schön, dass du dabei warst.
          </p>
          <div className="controls timer-controls" style={{ marginTop: 24 }}>
            <Button variant="surface" onClick={() => setRemaining(exercise.seconds)}>
              Nochmal
            </Button>
            {nextHref ? (
              <ButtonLink href={nextHref} style={{ flex: 1 }}>
                Weiter
              </ButtonLink>
            ) : (
              <ButtonLink href="/verlauf" style={{ flex: 1 }}>
                Fertig
              </ButtonLink>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="controls timer-controls" style={{ marginTop: 24 }}>
            <Button
              variant="ink"
              shape="round"
              aria-label={active ? "Pause" : "Starten"}
              onClick={() => setRunning((r) => !r)}
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
            </Button>
            <Button
              variant="surface"
              style={{ flex: 1 }}
              onClick={() => {
                setRunning(false);
                setRemaining(exercise.seconds);
              }}
            >
              Neu starten
            </Button>
          </div>
        </>
      )}
    </>
  );
}
