"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authEnabled, createClient } from "@/lib/supabase";

type Provider = "google" | "apple";

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signIn(provider: Provider) {
  if (!authEnabled) redirect("/");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${await siteOrigin()}/auth/callback` },
  });
  if (error || !data.url) redirect("/willkommen?fehler=1");
  redirect(data.url);
}

export async function saveName(formData: FormData) {
  if (!authEnabled) redirect("/");
  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > 30) redirect("/onboarding/name?fehler=1");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/willkommen");

  const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name: name });
  if (error) redirect("/onboarding/name?fehler=1");
  redirect("/");
}

export async function signOut() {
  if (authEnabled) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/willkommen");
}

export type SessionInput = {
  exerciseId: string;
  zone: string;
  seconds: number;
  completedAt: string;
};

// Keeps a finished exercise on the account. Does nothing when signed out or accounts are off.
export async function recordSession(input: SessionInput) {
  if (!authEnabled) return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("sessions").insert({
    user_id: user.id,
    exercise_id: input.exerciseId,
    zone: input.zone,
    seconds: input.seconds,
    completed_at: input.completedAt,
  });
}
