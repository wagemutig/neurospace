import { redirect } from "next/navigation";
import { saveName } from "@/app/actions";
import { currentUserId, getAccount } from "@/lib/auth";
import { authEnabled } from "@/lib/supabase";

export default async function NamePage({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  if (!authEnabled) redirect("/");
  if (!(await currentUserId())) redirect("/willkommen");
  if (await getAccount()) redirect("/");

  const { fehler } = await searchParams;

  return (
    <main className="screen" aria-label="Name">
      <div className="lead" style={{ paddingTop: 48 }}>
        <h1>Wie darf ich dich nennen?</h1>
        <p className="muted" style={{ marginTop: 12 }}>
          Dein Vorname reicht.
        </p>
      </div>

      <section className="sheet">
        <form action={saveName} className="stack">
          <label htmlFor="name" className="t-label">
            Name
          </label>
          <input
            id="name"
            name="name"
            className="field"
            required
            maxLength={30}
            autoComplete="given-name"
            autoFocus
          />
          {fehler && (
            <p role="alert" className="note">
              Bitte gib einen Namen mit höchstens 30 Zeichen ein.
            </p>
          )}
          <button type="submit" className="pill btn-block">
            Weiter
          </button>
        </form>
      </section>
    </main>
  );
}
