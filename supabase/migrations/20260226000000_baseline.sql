-- Baseline Schema based on types/database.ts

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key,
  display_name text,
  role text,
  team_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.athlete_profiles (
  id uuid default gen_random_uuid() primary key,
  athlete_id uuid references public.profiles(id) not null unique,
  sport text,
  competitive_level text,
  time_preference text,
  anxiety_symptoms text[],
  onboarding_complete boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.coach_roster (
  id uuid default gen_random_uuid() primary key,
  coach_id uuid references public.profiles(id) not null,
  athlete_id uuid references public.profiles(id) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.techniques (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null,
  category text not null,
  duration_minutes integer not null,
  instruction text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.coach_templates (
  id uuid default gen_random_uuid() primary key,
  coach_id uuid references public.profiles(id) not null,
  name text not null,
  time_tier text,
  coach_note text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.routines (
  id uuid default gen_random_uuid() primary key,
  athlete_id uuid references public.profiles(id) not null,
  name text not null,
  sport text not null,
  source text,
  is_active boolean default false,
  coach_template_id uuid references public.coach_templates(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.routine_steps (
  id uuid default gen_random_uuid() primary key,
  routine_id uuid references public.routines(id) not null,
  technique_id uuid references public.techniques(id) not null,
  step_order integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.coach_template_steps (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references public.coach_templates(id) not null,
  technique_id uuid references public.techniques(id) not null,
  step_order integer not null
);

CREATE TABLE IF NOT EXISTS public.games (
  id uuid default gen_random_uuid() primary key,
  athlete_id uuid references public.profiles(id) not null,
  sport text not null,
  scheduled_at timestamp with time zone not null,
  reminder_offset_min integer,
  reminder_sent boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.game_logs (
  id uuid default gen_random_uuid() primary key,
  athlete_id uuid references public.profiles(id) not null,
  game_id uuid references public.games(id),
  sport text not null,
  log_date date not null,
  pre_anxiety_level integer,
  pre_confidence_level integer,
  pre_notes text,
  pre_logged_at timestamp with time zone,
  routine_completed text,
  post_mental_state integer,
  post_performance integer,
  post_descriptor text,
  post_logged_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  athlete_id uuid references public.profiles(id) not null,
  endpoint text not null,
  p256dh_key text not null,
  auth_key text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.template_notifications (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references public.coach_templates(id) not null,
  coach_id uuid references public.profiles(id) not null,
  athlete_id uuid references public.profiles(id) not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE OR REPLACE FUNCTION delete_game_log_entry(entry_id uuid) RETURNS void AS $$
BEGIN
  DELETE FROM public.game_logs WHERE id = entry_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_user_data() RETURNS void AS $$
BEGIN
  -- Stub
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_team_code() RETURNS text AS $$
BEGIN
  RETURN substr(md5(random()::text), 1, 6);
END;
$$ LANGUAGE plpgsql;
