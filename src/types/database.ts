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
