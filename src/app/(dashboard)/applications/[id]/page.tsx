import { createClient } from "@/lib/supabase/server";
import { GUEST_USER_ID } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ApplicationDetailView } from "@/components/applications/ApplicationDetailView";
import type { FinancialMetrics, FinancialStatement } from "@/types/database";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? GUEST_USER_ID;

  const { data: application, error } = await supabase
    .from("loan_applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !application) {
    notFound();
  }

  const { data: metrics } = await supabase
    .from("financial_metrics")
    .select("*")
    .eq("loan_application_id", id)
    .maybeSingle();

  const { data: statements } = await supabase
    .from("financial_statements")
    .select("*")
    .eq("loan_application_id", id)
    .order("fiscal_year", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm font-medium text-[#2563eb] hover:underline"
        >
          ← 案件一覧へ
        </Link>
      </div>
      <ApplicationDetailView
        application={application}
        metrics={(metrics ?? null) as FinancialMetrics | null}
        statements={(statements ?? []) as FinancialStatement[]}
      />
    </div>
  );
}
