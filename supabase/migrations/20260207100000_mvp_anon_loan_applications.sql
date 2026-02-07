-- MVP: ログイン不要で案件一覧・新規作成を利用可能にする
-- user_id の FK を外し、anon で SELECT/INSERT を許可する

ALTER TABLE public.loan_applications
  DROP CONSTRAINT IF EXISTS loan_applications_user_id_fkey;

CREATE POLICY "MVP: anon can select all loan applications"
  ON public.loan_applications FOR SELECT
  USING (true);

CREATE POLICY "MVP: anon can insert loan applications"
  ON public.loan_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "MVP: anon can update loan applications"
  ON public.loan_applications FOR UPDATE
  USING (true);

CREATE POLICY "MVP: anon can delete loan applications"
  ON public.loan_applications FOR DELETE
  USING (true);
