import { TabBar } from "@/components/TabBar";

const zones = [
  { label: "Atem", color: "var(--breath)", value: 3, width: 55 },
  { label: "Gleichgewicht", color: "var(--balance)", value: 6, width: 100 },
  { label: "Greifen", color: "var(--reach)", value: 2, width: 35 },
  { label: "Boden", color: "var(--ground)", value: 4, width: 70 },
  { label: "Loslassen", color: "var(--rest)", value: 1, width: 18 },
];

export default function ProgressPage() {
  return (
    <main className="screen" aria-label="Verlauf">
      <div className="status">
        <span>9:41</span>
      </div>

      <div className="lead">
        <h1 style={{ fontSize: 36 }}>Da bist du wieder.</h1>
        <p style={{ marginTop: 14 }}>Drei Tage diese Woche.</p>
        <p className="display" style={{ marginTop: 18, fontSize: 56, lineHeight: 1 }}>
          14{" "}
          <span style={{ fontSize: 20, fontWeight: 700 }}>Min</span>
        </p>
      </div>

      <section className="sheet" style={{ paddingTop: 28 }}>
        <h2 style={{ fontSize: 20 }}>Zonen, letzte 14 Tage</h2>
        {zones.map((zone) => (
          <div key={zone.label} className="bar-row">
            <span className="bar-label">{zone.label}</span>
            <span className="track">
              <b style={{ width: `${zone.width}%`, background: zone.color }} />
            </span>
            <span className="val">{zone.value}</span>
          </div>
        ))}
      </section>

      <TabBar current="/verlauf" />
    </main>
  );
}
