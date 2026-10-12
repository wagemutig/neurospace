import { NextResponse, type NextRequest } from "next/server";
import { authEnabled, createClient } from "@/lib/supabase";

// Where Google or Apple send the person back after signing in.
export async function GET(request: NextRequest) {
  const { origin, searchParams } = new URL(request.url);
  if (!authEnabled) return NextResponse.redirect(`${origin}/`);

  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/willkommen?fehler=1`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/willkommen?fehler=1`);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/willkommen?fehler=1`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  return NextResponse.redirect(`${origin}${profile ? "/" : "/onboarding/name"}`);
}
