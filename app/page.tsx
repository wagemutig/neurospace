import Link from "next/link";
import { TabBar } from "@/components/TabBar";

const days = [
  { label: "Mo", done: true },
  { label: "Di", done: true },
  { label: "Mi", done: false },
  { label: "Do", done: true },
  { label: "Fr", done: false },
  { label: "Sa", done: false, today: true },
  { label: "So", done: false },
];

export default function TodayPage() {
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
          Heute: Gleichgewicht. Etwa zehn Minuten.
        </p>
      </div>

      <section className="sheet">
        <span className="zone-chip" style={{ background: "var(--balance)" }}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="8" cy="8" r="2" fill="currentColor" />
          </svg>
          Gleichgewicht
        </span>

        <div className="controls">
          <div>
            <h2 style={{ fontSize: 24 }}>Gewicht verlagern</h2>
            <p className="muted" style={{ fontSize: 14 }}>
              10 Minuten · im Stehen
            </p>
          </div>
          <Link href="/uebung" className="round" aria-label="Starten">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M 8 5.5 Q 7 5 7 6.2 L 7 17.8 Q 7 19 8 18.5 L 18.5 12.7 Q 19.3 12 18.5 11.3 Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div className="days" role="list">
          {days.map((day) => (
            <div
              key={day.label}
              role="listitem"
              className={`day${day.done ? " done" : ""}${day.today ? " today" : ""}`}
            >
              <i />
              {day.label}
            </div>
          ))}
        </div>
      </section>

      <TabBar current="/" />
    </main>
  );
}
