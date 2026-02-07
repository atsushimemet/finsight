-- 既存のサンプル案件に財務指標だけ投入する場合に SQL Editor で実行
-- 案件名が一致する 1 件ずつに 1 レコード入ります（既に存在する場合はスキップ）

INSERT INTO public.financial_metrics (
  loan_application_id,
  revenue,
  operating_profit,
  net_income,
  total_assets,
  total_liabilities,
  equity,
  current_assets,
  current_liabilities,
  roe,
  roa,
  current_ratio,
  debt_equity_ratio,
  operating_margin,
  equity_ratio,
  asset_turnover,
  industry_avg_roe,
  industry_avg_roa,
  industry_avg_current_ratio,
  industry_avg_operating_margin,
  industry_avg_equity_ratio
)
SELECT id, 500000000, 25000000, 19600000, 700000000, 455000000, 245000000, 240000000, 200000000,
  8.0, 2.8, 120.0, 185.7, 5.0, 35.0, 0.71, 6.0, 3.0, 110.0, 4.0, 30.0
FROM public.loan_applications WHERE company_name = '株式会社サンプル製造' LIMIT 1
ON CONFLICT (loan_application_id) DO NOTHING;

INSERT INTO public.financial_metrics (
  loan_application_id,
  revenue,
  operating_profit,
  net_income,
  total_assets,
  total_liabilities,
  equity,
  current_assets,
  current_liabilities,
  roe,
  roa,
  current_ratio,
  debt_equity_ratio,
  operating_margin,
  equity_ratio,
  asset_turnover,
  industry_avg_roe,
  industry_avg_roa,
  industry_avg_current_ratio,
  industry_avg_operating_margin,
  industry_avg_equity_ratio
)
SELECT id, 300000000, 24000000, 18000000, 300000000, 135000000, 165000000, 150000000, 100000000,
  10.9, 6.0, 150.0, 81.8, 8.0, 55.0, 1.0, 8.0, 4.0, 120.0, 5.0, 35.0
FROM public.loan_applications WHERE company_name = '有限会社グリーン食品' LIMIT 1
ON CONFLICT (loan_application_id) DO NOTHING;

INSERT INTO public.financial_metrics (
  loan_application_id,
  revenue,
  operating_profit,
  net_income,
  total_assets,
  total_liabilities,
  equity,
  current_assets,
  current_liabilities,
  roe,
  roa,
  current_ratio,
  debt_equity_ratio,
  operating_margin,
  equity_ratio,
  asset_turnover,
  industry_avg_roe,
  industry_avg_roa,
  industry_avg_current_ratio,
  industry_avg_operating_margin,
  industry_avg_equity_ratio
)
SELECT id, 1200000000, 12000000, 8000000, 1000000000, 920000000, 80000000, 340000000, 400000000,
  10.0, 0.8, 85.0, 1150.0, 1.0, 8.0, 1.2, 7.0, 3.5, 115.0, 4.0, 32.0
FROM public.loan_applications WHERE company_name = '山田建設株式会社' LIMIT 1
ON CONFLICT (loan_application_id) DO NOTHING;
