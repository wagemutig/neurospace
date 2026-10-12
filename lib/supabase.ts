import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Accounts stay off until the Supabase keys are set, so the app works as it did before.
export const authEnabled = Boolean(url && key);

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(url ?? "", key ?? "", {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Read-only in Server Components. The proxy refreshes the session cookies instead.
        }
      },
    },
  });
}
