import type {
  FinancialMetrics,
  FinancialStatement,
  LoanApplication,
} from "@/types/database";

/**
 * 決算書または財務指標から月次ベースの営業キャッシュフローを推定する。
 * キャッシュフローが得られない場合は利益や売上に基づく簡易推計を行い、
 * 最後の手段として融資額や固定額に基づいた安全側の値を返す。
 */
export function estimateMonthlyOperatingCashFlow(
  statements: FinancialStatement[],
  metrics: FinancialMetrics | null,
  application: LoanApplication
): number {
  const statementValues = statements
    .map((statement) => statement.operating_cash_flow)
    .filter((value): value is number => typeof value === "number");
  if (statementValues.length > 0) {
    const averageAnnual =
      statementValues.reduce((sum, value) => sum + value, 0) /
      statementValues.length;
    return averageAnnual / 12;
  }

  if (metrics?.operating_profit != null) {
    return metrics.operating_profit / 12;
  }

  if (metrics?.net_income != null) {
    return metrics.net_income / 12;
  }

  if (metrics?.revenue != null && metrics?.operating_margin != null) {
    const marginRatio = metrics.operating_margin / 100;
    return (metrics.revenue * marginRatio) / 12;
  }

  const fallbackAnnual = Math.max(application.loan_amount * 0.25, 6_000_000);
  return fallbackAnnual / 12;
}

/**
 * 元利均等返済の月次返済額を算出する（据置期間は考慮しない簡易版）。
 */
export function calculateMonthlyRepayment(
  principal: number,
  months: number,
  annualInterestRate: number
): number {
  const totalMonths = Math.max(months, 1);
  const monthlyRate = annualInterestRate / 100 / 12;
  if (monthlyRate === 0) {
    return principal / totalMonths;
  }
  return (
    (principal * monthlyRate) /
    (1 - Math.pow(1 + monthlyRate, -totalMonths))
  );
}
