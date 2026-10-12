import { zones, type ZoneId } from "@/lib/zones";

/* The zone's label and icon always appear with its colour. */
export function ZoneChip({ zone }: { zone: ZoneId }) {
  const { label, color } = zones[zone];
  return (
    <span className="zone-chip" style={{ background: color }}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="8" cy="8" r="2" fill="currentColor" />
      </svg>
      {label}
    </span>
  );
}
