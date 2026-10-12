/*
 * The five body zones from docs/design-system/README.md. Each exercise trains
 * one zone, and a zone is always shown with its label and icon, never colour alone.
 */
export type ZoneId = "breath" | "balance" | "reach" | "ground" | "rest";

export type Zone = {
  id: ZoneId;
  label: string;
  color: string;
};

export const zones: Record<ZoneId, Zone> = {
  breath: { id: "breath", label: "Atem", color: "var(--breath)" },
  balance: { id: "balance", label: "Gleichgewicht", color: "var(--balance)" },
  reach: { id: "reach", label: "Greifen", color: "var(--reach)" },
  ground: { id: "ground", label: "Boden", color: "var(--ground)" },
  rest: { id: "rest", label: "Loslassen", color: "var(--rest)" },
};
