-- 組織マスタ seed（冪等）。MVP では組織・役職は SQL シード（編集 UI は Phase 2）。
INSERT INTO public.divisions (code, name) VALUES ('HQ', '本社')
  ON CONFLICT (code) DO NOTHING;

INSERT INTO public.departments (code, name, division_id)
  SELECT 'DEPT1', '開発部', d.id FROM public.divisions d WHERE d.code = 'HQ'
  ON CONFLICT (code) DO NOTHING;

INSERT INTO public.sections (code, name, department_id)
  SELECT 'SEC1', '第一課', dp.id FROM public.departments dp WHERE dp.code = 'DEPT1'
  ON CONFLICT (code) DO NOTHING;

-- 役職コードがロールを決める（90_rls_helpers.app.is_admin は 990-999 を admin とみなす）
INSERT INTO public.positions (code, name) VALUES
  (300, '一般社員'),
  (500, '課長'),
  (700, '部長'),
  (900, '本部長'),
  (999, '管理者')
  ON CONFLICT (code) DO NOTHING;
