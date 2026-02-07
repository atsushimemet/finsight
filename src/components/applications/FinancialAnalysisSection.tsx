"use client";

import type { FinancialMetrics } from "@/types/database";

interface FinancialAnalysisSectionProps {
  metrics: FinancialMetrics;
}

/** 仕様書: 自己資本比率10%未満、流動比率100%未満、債務超過 でアラート */
function getRiskAlerts(metrics: FinancialMetrics): string[] {
  const alerts: string[] = [];
  if (metrics.equity_ratio != null && metrics.equity_ratio < 10) {
    alerts.push(`自己資本比率が${metrics.equity_ratio.toFixed(1)}%です（10%未満は要注意）。`);
  }
  if (metrics.current_ratio != null && metrics.current_ratio < 100) {
    alerts.push(`流動比率が${metrics.current_ratio.toFixed(1)}%です（100%未満は短期支払能力に懸念）。`);
  }
  if (
    metrics.total_assets != null &&
    metrics.total_liabilities != null &&
    metrics.total_liabilities > metrics.total_assets
  ) {
    alerts.push("債務超過の状態です。");
  }
  if (metrics.operating_profit != null && metrics.operating_profit < 0) {
    alerts.push("営業利益が赤字です。");
  }
  return alerts;
}

/** 業界平均との比較で緑/赤を判定 */
function compareColor(
  value: number | null,
  industryAvg: number | null
): "green" | "red" | "neutral" {
  if (value == null || industryAvg == null) return "neutral";
  if (value >= industryAvg) return "green";
  return "red";
}

interface MetricBarProps {
  label: string;
  value: number | null;
  industryAvg: number | null;
  unit?: string;
  higherIsBetter?: boolean;
}

function MetricBar({
  label,
  value,
  industryAvg,
  unit = "%",
  higherIsBetter = true,
}: MetricBarProps) {
  if (value == null) return null;
  const color =
    industryAvg == null
      ? "neutral"
      : higherIsBetter
        ? compareColor(value, industryAvg)
        : compareColor(industryAvg, value);
  const maxVal =
    industryAvg != null ? Math.max(value, industryAvg) * 1.2 : value * 1.2;
  const maxValSafe = maxVal <= 0 ? 100 : maxVal;
  const valuePct = Math.min((value / maxValSafe) * 100, 100);

  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-mono text-slate-900">
          {value.toFixed(1)}
          {unit}
          {industryAvg != null && (
            <span className="ml-2 text-slate-500">
              業界平均: {industryAvg.toFixed(1)}
              {unit}
            </span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-6 flex-1 overflow-hidden rounded bg-slate-100">
          <div
            className="h-full rounded transition-all"
            style={{
              width: `${valuePct}%`,
              backgroundColor:
                color === "green"
                  ? "#10b981"
                  : color === "red"
                    ? "#ef4444"
                    : "#94a3b8",
            }}
          />
        </div>
        {industryAvg != null && (
          <div
            className="h-6 w-1 shrink-0 rounded bg-slate-500"
            title={`業界平均 ${industryAvg.toFixed(1)}${unit}`}
          />
        )}
      </div>
    </div>
  );
}

export function FinancialAnalysisSection({ metrics }: FinancialAnalysisSectionProps) {
  const alerts = getRiskAlerts(metrics);

  return (
    <div className="space-y-6">
      {alerts.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-red-800">
            リスクアラート
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
            {alerts.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          財務指標と業界平均の比較
        </h3>
        <div className="space-y-1">
          <MetricBar
            label="ROE（自己資本利益率）"
            value={metrics.roe}
            industryAvg={metrics.industry_avg_roe}
          />
          <MetricBar
            label="ROA（総資産利益率）"
            value={metrics.roa}
            industryAvg={metrics.industry_avg_roa}
          />
          <MetricBar
            label="営業利益率"
            value={metrics.operating_margin}
            industryAvg={metrics.industry_avg_operating_margin}
          />
          <MetricBar
            label="流動比率"
            value={metrics.current_ratio}
            industryAvg={metrics.industry_avg_current_ratio}
          />
          <MetricBar
            label="自己資本比率"
            value={metrics.equity_ratio}
            industryAvg={metrics.industry_avg_equity_ratio}
          />
          {metrics.debt_equity_ratio != null && (
            <MetricBar
              label="負債比率"
              value={metrics.debt_equity_ratio}
              industryAvg={null}
              higherIsBetter={false}
            />
          )}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          緑: 業界平均以上 / 赤: 業界平均未満
        </p>
      </div>
    </div>
  );
}
