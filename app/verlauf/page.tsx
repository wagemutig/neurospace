import { TabBar } from "@/components/TabBar";
import { zones, type ZoneId } from "@/lib/zones";

// Minutes per zone over the last 14 days, as a share of the busiest zone.
const weeks: { zone: ZoneId; value: number; width: number }[] = [
  { zone: "breath", value: 3, width: 55 },
  { zone: "balance", value: 6, width: 100 },
  { zone: "reach", value: 2, width: 35 },
  { zone: "ground", value: 4, width: 70 },
  { zone: "rest", value: 1, width: 18 },
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
        {weeks.map(({ zone, value, width }) => (
          <div key={zone} className="bar-row">
            <span className="bar-label">{zones[zone].label}</span>
            <span className="track">
              <b style={{ width: `${width}%`, background: zones[zone].color }} />
            </span>
            <span className="val">{value}</span>
          </div>
        ))}
      </section>

      <TabBar current="/verlauf" />
    </main>
  );
}
