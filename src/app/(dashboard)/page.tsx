import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import type { LoanApplication } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = user
    ? await supabase
        .from("loan_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
    : { data: [] };
  const applications = (data ?? []) as LoanApplication[];

  return (
    <DashboardContent applications={applications} isLoggedIn={!!user} />
  );
}
