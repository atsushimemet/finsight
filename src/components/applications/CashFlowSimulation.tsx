"use client";

import { useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type {
  FinancialMetrics,
  FinancialStatement,
  LoanApplication,
} from "@/types/database";
import { estimateMonthlyOperatingCashFlow } from "@/lib/finance";

type ScenarioId =
  | "base"
  | "revenue-10"
  | "revenue-20"
  | "revenue-30"
  | "cost+10"
  | "cost+20"
  | "rate+0.5"
  | "rate+1.0";

interface ScenarioConfig {
  id: ScenarioId;
  label: string;
  description: string;
  revenueChangePct?: number;
  costChangePct?: number;
  interestRateDelta?: number;
  color: string;
}

const SCENARIOS: ScenarioConfig[] = [
  {
    id: "base",
    label: "ベースケース",
    description: "直近の営業CF平均",
    color: "#2563eb",
  },
  {
    id: "revenue-10",
    label: "売上 -10%",
    description: "売上10%減",
    revenueChangePct: -10,
    color: "#0ea5e9",
  },
  {
    id: "revenue-20",
    label: "売上 -20%",
    description: "売上20%減",
    revenueChangePct: -20,
    color: "#0284c7",
  },
  {
    id: "revenue-30",
    label: "売上 -30%",
    description: "売上30%減",
    revenueChangePct: -30,
    color: "#0369a1",
  },
  {
    id: "cost+10",
    label: "経費 +10%",
    description: "コスト10%増",
    costChangePct: 10,
    color: "#f97316",
  },
  {
    id: "cost+20",
    label: "経費 +20%",
    description: "コスト20%増",
    costChangePct: 20,
    color: "#ea580c",
  },
  {
    id: "rate+0.5",
    label: "金利 +0.5%",
    description: "年率0.5%上昇",
    interestRateDelta: 0.5,
    color: "#059669",
  },
  {
    id: "rate+1.0",
    label: "金利 +1.0%",
    description: "年率1.0%上昇",
    interestRateDelta: 1.0,
    color: "#047857",
  },
];

const SCENARIO_GROUPS: { title: string; scenarioIds: ScenarioId[] }[] = [
  { title: "ベースケース", scenarioIds: ["base"] },
  { title: "売上減少シナリオ", scenarioIds: ["revenue-10", "revenue-20", "revenue-30"] },
  { title: "経費増加シナリオ", scenarioIds: ["cost+10", "cost+20"] },
  { title: "金利上昇シナリオ", scenarioIds: ["rate+0.5", "rate+1.0"] },
];

interface SimulationFormState {
  loanAmountMan: number;
  loanPeriod: number;
  interestRate: number;
  gracePeriod: number;
}

interface SimulationPoint {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  remainingPrincipal: number;
  netCashFlow: number;
  cumulative: number;
}

interface ScenarioResult {
  schedule: SimulationPoint[];
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  minCashFlow: number;
  negativeMonths: number;
  adjustedOperatingCF: number;
  appliedInterestRate: number;
}

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(Math.round(value));
}

function adjustOperatingCashFlow(
  baseMonthlyCF: number,
  config: ScenarioConfig
) {
  let cf = baseMonthlyCF;
  if (config.revenueChangePct != null) {
    cf *= 1 + config.revenueChangePct / 100;
  }
  if (config.costChangePct != null) {
    cf *= 1 - config.costChangePct / 100;
  }
  return cf;
}

