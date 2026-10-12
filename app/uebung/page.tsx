import Link from "next/link";
import { ExerciseTimer } from "@/components/ExerciseTimer";
import { TabBar } from "@/components/TabBar";

export default function ExercisePage() {
  return (
    <main className="screen" style={{ background: "var(--tint)" }} aria-label="Übung">
      <div className="status">
        <span>9:41</span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px 0",
        }}
      >
        <Link
          href="/"
          className="round"
          aria-label="Schließen"
          style={{ width: 44, height: 44, background: "var(--surface)", color: "var(--ink)" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            style={{ width: 18, height: 18 }}
            aria-hidden="true"
          >
            <path d="M6 6 L18 18 M18 6 L6 18" />
          </svg>
        </Link>
        <span className="zone-chip" style={{ background: "var(--surface)" }}>
          2 von 4
        </span>
      </div>

      <div className="lead" style={{ paddingTop: 28 }}>
        <p className="display" style={{ fontSize: 30, lineHeight: 1.05 }}>
          Stell dich hin. Spür die Füße am Boden.
        </p>
      </div>

      <div style={{ margin: "28px auto 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <ExerciseTimer />
      </div>

      <p style={{ textAlign: "center", margin: "24px 28px 0" }}>
        Atme ruhig. Wenn du wackelst, halte dich fest.
      </p>

      <div style={{ margin: "auto 20px 120px", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <span
          className="note"
          style={{
            padding: "10px 16px",
            borderRadius: "var(--radius-pill)",
            background: "var(--surface)",
            color: "var(--ink)",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Unsicher? Sprich vorher mit deiner Therapeutin.
        </span>
      </div>

      <TabBar current="/uebung" />
    </main>
  );
}
