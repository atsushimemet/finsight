-- Supabase SQL Editor で実行: financial_metrics が無い場合にテーブルを作成
-- （supabase db reset を使わずに手動でマイグレーションを適用する用）

-- 決算書データ（OCR 結果や手動入力）
CREATE TABLE IF NOT EXISTS public.financial_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  file_url TEXT,
  file_key TEXT,
  fiscal_year INT NOT NULL,
  revenue BIGINT,
  operating_profit BIGINT,
  net_income BIGINT,
  total_assets BIGINT,
  total_liabilities BIGINT,
  equity BIGINT,
  current_assets BIGINT,
  current_liabilities BIGINT,
  operating_cash_flow BIGINT,
  investing_cash_flow BIGINT,
  financing_cash_flow BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 財務指標（計算結果・業界平均比較）
CREATE TABLE IF NOT EXISTS public.financial_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  revenue BIGINT,
  operating_profit BIGINT,
  net_income BIGINT,
  total_assets BIGINT,
  total_liabilities BIGINT,
  equity BIGINT,
  current_assets BIGINT,
  current_liabilities BIGINT,
  roe DECIMAL(10,2),
  roa DECIMAL(10,2),
  current_ratio DECIMAL(10,2),
  debt_equity_ratio DECIMAL(10,2),
  operating_margin DECIMAL(10,2),
  equity_ratio DECIMAL(10,2),
  asset_turnover DECIMAL(10,2),
  inventory_turnover DECIMAL(10,2),
  industry_avg_roe DECIMAL(10,2),
  industry_avg_roa DECIMAL(10,2),
  industry_avg_current_ratio DECIMAL(10,2),
  industry_avg_operating_margin DECIMAL(10,2),
  industry_avg_equity_ratio DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(loan_application_id)
);

ALTER TABLE public.financial_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "MVP: anon all financial_statements" ON public.financial_statements;
CREATE POLICY "MVP: anon all financial_statements"
  ON public.financial_statements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "MVP: anon all financial_metrics" ON public.financial_metrics;
CREATE POLICY "MVP: anon all financial_metrics"
  ON public.financial_metrics FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE public.financial_statements IS '決算書データ（仕様書 financialStatements）';
COMMENT ON TABLE public.financial_metrics IS '財務指標・業界比較（仕様書 financialMetrics）';