function simulateLoan(params: {
  principal: number;
  loanPeriod: number;
  gracePeriod: number;
  annualInterestRate: number;
  monthlyOperatingCashFlow: number;
}): ScenarioResult {
  const {
    principal,
    loanPeriod,
    gracePeriod,
    annualInterestRate,
    monthlyOperatingCashFlow,
  } = params;
  const period = Math.max(loanPeriod, 1);
  const grace = Math.min(Math.max(gracePeriod, 0), Math.max(period - 1, 0));
  const repaymentMonths = Math.max(period - grace, 1);
  const monthlyRate = annualInterestRate / 100 / 12;
  const amortizedPayment =
    monthlyRate === 0
      ? principal / repaymentMonths
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -repaymentMonths));

  let balance = principal;
  let cumulative = 0;
  let totalInterest = 0;
  const schedule: SimulationPoint[] = [];

  for (let month = 1; month <= period; month++) {
    const interest = balance * monthlyRate;
    let payment = 0;
    let principalPaid = 0;

    if (month <= grace) {
      payment = interest;
    } else {
      payment = amortizedPayment;
      principalPaid = payment - interest;
      if (principalPaid > balance) {
        principalPaid = balance;
        payment = interest + principalPaid;
      }
      balance = Math.max(balance - principalPaid, 0);
    }

    totalInterest += interest;
    cumulative += monthlyOperatingCashFlow - payment;
    schedule.push({
      month,
      payment,
      interest,
      principal: principalPaid,
      remainingPrincipal: balance,
      netCashFlow: monthlyOperatingCashFlow - payment,
      cumulative,
    });
  }

  const totalPayment = schedule.reduce((sum, point) => sum + point.payment, 0);
  const minCashFlow = Math.min(...schedule.map((point) => point.netCashFlow));
  const negativeMonths = schedule.filter((point) => point.netCashFlow < 0).length;

  return {
    schedule,
    monthlyPayment: amortizedPayment,
    totalInterest,
    totalPayment,
    minCashFlow,
    negativeMonths,
    adjustedOperatingCF: monthlyOperatingCashFlow,
    appliedInterestRate: annualInterestRate,
  };
}

interface ChartSeries {
  id: string;
  label: string;
  color: string;
  values: number[];
  dashed?: boolean;
}

