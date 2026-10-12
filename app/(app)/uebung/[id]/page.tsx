import { notFound } from "next/navigation";
import { ExerciseSession } from "@/components/ExerciseSession";
import { TabBar } from "@/components/TabBar";
import { exerciseIndex, exercises } from "@/lib/exercises";

export function generateStaticParams() {
  return exercises.map((exercise) => ({ id: exercise.id }));
}

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const index = exerciseIndex(id);
  if (index < 0) notFound();

  const exercise = exercises[index];
  const next = exercises[index + 1];

  return (
    <main className="screen" style={{ background: "var(--tint)" }} aria-label="Übung">
      <div className="status">
        <span>9:41</span>
      </div>

      {/* Keyed by exercise so each one starts with a fresh timer. */}
      <ExerciseSession
        key={exercise.id}
        exercise={exercise}
        position={index + 1}
        total={exercises.length}
        nextHref={next ? `/uebung/${next.id}` : undefined}
      />

      <TabBar current="/uebung" />
    </main>
  );
}
