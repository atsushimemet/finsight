import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

const statusLabels: Record<string, string> = {
  draft: "下書き",
  analyzing: "分析中",
  completed: "完了",
  approved: "承認",
  rejected: "却下",
};

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

  if (!user) {
    redirect("/");
  }

  const { data: application, error } = await supabase
    .from("loan_applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !application) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium text-[#2563eb] hover:underline"
        >
          ← 案件一覧へ
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {application.company_name}
        </h1>
        {application.industry && (
          <p className="mt-1 text-slate-500">{application.industry}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-700">
            {statusLabels[application.status] ?? application.status}
          </span>
          {application.risk_level && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-800">
              リスク: {application.risk_level === "high" ? "高" : application.risk_level === "medium" ? "中" : "低"}
            </span>
          )}
        </div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">融資希望額</dt>
            <dd className="font-mono font-medium text-slate-900">
              {(application.loan_amount / 10000).toFixed(0)}万円
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">返済期間</dt>
            <dd className="text-slate-900">{application.loan_period}ヶ月</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">最終更新</dt>
            <dd className="text-slate-700">
              {new Date(application.updated_at).toLocaleDateString("ja-JP")}
            </dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-slate-500">
          財務分析・シミュレーション・稟議書は今後の実装で利用可能になります。
        </p>
      </div>
    </div>
  );
}