function CashFlowChart({
  series,
}: {
  series: ChartSeries[];
}) {
  if (series.length === 0 || series.every((line) => line.values.length === 0)) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
        データがありません。
      </div>
    );
  }

  const width = 640;
  const height = 240;
  const allValues = series.flatMap((line) => line.values);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(0, ...allValues);
  const range = maxValue - minValue || 1;
  const zeroY = height - ((0 - minValue) / range) * height;
  const maxLength = Math.max(...series.map((line) => line.values.length));
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handlePointerMove = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || maxLength === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const ratio = rect.width === 0 ? 0 : relativeX / rect.width;
    const index = Math.min(
      maxLength - 1,
      Math.max(0, Math.round(ratio * (maxLength - 1)))
    );
    setHoverIndex(index);
  };

  const handlePointerLeave = () => setHoverIndex(null);

  const hoverDetails = hoverIndex == null
    ? []
    : series
        .map((line) => ({
          id: line.id,
          label: line.label,
          color: line.color,
          value: line.values[hoverIndex] ?? null,
        }))
        .filter((detail) => detail.value != null);

  const hoverX =
    hoverIndex == null || maxLength <= 1
      ? null
      : (hoverIndex / (maxLength - 1)) * width;

  const monthLabel = hoverIndex != null ? `${hoverIndex + 1}ヶ月目` : null;

  const buildPath = (values: number[]) => {
    if (values.length === 0) return "";
    return values
      .map((value, index) => {
        const x = (index / Math.max(values.length - 1, 1)) * width;
        const y = height - ((value - minValue) / range) * height;
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-60 w-full touch-none"
        role="img"
        aria-label="キャッシュフローシミュレーションの折れ線グラフ"
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
      >
        <line
          x1={0}
          x2={width}
          y1={zeroY}
          y2={zeroY}
          stroke="#cbd5f5"
          strokeDasharray="4 4"
        />
        {series.map((line) => (
          <path
            key={line.id}
            d={buildPath(line.values)}
            fill="none"
            stroke={line.color}
            strokeWidth={2.5}
            strokeDasharray={line.dashed ? "6 4" : undefined}
          />
        ))}

        {hoverX != null && (
          <g>
            <line
              x1={hoverX}
              x2={hoverX}
              y1={0}
              y2={height}
              stroke="#94a3b8"
              strokeDasharray="4 4"
            />
            {hoverDetails.map((detail) => {
              const value = detail.value ?? 0;
              const y = height - ((value - minValue) / range) * height;
              return (
                <circle
                  key={`${detail.id}-hover`}
                  cx={hoverX}
                  cy={y}
                  r={4}
                  fill="#fff"
                  stroke={detail.color}
                  strokeWidth={2}
                />
              );
            })}
          </g>
        )}
      </svg>

      {hoverDetails.length > 0 && hoverX != null && monthLabel && (
        <div
          className="pointer-events-none absolute rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow"
          style={{
            left: `min(calc(${(hoverX / width) * 100}% + 10px), calc(100% - 160px))`,
            top: 12,
          }}
        >
          <p className="font-medium text-slate-700">{monthLabel}</p>
          <ul className="mt-1 space-y-1">
            {hoverDetails.map((detail) => (
              <li key={detail.id} className="flex items-center gap-2 text-slate-600">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: detail.color }}
                />
                <span className="flex-1">{detail.label}</span>
                <span className="font-mono text-slate-900">
                  {formatCurrency(detail.value ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function CashFlowSimulation({
  application,
  metrics,
  statements,
}: {
  application: LoanApplication;
  metrics: FinancialMetrics | null;
  statements: FinancialStatement[];
}) {
  const [form, setForm] = useState<SimulationFormState>(() => ({
    loanAmountMan: Math.max(Math.round(application.loan_amount / 10000), 1),
    loanPeriod: application.loan_period || 60,
    interestRate: application.interest_rate ?? 3,
    gracePeriod: 0,
  }));
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>("base");

  const baseMonthlyOperatingCF = useMemo(
    () => estimateMonthlyOperatingCashFlow(statements, metrics, application),
    [statements, metrics, application]
  );

  const loanAmountYen = Math.max(form.loanAmountMan, 1) * 10000;
  const loanPeriod = Math.max(form.loanPeriod, 1);
  const gracePeriod = Math.min(Math.max(form.gracePeriod, 0), Math.max(loanPeriod - 1, 0));

  const scenarioResults = useMemo(() => {
    const results: Record<ScenarioId, ScenarioResult> = {} as Record<ScenarioId, ScenarioResult>;
    SCENARIOS.forEach((config) => {
      const adjustedCF = adjustOperatingCashFlow(baseMonthlyOperatingCF, config);
      const appliedInterest = Math.max(form.interestRate + (config.interestRateDelta ?? 0), 0);
      results[config.id] = simulateLoan({
        principal: loanAmountYen,
        loanPeriod,
        gracePeriod,
        annualInterestRate: appliedInterest,
        monthlyOperatingCashFlow: adjustedCF,
      });
    });
    return results;
  }, [baseMonthlyOperatingCF, gracePeriod, loanAmountYen, loanPeriod, form.interestRate]);

  const activeScenario = SCENARIOS.find((scenario) => scenario.id === activeScenarioId) ?? SCENARIOS[0];
  const activeResult = scenarioResults[activeScenario.id];
  const baseResult = scenarioResults.base;

  const chartSeries: ChartSeries[] = [
    {
      id: "base",
      label: "ベースケース",
      color: SCENARIOS[0]?.color ?? "#2563eb",
      values: baseResult?.schedule.map((point) => point.netCashFlow) ?? [],
    },
  ];
  if (activeScenario.id !== "base") {
    chartSeries.push({
      id: activeScenario.id,
      label: activeScenario.label,
      color: activeScenario.color,
      values: activeResult?.schedule.map((point) => point.netCashFlow) ?? [],
    });
  }

  if (activeResult) {
    const paymentValues = Array.from({ length: activeResult.schedule.length }, () => -activeResult.monthlyPayment);
    chartSeries.push({
      id: "monthly-payment",
      label: `${activeScenario.label}の月次返済額`,
      color: "#475569",
      values: paymentValues,
      dashed: true,
    });
  }

  const negativeMonthsList = (activeResult?.schedule ?? [])
    .filter((point) => point.netCashFlow < 0)
    .map((point) => point.month);

  const evaluationMessage = activeResult?.negativeMonths
    ? "返済計画にリスクがあります。融資額または返済期間の見直しをご検討ください。"
    : "返済計画は妥当です。キャッシュフローは全期間で黒字を維持しています。";

  const evaluationTone = activeResult?.negativeMonths ? "warning" : "success";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-base font-semibold text-slate-900">シミュレーション条件</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">営業キャッシュフロー（月次・推定）</dt>
              <dd className="font-mono text-slate-900">
                {formatCurrency(baseMonthlyOperatingCF)} / 月
              </dd>
            </div>
          </dl>
          <form className="mt-4 grid gap-4" onSubmit={(e) => e.preventDefault()}>
            <label className="text-sm font-medium text-slate-700">
              融資額（万円）
              <input
                type="number"
                min={1}
                value={Number.isFinite(form.loanAmountMan) ? form.loanAmountMan : ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    loanAmountMan: Number(e.target.value) || 0,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              返済期間（月）
              <input
                type="number"
                min={1}
                value={loanPeriod}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    loanPeriod: Number(e.target.value) || 1,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              金利（年率%）
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.interestRate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    interestRate: Number(e.target.value) || 0,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              据置期間（月）
              <input
                type="number"
                min={0}
                value={gracePeriod}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    gracePeriod: Number(e.target.value) || 0,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
              />
            </label>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-base font-semibold text-slate-900">結果サマリー</h3>
          <div
            className={`mt-4 rounded-lg px-4 py-3 text-sm ${
              evaluationTone === "warning"
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            {evaluationMessage}
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">月次返済額</dt>
              <dd className="font-mono text-slate-900">
                {formatCurrency(activeResult?.monthlyPayment ?? 0)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">総利息（概算）</dt>
              <dd className="font-mono text-slate-900">
                {formatCurrency(activeResult?.totalInterest ?? 0)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">最低キャッシュフロー</dt>
              <dd className="font-mono text-slate-900">
                {formatCurrency(activeResult?.minCashFlow ?? 0)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">キャッシュフロー赤字月数</dt>
              <dd className="font-mono text-slate-900">
                {activeResult?.negativeMonths ?? 0}ヶ月
              </dd>
            </div>
          </dl>
          {negativeMonthsList.length > 0 && (
            <div className="mt-4 text-xs text-amber-700">
              赤字となる月: {negativeMonthsList.join("、")}月
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">キャッシュフロー推移</h3>
            <p className="text-sm text-slate-500">
              ベースケースと選択したリスクシナリオを比較しています。
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SCENARIOS[0].color }} />
              ベースケース
            </span>
            {activeScenario.id !== "base" && (
              <span className="flex items-center gap-1 text-slate-600">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeScenario.color }} />
                {activeScenario.label}
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-600">
              <span className="h-2 w-4 border-t-2 border-dashed border-slate-500" />
              月次返済額（支出）
            </span>
          </div>
        </div>
        <div className="mt-4">
          <CashFlowChart series={chartSeries} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-base font-semibold text-slate-900">リスクシナリオ</h3>
        <p className="mt-1 text-sm text-slate-500">
          比較したいシナリオを選択すると、グラフとサマリーが更新されます。
        </p>
        <div className="mt-4 space-y-4">
          {SCENARIO_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-medium text-slate-700">{group.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.scenarioIds.map((scenarioId) => {
                  const scenario = SCENARIOS.find((item) => item.id === scenarioId)!;
                  const isActive = activeScenarioId === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      className={`rounded-full border px-3 py-1 text-sm transition ${
                        isActive
                          ? "border-transparent bg-[#2563eb] text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-[#2563eb] hover:text-[#2563eb]"
                      }`}
                      onClick={() => setActiveScenarioId(scenario.id)}
                    >
                      {scenario.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
