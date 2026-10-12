import { TodayScreen } from "@/components/TodayScreen";
import { getAccount } from "@/lib/auth";

export default async function TodayPage() {
  const account = await getAccount();
  return <TodayScreen name={account?.name ?? ""} signedIn={account !== null} />;
}
