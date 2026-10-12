"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/Button";
import { Buddy } from "@/components/Buddy";
import { TabBar } from "@/components/TabBar";
import { ZoneChip } from "@/components/ZoneChip";
import { exercises } from "@/lib/exercises";
import { isSameDay, weekDoneFlags } from "@/lib/progress";
import { useSessions } from "@/lib/useSessions";

const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function TodayPage() {
  const sessions = useSessions();
  // Read the clock once when the screen opens.
  const [now] = useState(() => new Date());

  const doneToday = new Set(
    sessions
      .filter((session) => isSameDay(new Date(session.completedAt), now))
      .map((session) => session.exerciseId),
  );
  const next = exercises.find((exercise) => !doneToday.has(exercise.id));
  const remainingMinutes = Math.ceil(
    exercises
      .filter((exercise) => !doneToday.has(exercise.id))
      .reduce((total, exercise) => total + exercise.seconds, 0) / 60,
  );

  const weekDone = weekDoneFlags(sessions, now);
  const todayIndex = (now.getDay() + 6) % 7;

  return (
    <main className="screen" aria-label="Heute">
      <div className="status">
        <span>9:41</span>
      </div>

      <div className="lead">
        <h1>
          Guten Morgen,
          <br />
          Anna.
        </h1>
        <p className="muted" style={{ marginTop: 12 }}>
          {next
            ? `Heute: ${exercises.length - doneToday.size} Übungen. Etwa ${remainingMinutes} Minuten.`
            : "Für heute bist du fertig. Schön, dass du da warst."}
        </p>
      </div>

      <div className="pebble" aria-hidden="true">
        <Buddy mood="calm" color="var(--pulse)" left={1} />
      </div>

      <section className="sheet">
        {next ? (
          <>
            <ZoneChip zone={next.zone} />

            <div className="controls">
              <div>
                <h2 style={{ fontSize: 24 }}>{next.title}</h2>
                <p className="muted" style={{ fontSize: 14 }}>
                  {next.seconds} Sekunden
                </p>
              </div>
              <ButtonLink href={`/uebung/${next.id}`} shape="round" aria-label="Starten">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M 8 5.5 Q 7 5 7 6.2 L 7 17.8 Q 7 19 8 18.5 L 18.5 12.7 Q 19.3 12 18.5 11.3 Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </ButtonLink>
            </div>
          </>
        ) : (
          <div className="controls">
            <p>Alles erledigt für heute.</p>
            <ButtonLink href="/verlauf" variant="surface">
              Verlauf
            </ButtonLink>
          </div>
        )}

        <div className="days" role="list">
          {dayLabels.map((label, index) => (
            <div
              key={label}
              role="listitem"
              className={`day${weekDone[index] ? " done" : ""}${index === todayIndex ? " today" : ""}`}
            >
              <i style={{ animationDelay: `${320 + index * 70}ms` }} />
              {label}
            </div>
          ))}
        </div>
      </section>

      <TabBar current="/" />
    </main>
  );
}
