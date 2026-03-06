-- Safely seed test users for E2E testing
-- Using raw_app_meta_data and raw_user_meta_data for local compatibility

-- 1. Athlete User
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000001', 
  '00000000-0000-0000-0000-000000000000', 
  'authenticated', 
  'authenticated', 
  'athlete@example.com', 
  extensions.crypt('password123', extensions.gen_salt('bf')), 
  now(), 
  '{"provider": "email", "providers": ["email"]}', 
  '{"display_name": "Test Athlete"}'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Coach User
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000002', 
  '00000000-0000-0000-0000-000000000000', 
  'authenticated', 
  'authenticated', 
  'coach@example.com', 
  extensions.crypt('password123', extensions.gen_salt('bf')), 
  now(), 
  '{"provider": "email", "providers": ["email"]}', 
  '{"display_name": "Test Coach"}'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Profiles
INSERT INTO public.profiles (id, role, display_name, team_code)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'athlete', 'Test Athlete', NULL),
  ('00000000-0000-0000-0000-000000000002', 'coach', 'Test Coach', 'COACH1')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  team_code = COALESCE(profiles.team_code, EXCLUDED.team_code);

-- 4. Athlete Profile
INSERT INTO public.athlete_profiles (athlete_id, sport, competitive_level, anxiety_symptoms, time_preference, onboarding_complete)
VALUES ('00000000-0000-0000-0000-000000000001', 'basketball', 'college', ARRAY['overthinking', 'physical_tension'], '5min', true)
ON CONFLICT (athlete_id) DO UPDATE SET
  onboarding_complete = true;
