import { redirect } from "next/navigation";
import { authEnabled, createClient } from "@/lib/supabase";

export type Account = { userId: string; name: string };

export async function currentUserId(): Promise<string | null> {
  if (!authEnabled) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// The signed-in person's profile, or null when there is no account or no name yet.
export async function getAccount(): Promise<Account | null> {
  if (!authEnabled) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  return profile ? { userId: user.id, name: profile.display_name } : null;
}

// For the app screens: signed out goes to sign-in, signed in without a name goes to onboarding.
export async function requireAccount(): Promise<Account | null> {
  if (!authEnabled) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/willkommen");
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding/name");
  return { userId: user.id, name: profile.display_name };
}
