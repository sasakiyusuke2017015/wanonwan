-- スケジュール（27929, Issues）。面談日時・イベント。
CREATE TABLE IF NOT EXISTS public.schedules (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title      text,
  body       text,
  start_at   timestamptz,
  end_at     timestamptz,
  all_day    boolean NOT NULL DEFAULT false,
  color      text,
  icon       text,
  event_type text,
  created_by bigint REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedules_start ON public.schedules(start_at);
