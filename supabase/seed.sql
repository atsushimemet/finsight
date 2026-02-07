-- MVP用: サンプル案件（GUEST_USER_ID = 00000000-0000-0000-0000-000000000001）
INSERT INTO public.loan_applications (
  user_id,
  company_name,
  industry,
  loan_amount,
  loan_period,
  status,
  risk_level
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '株式会社サンプル製造',
    '製造業',
    5000,
    60,
    'draft',
    'medium'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    '有限会社グリーン食品',
    '卸売業・小売業',
    3000,
    36,
    'analyzing',
    'low'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    '山田建設株式会社',
    '建設業',
    10000,
    84,
    'completed',
    'high'
  )
;
