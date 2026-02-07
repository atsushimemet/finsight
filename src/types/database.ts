export type LoanApplicationStatus =
  | "draft"
  | "analyzing"
  | "completed"
  | "approved"
  | "rejected";

export type RiskLevel = "high" | "medium" | "low";

export interface LoanApplication {
  id: string;
  user_id: string;
  company_name: string;
  industry: string | null;
  established_year: number | null;
  representative_name: string | null;
  employee_count: number | null;
  loan_amount: number;
  loan_period: number;
  interest_rate: number | null;
  funding_purpose: string | null;
  status: LoanApplicationStatus;
  risk_level: RiskLevel | null;
  created_at: string;
  updated_at: string;
}

export interface LoanApplicationInsert {
  user_id: string;
  company_name: string;
  industry?: string | null;
  established_year?: number | null;
  representative_name?: string | null;
  employee_count?: number | null;
  loan_amount: number;
  loan_period: number;
  interest_rate?: number | null;
  funding_purpose?: string | null;
  status?: LoanApplicationStatus;
  risk_level?: RiskLevel | null;
}

/** 財務指標（業界平均比較含む） */
export interface FinancialMetrics {
  id: string;
  loan_application_id: string;
  revenue: number | null;
  operating_profit: number | null;
  net_income: number | null;
  total_assets: number | null;
  total_liabilities: number | null;
  equity: number | null;
  current_assets: number | null;
  current_liabilities: number | null;
  roe: number | null;
  roa: number | null;
  current_ratio: number | null;
  debt_equity_ratio: number | null;
  operating_margin: number | null;
  equity_ratio: number | null;
  asset_turnover: number | null;
  inventory_turnover: number | null;
  industry_avg_roe: number | null;
  industry_avg_roa: number | null;
  industry_avg_current_ratio: number | null;
  industry_avg_operating_margin: number | null;
  industry_avg_equity_ratio: number | null;
  created_at: string;
}

export interface FinancialStatement {
  id: string;
  loan_application_id: string;
  file_url: string | null;
  file_key: string | null;
  fiscal_year: number;
  revenue: number | null;
  operating_profit: number | null;
  net_income: number | null;
  total_assets: number | null;
  total_liabilities: number | null;
  equity: number | null;
  current_assets: number | null;
  current_liabilities: number | null;
  operating_cash_flow: number | null;
  investing_cash_flow: number | null;
  financing_cash_flow: number | null;
  created_at: string;
}
