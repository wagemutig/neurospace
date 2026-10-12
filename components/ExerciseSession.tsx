"use client";

import { useEffect, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { Buddy, type Mood } from "@/components/Buddy";
import { ZoneChip } from "@/components/ZoneChip";
import type { Exercise } from "@/lib/exercises";
import { recordSession } from "@/app/actions";
import { addSession, isSameDay } from "@/lib/progress";
import { useSessions } from "@/lib/useSessions";
import { levelOf, requestMotionAccess, startMotion, type Level, type Snapshot } from "@/lib/sensing";
import { zones } from "@/lib/zones";

type Sensor = "unknown" | "live" | "denied" | "unavailable";

const FEEDBACK: Record<Level, string> = {
  calm: "Ganz ruhig. Ich bin bei dir.",
  wobbly: "Ein bisschen wackeln ist okay. Atme mit mir.",
  strong: "Halt dich gern fest. Oder setz dich kurz hin.",
};

const MOOD: Record<Level, Mood> = { calm: "calm", wobbly: "wobbly", strong: "strong" };

// How long the sway must stay strong before the gentle suggestion appears.
const CAUTION_AFTER_MS = 2500;
const CONFETTI_COLORS = ["var(--pulse)", "var(--breath)", "var(--balance)", "var(--reach)", "var(--ground)", "var(--rest)"];

type Props = {
  exercise: Exercise;
  position: number;
  total: number;
  nextHref?: string;
};

export function ExerciseSession({ exercise, position, total, nextHref }: Props) {
  const [remaining, setRemaining] = useState(exercise.seconds);
  const [running, setRunning] = useState(false);
  const [sensor, setSensor] = useState<Sensor>("unknown");
  const [level, setLevel] = useState<Level>("calm");
  const [caution, setCaution] = useState(false);

  const active = running && remaining > 0;
  const finished = remaining === 0;
  const live = sensor === "live";

  const askedRef = useRef(false);
  const blockedRef = useRef(false);
  const seenRef = useRef(false);
  const sensorRef = useRef<Snapshot>({ amp: 0, tiltX: 0, tiltY: 0 });
  const strongSinceRef = useRef<number | null>(null);
  const buddyRef = useRef<HTMLDivElement>(null);

  // Countdown.
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setRemaining((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [active]);

  // Record the session once each time the timer reaches zero, and give a short buzz where supported.
  useEffect(() => {
    if (!finished) return;
    const completedAt = new Date().toISOString();
    addSession({
      exerciseId: exercise.id,
      zone: exercise.zone,
      seconds: exercise.seconds,
      completedAt,
    });
    // Also kept on the account when signed in. Stays a no-op otherwise.
    void recordSession({
      exerciseId: exercise.id,
      zone: exercise.zone,
      seconds: exercise.seconds,
      completedAt,
    });
    navigator.vibrate?.(30);
  }, [finished, exercise.id, exercise.zone, exercise.seconds]);

  // Sensors run only while the exercise is running. Readings go to a ref, not to React state.
  // The listener is set up once per run, so the lean is measured from the same starting point.
  useEffect(() => {
    if (!running || finished || blockedRef.current) return;
    const stop = startMotion((snapshot) => {
      sensorRef.current = snapshot;
      if (!seenRef.current) {
        seenRef.current = true;
        setSensor("live");
      }
    });
    // No readings after a moment means this device has no motion sensor to use.
    const timeout = seenRef.current
      ? undefined
      : window.setTimeout(() => {
          if (!seenRef.current) setSensor("unavailable");
        }, 2500);
    return () => {
      stop();
      window.clearTimeout(timeout);
    };
  }, [running, finished]);

  // Feedback: how steady the phone is, checked twice a second. The gentle suggestion
  // only appears after a sustained wobble, not after a single movement.
  useEffect(() => {
    if (!running || finished || !live) return;
    const id = window.setInterval(() => {
      const next = levelOf(sensorRef.current.amp);
      setLevel(next);
      if (next === "strong") {
        strongSinceRef.current ??= Date.now();
        setCaution(Date.now() - strongSinceRef.current > CAUTION_AFTER_MS);
      } else {
        strongSinceRef.current = null;
        setCaution(false);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [running, finished, live]);

  // Buddy sways with the phone each frame. Values glide towards the reading so it feels soft.
  useEffect(() => {
    if (!running || finished) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const tick = () => {
      const target = seenRef.current ? sensorRef.current : { tiltX: 0, tiltY: 0 };
      x += (target.tiltX - x) * 0.15;
      y += (target.tiltY - y) * 0.15;
      const el = buddyRef.current;
      if (el) {
        el.style.setProperty("--tilt-x", `${x * 10}px`);
        el.style.setProperty("--tilt-y", `${y * 6}px`);
        el.style.setProperty("--tilt-r", `${x * -3}deg`);
        el.style.setProperty("--look-x", `${x * 6}px`);
        el.style.setProperty("--look-y", `${y * 5}px`);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, finished]);

  async function start() {
    if (!askedRef.current) {
      askedRef.current = true;
      if (!("DeviceMotionEvent" in window)) {
        blockedRef.current = true;
        setSensor("unavailable");
      } else if (!(await requestMotionAccess())) {
        blockedRef.current = true;
        setSensor("denied");
      }
    }
    setRunning(true);
  }

  function reset() {
    setRunning(false);
    setRemaining(exercise.seconds);
    setLevel("calm");
    setCaution(false);
    strongSinceRef.current = null;
  }

  // Today's count, in the same form as the saved sessions: each exercise counts once.
  const sessions = useSessions();
  const today = new Date();
  const doneToday = new Set(
    sessions.filter((session) => isSameDay(new Date(session.completedAt), today)).map((session) => session.exerciseId),
  ).size;

  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");
  const mood: Mood = finished ? "happy" : live && running ? MOOD[level] : "calm";
  const color = zones[exercise.zone].color;

  const lead = finished
    ? "Gut gemacht."
    : running && live
      ? FEEDBACK[level]
      : exercise.body;

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
        <ButtonLink href="/" shape="round-sm" variant="surface" aria-label="Schliessen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6 L18 18 M18 6 L6 18" />
          </svg>
        </ButtonLink>
        <span className="zone-chip chip-surface">
          {position} von {total}
        </span>
      </div>

      <div className="lead" style={{ paddingTop: 28 }}>
        <p key={lead} className="display feedback" style={{ fontSize: 30, lineHeight: 1.05 }}>
          {lead}
        </p>
        <div style={{ marginTop: 16 }}>
          <ZoneChip zone={exercise.zone} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 16, position: "relative" }}>
        {finished && <Confetti />}
        <Buddy
          wrapperRef={buddyRef}
          mood={mood}
          color={color}
          left={remaining / exercise.seconds}
          label={finished ? "Erledigt" : `Noch ${minutes} Minuten ${seconds} Sekunden`}
        />
        {!finished && (
          <span className={`display timer-value${active ? " is-running" : ""}`} aria-live="off" style={{ marginTop: 8, fontSize: 40 }}>
            {minutes}:{seconds}
          </span>
        )}
      </div>

      {caution && (
        <p style={{ display: "flex", justifyContent: "center", margin: "16px 20px 0" }}>
          <span className="note" style={{ padding: "10px 16px", borderRadius: "var(--radius-pill)", background: "var(--caution-bg)", color: "var(--caution)", fontSize: 13, fontWeight: 500, textAlign: "center" }}>
            Wenn es sich unsicher anfühlt, sprich mit deiner Therapeutin.
          </span>
        </p>
      )}

      {finished ? (
        <>
          <p className="muted" style={{ textAlign: "center", margin: "24px 28px 0" }}>
            Schön, dass du dabei warst.
          </p>
          <p style={{ textAlign: "center", margin: "8px 28px 0", fontWeight: 700 }}>
            {doneToday} von {total} heute erledigt.
          </p>
          <div className="controls timer-controls" style={{ marginTop: 24 }}>
            <Button variant="surface" onClick={reset}>
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
              aria-label={running ? "Pause" : "Starten"}
              onClick={() => (running ? setRunning(false) : start())}
            >
              {running ? (
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
            <Button variant="surface" style={{ flex: 1 }} onClick={reset}>
              Neu starten
            </Button>
          </div>
          {running && (sensor === "denied" || sensor === "unavailable") && (
            <p className="muted" style={{ textAlign: "center", margin: "16px 28px 0", fontSize: 13 }}>
              {sensor === "denied"
                ? "Bewegung ist nicht erlaubt. Die Übung geht trotzdem."
                : "Kein Bewegungssensor gefunden. Die Übung geht trotzdem."}
            </p>
          )}
          {!running && (
            <p className="muted" style={{ textAlign: "center", margin: "16px 28px 0", fontSize: 13 }}>
              Bewegung bleibt auf deinem Gerät.
            </p>
          )}
        </>
      )}
    </>
  );
}

// A short burst of shapes when the exercise is done. Purely decorative.
function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * 360;
        return (
          <span
            key={i}
            style={{
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDelay: `${(i % 4) * 30}ms`,
              ["--angle" as string]: `${angle}deg`,
              ["--dist" as string]: `${110 + (i % 3) * 25}px`,
            }}
          />
        );
      })}
    </div>
  );
}
