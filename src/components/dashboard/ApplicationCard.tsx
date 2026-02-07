"use client";

import Link from "next/link";
import type { LoanApplication, LoanApplicationStatus, RiskLevel } from "@/types/database";

const statusLabels: Record<LoanApplicationStatus, string> = {
  draft: "下書き",
  analyzing: "分析中",
  completed: "完了",
  approved: "承認",
  rejected: "却下",
};

const statusColors: Record<LoanApplicationStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  analyzing: "bg-amber-100 text-amber-800",
  completed: "bg-blue-100 text-blue-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const riskLabels: Record<RiskLevel, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const riskColors: Record<RiskLevel, string> = {
  high: "text-red-600",
  medium: "text-amber-600",
  low: "text-emerald-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(n: number) {
  return `${(n / 10000).toFixed(0)}万円`;
}

interface ApplicationCardProps {
  application: LoanApplication;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const riskLevel = application.risk_level ?? "medium";
  const riskLabel = riskLabels[riskLevel];
  const riskColor = riskColors[riskLevel];

  return (
    <Link
      href={`/applications/${application.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md no-underline text-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900">
            {application.company_name}
          </h3>
          {application.industry && (
            <p className="mt-0.5 text-sm text-slate-500">{application.industry}</p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[application.status]}`}
          >
            {statusLabels[application.status]}
          </span>
          <span className={`text-xs font-medium ${riskColor}`}>
            リスク: {riskLabel}
          </span>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div>
          <dt className="text-slate-500">融資希望額</dt>
          <dd className="font-mono font-medium text-slate-900">
            {formatAmount(application.loan_amount)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">最終更新</dt>
          <dd className="text-slate-700">{formatDate(application.updated_at)}</dd>
        </div>
      </dl>
    </Link>
  );
}
