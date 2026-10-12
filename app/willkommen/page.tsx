import { redirect } from "next/navigation";
import { signIn } from "@/app/actions";
import { currentUserId, getAccount } from "@/lib/auth";
import { authEnabled } from "@/lib/supabase";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  if (!authEnabled) redirect("/");
  if (await getAccount()) redirect("/");
  if (await currentUserId()) redirect("/onboarding/name");

  const { fehler } = await searchParams;

  return (
    <main className="screen" aria-label="Willkommen">
      <div className="lead" style={{ paddingTop: 48 }}>
        <h1>Dein Körper. Wieder deiner.</h1>
        <p className="muted" style={{ marginTop: 12 }}>
          Sensomotorisches Heimtraining, neurologisch begleitet.
        </p>
      </div>

      <section className="sheet">
        <p>Melde dich an, damit dein Verlauf dir gehört.</p>
        <form action={signIn.bind(null, "google")}>
          <button type="submit" className="pill btn-block">
            Mit Google anmelden
          </button>
        </form>
        <form action={signIn.bind(null, "apple")}>
          <button type="submit" className="pill btn-block btn-ink-text">
            Mit Apple anmelden
          </button>
        </form>
        {fehler && (
          <p role="alert" className="note">
            Das hat nicht geklappt. Probier es nochmal.
          </p>
        )}
      </section>
    </main>
  );
}
