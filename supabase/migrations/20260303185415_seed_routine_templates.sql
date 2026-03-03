-- We need a dedicated 'system' athlete to own these global templates
-- We can just use a fixed UUID for this pseudo-user, or flag them as templates.
-- The easiest approach is to add an `is_template` boolean to `routines` if it doesn't exist,
-- or use a predefined UUID `00000000-0000-0000-0000-000000000000` as the athlete_id.
-- Let's update `routines` to have `is_template` boolean default false.

-- 1. Add `is_template` column
ALTER TABLE public.routines 
ADD COLUMN IF NOT EXISTS is_template BOOLEAN NOT NULL DEFAULT false;

-- 2. Create the system athlete for templates (so RLS doesn't break)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, app_metadata, user_metadata, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES 
('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'system@mindgame.app', '', TIMEZONE('utc', now()), NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', TIMEZONE('utc', now()), TIMEZONE('utc', now()), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.athlete_profiles (id, username, created_at, updated_at)
VALUES 
('00000000-0000-0000-0000-000000000000', 'MindGame Templates', TIMEZONE('utc', now()), TIMEZONE('utc', now()))
ON CONFLICT (id) DO NOTHING;

-- 3. Delete existing templates to make this idempotent
DELETE FROM public.routines WHERE athlete_id = '00000000-0000-0000-0000-000000000000';

-- 4. Insert 10 Routine Templates
WITH inserted_routines AS (
  INSERT INTO public.routines (id, athlete_id, name, source, is_template, created_at)
  VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'The 2-Minute Reset' /* 2m QUICK */, 'custom', true, now() - interval '10 days'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Pre-Serve Focus' /* 2m QUICK */, 'custom', true, now() - interval '9 days'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Timeout Breather' /* 2m QUICK */, 'custom', true, now() - interval '8 days'),
    
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'The 5-Minute Primer' /* 5m STANDARD */, 'custom', true, now() - interval '7 days'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Pre-Game Calm' /* 4m STANDARD */, 'custom', true, now() - interval '6 days'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Locker Room Visualization' /* 5m STANDARD */, 'custom', true, now() - interval '5 days'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Anxiety Relief Flow' /* 5m STANDARD */, 'custom', true, now() - interval '4 days'),
    
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Extended Pre-Game Ritual' /* 8m EXTENDED */, 'custom', true, now() - interval '3 days'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Complete Mind-Body Prep' /* 10m EXTENDED */, 'custom', true, now() - interval '2 days'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Championship Focus Routine' /* 7m EXTENDED */, 'custom', true, now() - interval '1 days')
  RETURNING id, name
)
-- 5. Insert Steps for the templates
INSERT INTO public.routine_steps (routine_id, technique_id, step_order)
SELECT 
  ir.id as routine_id,
  steps.technique_id,
  steps.step_order
FROM inserted_routines ir
JOIN (
  -- QUICK TIERS
  -- 1. The 2-Minute Reset (Box Breathing, 2m) -> Total 2m
  SELECT 'The 2-Minute Reset' as r_name, '10b6e1e5-ef39-4403-b9e3-c52a50333ded'::uuid as technique_id, 0 as step_order
  UNION ALL
  
  -- 2. Pre-Serve Focus (Confidence Affirmations, 2m) -> Total 2m
  SELECT 'Pre-Serve Focus', '851dea98-0f6c-4736-829e-9624bbb4e13a', 0
  UNION ALL
  
  -- 3. Timeout Breather (Focus Word Anchor + Deep Belly, 1+2=3? No, must be <=2) -> Let's use 2x 1m if we had it. We only have 1m, 2m, 3m. 
  -- We'll use Focus Word Anchor (1m) -> Total 1m
  SELECT 'Timeout Breather', '7fd34016-0b47-4d91-b6d5-51de19955ee5', 0
  UNION ALL
  
  -- STANDARD TIERS (3-5m)
  -- 4. The 5-Minute Primer (Box Breathing 2m + Perf Vis 3m) -> Total 5m
  SELECT 'The 5-Minute Primer', '10b6e1e5-ef39-4403-b9e3-c52a50333ded', 0 UNION ALL
  SELECT 'The 5-Minute Primer', '05ab1ecd-3ba7-4e51-9b9d-71c2a9113966', 1
  UNION ALL
  
  -- 5. Pre-Game Calm (Deep Belly 2m + Confidence Aff 2m) -> Total 4m
  SELECT 'Pre-Game Calm', '78e33581-7628-4567-820f-d3b11aae6ee7', 0 UNION ALL
  SELECT 'Pre-Game Calm', '851dea98-0f6c-4736-829e-9624bbb4e13a', 1
  UNION ALL
  
  -- 6. Locker Room Visualization (Perf Vis 3m + Focus Word 1m) -> Total 4m
  SELECT 'Locker Room Visualization', '05ab1ecd-3ba7-4e51-9b9d-71c2a9113966', 0 UNION ALL
  SELECT 'Locker Room Visualization', '7fd34016-0b47-4d91-b6d5-51de19955ee5', 1
  UNION ALL
  
  -- 7. Anxiety Relief Flow (Prog Body Scan 3m + Box Breathing 2m) -> Total 5m
  SELECT 'Anxiety Relief Flow', '223f1f32-1e0d-4e2f-8a9e-55719f8cd168', 0 UNION ALL
  SELECT 'Anxiety Relief Flow', '10b6e1e5-ef39-4403-b9e3-c52a50333ded', 1
  UNION ALL
  
  -- EXTENDED TIERS (6-10m)
  -- 8. Extended Pre-Game Ritual (Box Breathing 2m + Prog Body Scan 3m + Perf Vis 3m) -> Total 8m
  SELECT 'Extended Pre-Game Ritual', '10b6e1e5-ef39-4403-b9e3-c52a50333ded', 0 UNION ALL
  SELECT 'Extended Pre-Game Ritual', '223f1f32-1e0d-4e2f-8a9e-55719f8cd168', 1 UNION ALL
  SELECT 'Extended Pre-Game Ritual', '05ab1ecd-3ba7-4e51-9b9d-71c2a9113966', 2
  UNION ALL
  
  -- 9. Complete Mind-Body Prep (Deep Belly 2m + Prog Body Scan 3m + Perf Vis 3m + Confidence Aff 2m) -> Total 10m
  SELECT 'Complete Mind-Body Prep', '78e33581-7628-4567-820f-d3b11aae6ee7', 0 UNION ALL
  SELECT 'Complete Mind-Body Prep', '223f1f32-1e0d-4e2f-8a9e-55719f8cd168', 1 UNION ALL
  SELECT 'Complete Mind-Body Prep', '05ab1ecd-3ba7-4e51-9b9d-71c2a9113966', 2 UNION ALL
  SELECT 'Complete Mind-Body Prep', '851dea98-0f6c-4736-829e-9624bbb4e13a', 3
  UNION ALL
  
  -- 10. Championship Focus Routine (Box Breathing 2m + Confidence Aff 2m + Perf Vis 3m) -> Total 7m
  SELECT 'Championship Focus Routine', '10b6e1e5-ef39-4403-b9e3-c52a50333ded', 0 UNION ALL
  SELECT 'Championship Focus Routine', '851dea98-0f6c-4736-829e-9624bbb4e13a', 1 UNION ALL
  SELECT 'Championship Focus Routine', '05ab1ecd-3ba7-4e51-9b9d-71c2a9113966', 2
) steps ON ir.name = steps.r_name;

-- 6. Ensure RLS Policies allow anyone to SELECT templates
-- Depending on existing RLS policies on routines, we might need a direct policy
CREATE POLICY "Templates are viewable by everyone" ON public.routines
  FOR SELECT USING (is_template = true);
