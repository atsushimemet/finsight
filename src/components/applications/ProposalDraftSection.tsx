"use client";

import { useMemo, useState } from "react";
import type {
  FinancialMetrics,
  FinancialStatement,
  LoanApplication,
} from "@/types/database";
import {
  estimateMonthlyOperatingCashFlow,
  calculateMonthlyRepayment,
} from "@/lib/finance";

interface ProposalDraftSectionProps {
  application: LoanApplication;
  metrics: FinancialMetrics | null;
  statements: FinancialStatement[];
}

type DraftStatus = "idle" | "generating" | "copied";

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "-";
  return currencyFormatter.format(Math.round(value));
}

function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "-";
  return `${value.toFixed(1)}%`;
}

function buildRiskHighlights(metrics: FinancialMetrics | null) {
  const strengths: string[] = [];
  const risks: string[] = [];

  if (!metrics) {
    risks.push("財務データが不足しているため、追加資料の取得が必要です。");
    return { strengths, risks };
  }

  if (
    metrics.roe != null &&
    metrics.industry_avg_roe != null &&
    metrics.roe > metrics.industry_avg_roe
  ) {
    strengths.push(
      `ROEは${metrics.roe.toFixed(1)}%で業界平均（${metrics.industry_avg_roe.toFixed(1)}%）を上回っています。`
    );
  }
  if (
    metrics.operating_margin != null &&
    metrics.industry_avg_operating_margin != null &&
    metrics.operating_margin > metrics.industry_avg_operating_margin
  ) {
    strengths.push(
      `営業利益率が業界平均（${metrics.industry_avg_operating_margin.toFixed(1)}%）より高く、収益性が高いと評価できます。`
    );
  }
  if (metrics.current_ratio != null && metrics.current_ratio >= 150) {
    strengths.push(
      `流動比率は${metrics.current_ratio.toFixed(1)}%で、短期支払能力に余裕があります。`
    );
  }

  if (metrics.equity_ratio != null && metrics.equity_ratio < 20) {
    risks.push(`自己資本比率が${metrics.equity_ratio.toFixed(1)}%と低く、財務基盤の薄さが懸念されます。`);
  }
  if (metrics.current_ratio != null && metrics.current_ratio < 100) {
    risks.push(`流動比率が${metrics.current_ratio.toFixed(1)}%で、運転資金のタイトさに注意が必要です。`);
  }
  if (
    metrics.operating_profit != null &&
    metrics.operating_profit < 0
  ) {
    risks.push("営業利益が赤字のため、コスト構造の改善が急務です。");
  }

  return { strengths, risks };
}

function buildMockDraft(params: {
  application: LoanApplication;
  metrics: FinancialMetrics | null;
  monthlyCashFlow: number;
  monthlyRepayment: number;
  strengths: string[];
  risks: string[];
}) {
  const { application, metrics, monthlyCashFlow, monthlyRepayment, strengths, risks } = params;
  const interestRate = application.interest_rate ?? 3;
  const repaymentCapacity = monthlyCashFlow - monthlyRepayment;
  const repaymentAssessment =
    repaymentCapacity >= 0
      ? `営業CFから月次返済額を控除しても ${formatCurrency(repaymentCapacity)} の余力を確保できる計算です。`
      : `営業CFに対して月次返済額が ${formatCurrency(Math.abs(repaymentCapacity))} 上回るため、追加担保や条件変更の検討が必要です。`;
  const recommendation = repaymentCapacity >= 0
    ? "推奨（返済余力は十分と判断）"
    : application.risk_level === "high"
      ? "慎重審査（財務・返済面に課題）"
      : "条件付き推奨（返済条件の再設計が前提）";

  const strengthsBlock = strengths.length > 0
    ? strengths.map((item) => `  - ${item}`).join("\n")
    : "  - 特筆すべき強みは確認できていません。";
  const risksBlock = risks.length > 0
    ? risks.map((item) => `  - ${item}`).join("\n")
    : "  - 重大なリスク要因は確認されていません。";

  return `【融資稟議書ドラフト（モック）】

1. 申請企業概要
  - 企業名: ${application.company_name}
  - 業種: ${application.industry ?? "不明"}
  - 設立年: ${application.established_year ?? "不明"}
  - 従業員数: ${application.employee_count ?? "非公開"}

2. 融資概要
  - 融資希望額: ${formatCurrency(application.loan_amount)}
  - 融資期間: ${application.loan_period}ヶ月
  - 金利（参考）: ${interestRate.toFixed(2)}%
  - 返済方法: 元利均等返済（月次）

3. 財務状況分析
  - 売上高: ${formatCurrency(metrics?.revenue ?? null)}
  - 営業利益: ${formatCurrency(metrics?.operating_profit ?? null)}
  - 純利益: ${formatCurrency(metrics?.net_income ?? null)}
  - ROE: ${formatPercent(metrics?.roe)}（業界平均: ${formatPercent(metrics?.industry_avg_roe)}）
  - 自己資本比率: ${formatPercent(metrics?.equity_ratio)}（業界平均: ${formatPercent(metrics?.industry_avg_equity_ratio)}）

  【財務上の強み】
${strengthsBlock}

  【懸念されるリスク要因】
${risksBlock}

4. 返済能力評価
  - 月次返済額（概算）: ${formatCurrency(monthlyRepayment)}
  - 推定営業CF（月次）: ${formatCurrency(monthlyCashFlow)}
  - 返済余力: ${formatCurrency(repaymentCapacity)}
  ${repaymentAssessment}

5. シミュレーション結果（モック）
  - ベースケース: キャッシュフローは安定的に推移し、返済余力は ${formatCurrency(repaymentCapacity)} と想定。
  - 売上10%減少: 返済余力が圧縮されるものの、${repaymentCapacity >= 0 ? "限定的なマージンが残る" : "赤字化する場面が想定される"}。
  - 金利1%上昇: 月次返済額が増加し、リスク耐性が${repaymentCapacity >= 0 ? "やや低下" : "さらに悪化"}。

6. 総合評価
  - 推奨可否: ${recommendation}
  - 担当者所見（追記用）: _______________________________

※本ドラフトはモック生成結果であり、正式な稟議書作成時には実際の財務資料・面談結果を踏まえて加筆修正してください。`;
}

