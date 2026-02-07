"use client";

import { useState } from "react";
import { FinancialAnalysisSection } from "./FinancialAnalysisSection";
import { CashFlowSimulation } from "./CashFlowSimulation";
import type { LoanApplication, FinancialMetrics, FinancialStatement } from "@/types/database";

const statusLabels: Record<string, string> = {
  draft: "下書き",
  analyzing: "分析中",
  completed: "完了",
  approved: "承認",
  rejected: "却下",
};

type TabId = "overview" | "financial" | "simulation";

interface ApplicationDetailViewProps {
  application: LoanApplication;
  metrics: FinancialMetrics | null;
  statements: FinancialStatement[];
}

export function ApplicationDetailView({
  application,
  metrics,
  statements,
}: ApplicationDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "概要" },
    { id: "financial", label: "財務分析" },
    { id: "simulation", label: "シミュレーション" },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 pt-6">
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
              リスク:{" "}
              {application.risk_level === "high"
                ? "高"
                : application.risk_level === "medium"
                  ? "中"
                  : "低"}
            </span>
          )}
        </div>
        <nav className="mt-6 flex gap-4 border-b border-slate-200">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                activeTab === id
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "overview" && (
          <>
            <dl className="grid gap-3 sm:grid-cols-2">
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
          </>
        )}

        {activeTab === "financial" && (
          <>
            {metrics ? (
              <FinancialAnalysisSection metrics={metrics} />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                <p>この案件の財務データがまだ登録されていません。</p>
                <p className="mt-2 text-sm">
                  決算書をアップロードするか、手動で財務データを入力すると分析結果を表示できます。
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "simulation" && (
          <CashFlowSimulation
            application={application}
            metrics={metrics}
            statements={statements}
          />
        )}
      </div>
    </div>
  );
}
