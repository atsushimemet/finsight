-- Finsight: loan_applications テーブル（仕様書 3.2.1 を Supabase/PostgreSQL 用に変換）
-- 本番想定: Supabase Auth の auth.users を参照するため user_id は UUID

CREATE TABLE IF NOT EXISTS public.loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry VARCHAR(100),
  established_year INT,
  representative_name TEXT,
  employee_count INT,
  loan_amount BIGINT NOT NULL,
  loan_period INT NOT NULL,
  interest_rate DECIMAL(5,2),
  funding_purpose TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'analyzing', 'completed', 'approved', 'rejected')),
  risk_level VARCHAR(10) CHECK (risk_level IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 有効化
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- 認証ユーザーが自分の案件のみ閲覧・操作可能（本番用）
CREATE POLICY "Users can view own loan applications"
  ON public.loan_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loan applications"
  ON public.loan_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loan applications"
  ON public.loan_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own loan applications"
  ON public.loan_applications FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 自動更新
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER loan_applications_updated_at
  BEFORE UPDATE ON public.loan_applications
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- 開発用: 未ログインでも全件読めるポリシー（本番では削除し上記のみにする）
-- CREATE POLICY "Allow anon read for development" ON public.loan_applications FOR SELECT USING (true);

COMMENT ON TABLE public.loan_applications IS '融資申請案件（仕様書 loanApplications）';
