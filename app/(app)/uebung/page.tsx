import { redirect } from "next/navigation";
import { exercises } from "@/lib/exercises";

// The Übung tab opens the first exercise of today's plan.
export default function ExerciseIndexPage() {
  redirect(`/uebung/${exercises[0].id}`);
}
