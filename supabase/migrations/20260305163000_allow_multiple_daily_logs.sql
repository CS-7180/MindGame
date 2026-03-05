-- Drop the single-log-per-day constraint so athletes can log multiple pre-game routines in a single day
ALTER TABLE public.game_logs DROP CONSTRAINT IF EXISTS game_logs_athlete_id_log_date_key;
