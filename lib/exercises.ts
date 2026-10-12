import type { ZoneId } from "@/lib/zones";

/*
 * Today's plan. Each exercise trains one zone and is guided by a short
 * instruction. Copy follows the voice in docs/design-system/README.md:
 * invite rather than instruct, and never promise a result.
 */
export type Exercise = {
  id: string;
  title: string;
  zone: ZoneId;
  seconds: number;
  body: string;
};

export const exercises: Exercise[] = [
  {
    id: "atem-ruhig",
    title: "Ruhig atmen",
    zone: "breath",
    seconds: 60,
    body: "Atme ruhig. Spür, wie der Atem bis in den Rücken kommt.",
  },
  {
    id: "fuesse-spueren",
    title: "Füße spüren",
    zone: "balance",
    seconds: 45,
    body: "Stell dich hin. Spür die Füße am Boden. Wenn du wackelst, halte dich fest.",
  },
  {
    id: "hand-oeffnen",
    title: "Hand öffnen",
    zone: "reach",
    seconds: 60,
    body: "Öffne die Hand. Lass den Arm kommen, wenn er möchte.",
  },
  {
    id: "schultern-loesen",
    title: "Schultern lösen",
    zone: "rest",
    seconds: 60,
    body: "Lass die Schultern sinken. Nichts muss jetzt passieren.",
  },
];

export function exerciseIndex(id: string) {
  return exercises.findIndex((exercise) => exercise.id === id);
}
