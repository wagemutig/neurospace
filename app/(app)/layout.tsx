import { requireAccount } from "@/lib/auth";

// Every app screen needs a signed-in person with a name. With accounts off, nothing is checked.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAccount();
  return children;
}
