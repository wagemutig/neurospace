"use client";

import { useState } from "react";
import { TabBar } from "@/components/TabBar";
import { sessionsWithin, weekDoneFlags } from "@/lib/progress";
import { useSessions } from "@/lib/useSessions";
import { zones, type ZoneId } from "@/lib/zones";

const zoneOrder: ZoneId[] = ["breath", "balance", "reach", "ground", "rest"];

export default function ProgressPage() {
  const sessions = useSessions();
  // Read the clock once when the screen opens.
  const [now] = useState(() => new Date());

  const recent = sessionsWithin(sessions, now, 14);
  const minutes = Math.round(recent.reduce((total, s) => total + s.seconds, 0) / 60);
  const daysThisWeek = weekDoneFlags(sessions, now).filter(Boolean).length;

  const counts = Object.fromEntries(zoneOrder.map((zone) => [zone, 0])) as Record<ZoneId, number>;
  for (const session of recent) counts[session.zone] += 1;
  const largest = Math.max(1, ...zoneOrder.map((zone) => counts[zone]));

  return (
    <main className="screen" aria-label="Verlauf">
      <div className="status">
        <span>9:41</span>
      </div>

      <div className="lead">
        <h1 style={{ fontSize: 36 }}>
          {recent.length > 0 ? "Da bist du wieder." : "Probier's aus."}
        </h1>
        <p style={{ marginTop: 14 }}>
          {daysThisWeek > 0
            ? `${daysThisWeek} ${daysThisWeek === 1 ? "Tag" : "Tage"} diese Woche.`
            : "Noch keine Übung diese Woche. Kein Druck."}
        </p>
        <p className="display" style={{ marginTop: 18, fontSize: 56, lineHeight: 1 }}>
          {minutes}{" "}
          <span style={{ fontSize: 20, fontWeight: 700 }}>Min</span>
        </p>
      </div>

      <section className="sheet" style={{ paddingTop: 28 }}>
        <h2 style={{ fontSize: 20 }}>Zonen, letzte 14 Tage</h2>
        {zoneOrder.map((zone, index) => (
          <div key={zone} className="bar-row">
            <span className="bar-label">{zones[zone].label}</span>
            <span className="track">
              <b
                style={{
                  width: `${(counts[zone] / largest) * 100}%`,
                  background: zones[zone].color,
                  animationDelay: `${200 + index * 90}ms`,
                }}
              />
            </span>
            <span className="val">{counts[zone]}</span>
          </div>
        ))}
      </section>

      <TabBar current="/verlauf" />
    </main>
  );
}
