import { createClient } from "@/lib/supabase/server";
import { GUEST_USER_ID } from "@/lib/constants";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import type { LoanApplication } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? GUEST_USER_ID;

  const { data } = await supabase
    .from("loan_applications")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  const applications = (data ?? []) as LoanApplication[];

  return <DashboardContent applications={applications} />;
}