export function ProposalDraftSection({
  application,
  metrics,
  statements,
}: ProposalDraftSectionProps) {
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<DraftStatus>("idle");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const baseMonthlyCF = useMemo(
    () => estimateMonthlyOperatingCashFlow(statements, metrics, application),
    [statements, metrics, application]
  );
  const interestRate = application.interest_rate ?? 3;
  const monthlyRepayment = useMemo(
    () =>
      calculateMonthlyRepayment(
        application.loan_amount,
        application.loan_period || 60,
        interestRate
      ),
    [application.loan_amount, application.loan_period, interestRate]
  );
  const { strengths, risks } = useMemo(
    () => buildRiskHighlights(metrics),
    [metrics]
  );

  const handleGenerate = () => {
    setStatus("generating");
    setCopyFeedback(null);
    // モックなので擬似的な生成待ち時間を挿入
    setTimeout(() => {
      const newDraft = buildMockDraft({
        application,
        metrics,
        monthlyCashFlow: baseMonthlyCF,
        monthlyRepayment,
        strengths,
        risks,
      });
      setDraft(newDraft);
      setStatus("idle");
    }, 400);
  };

  const handleCopy = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopyFeedback("クリップボードにコピーしました。編集用ドキュメントに貼り付けてご利用ください。");
      setStatus("copied");
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (error) {
      setCopyFeedback("コピーに失敗しました。ブラウザの権限設定をご確認ください。");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-base font-semibold text-slate-900">稟議書ドラフト生成（モック）</h3>
        <p className="mt-2 text-sm text-slate-500">
          ワンクリックでテンプレートを生成し、下部のエリアで内容を加筆修正できます。将来的にはLLM生成へ置き換える計画です。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={status === "generating"}
            className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            {status === "generating" ? "生成中…" : "ドラフト生成 (モック)"}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!draft}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            コピーする
          </button>
        </div>
        {copyFeedback && (
          <p className="mt-3 text-xs text-slate-600">{copyFeedback}</p>
        )}
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">推定営業CF（月次）</dt>
            <dd className="font-mono text-slate-900">{formatCurrency(baseMonthlyCF)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">月次返済額（概算）</dt>
            <dd className="font-mono text-slate-900">{formatCurrency(monthlyRepayment)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">リスクレベル</dt>
            <dd className="text-slate-900">{application.risk_level ?? "未評価"}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-slate-900">ドラフト内容</h3>
          <span className="text-xs text-slate-500">自由に編集してメモを追記できます</span>
        </div>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={24}
          className="mt-4 w-full rounded-lg border border-slate-300 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-900 focus:border-[#2563eb] focus:bg-white focus:outline-none"
          placeholder="「ドラフト生成 (モック)」を押すとここに稟議書テンプレートが表示されます。"
        />
      </div>
    </div>
  );
}
