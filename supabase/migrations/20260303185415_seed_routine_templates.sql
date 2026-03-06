-- 1. Make athlete_id nullable to allow 'global' templates not owned by any user
ALTER TABLE public.routines ALTER COLUMN athlete_id DROP NOT NULL;

-- 2. Clear existing templates to make this idempotent
DELETE FROM public.routines WHERE is_template = true AND athlete_id IS NULL;

-- 4. Insert 10 Routine Templates
WITH inserted_routines AS (
  INSERT INTO public.routines (id, athlete_id, name, source, is_template, created_at, sport)
  VALUES
    (gen_random_uuid(), NULL, 'The 2-Minute Reset' /* 2m QUICK */, 'custom', true, now() - interval '10 days', 'General'),
    (gen_random_uuid(), NULL, 'Pre-Serve Focus' /* 2m QUICK */, 'custom', true, now() - interval '9 days', 'Tennis'),
    (gen_random_uuid(), NULL, 'Timeout Breather' /* 2m QUICK */, 'custom', true, now() - interval '8 days', 'Basketball'),
    
    (gen_random_uuid(), NULL, 'The 5-Minute Primer' /* 5m STANDARD */, 'custom', true, now() - interval '7 days', 'General'),
    (gen_random_uuid(), NULL, 'Pre-Game Calm' /* 4m STANDARD */, 'custom', true, now() - interval '6 days', 'General'),
    (gen_random_uuid(), NULL, 'Locker Room Visualization' /* 5m STANDARD */, 'custom', true, now() - interval '5 days', 'General'),
    (gen_random_uuid(), NULL, 'Anxiety Relief Flow' /* 5m STANDARD */, 'custom', true, now() - interval '4 days', 'General'),
    
    (gen_random_uuid(), NULL, 'Extended Pre-Game Ritual' /* 8m EXTENDED */, 'custom', true, now() - interval '3 days', 'General'),
    (gen_random_uuid(), NULL, 'Complete Mind-Body Prep' /* 10m EXTENDED */, 'custom', true, now() - interval '2 days', 'General'),
    (gen_random_uuid(), NULL, 'Championship Focus Routine' /* 7m EXTENDED */, 'custom', true, now() - interval '1 days', 'General')
  RETURNING id, name
)
SELECT * FROM inserted_routines; -- Dummy select to satisfy CTE if needed, but not required for INSERT

-- 5. Insert Steps for the templates
-- Clear existing steps for these templates first to ensure idempotency
DELETE FROM public.routine_steps WHERE routine_id IN (SELECT id FROM public.routines WHERE is_template = true AND athlete_id IS NULL);

WITH template_ids AS (
    SELECT id, name FROM public.routines WHERE is_template = true AND athlete_id IS NULL
)
INSERT INTO public.routine_steps (routine_id, technique_id, step_order)
SELECT t.id, s.technique_id, s.step_order
FROM template_ids t
JOIN (
  SELECT 'The 2-Minute Reset' as r_name, '10b6e1e5-ef39-4403-b9e3-c52a50333ded'::uuid as technique_id, 0 as step_order UNION ALL
  SELECT 'Pre-Serve Focus', '851dea98-0f6c-4736-829e-9624bbb4e13a', 0 UNION ALL
  SELECT 'Timeout Breather', '7fd34016-0b47-4d91-b6d5-51de19955ee5', 0 UNION ALL
  SELECT 'The 5-Minute Primer', '10b6e1e5-ef39-4403-b9e3-c52a50333ded', 0 UNION ALL
  SELECT 'The 5-Minute Primer', '05ab1ecd-3ba7-4e51-9b9d-71c2a9113966', 1 UNION ALL
  SELECT 'Pre-Game Calm', '78e33581-7628-4567-820f-d3b11aae6ee7', 0 UNION ALL
  SELECT 'Pre-Game Calm', '851dea98-0f6c-4736-829e-9624bbb4e13a', 1 UNION ALL
  SELECT 'Locker Room Visualization', '05ab1ecd-3ba7-4e51-9b9d-71c2a9113966', 0 UNION ALL
  SELECT 'Locker Room Visualization', '7fd34016-0b47-4d91-b6d5-51de19955ee5', 1 UNION ALL
  SELECT 'Anxiety Relief Flow', '223f1f32-1e0d-4e2f-8a9e-55719f8cd168', 0 UNION ALL
  SELECT 'Anxiety Relief Flow', '10b6e1e5-ef39-4403-b9e3-c52a50333ded', 1 UNION ALL
  SELECT 'Extended Pre-Game Ritual', '10b6e1e5-ef39-4403-b9e3-c52a50333ded', 0 UNION ALL
  SELECT 'Extended Pre-Game Ritual', '223f1f32-1e0d-4e2f-8a9e-55719f8cd168', 1 UNION ALL
  SELECT 'Extended Pre-Game Ritual', '05ab1ecd-3ba7-4e51-9b9d-71c2a9113966', 2 UNION ALL
  SELECT 'Complete Mind-Body Prep', '78e33581-7628-4567-820f-d3b11aae6ee7', 0 UNION ALL
  SELECT 'Complete Mind-Body Prep', '223f1f32-1e0d-4e2f-8a9e-55719f8cd168', 1 UNION ALL
  SELECT 'Complete Mind-Body Prep', '05ab1ecd-3ba7-4e51-9b9d-71c2a9113966', 2 UNION ALL
  SELECT 'Complete Mind-Body Prep', '851dea98-0f6c-4736-829e-9624bbb4e13a', 3 UNION ALL
  SELECT 'Championship Focus Routine', '10b6e1e5-ef39-4403-b9e3-c52a50333ded', 0 UNION ALL
  SELECT 'Championship Focus Routine', '851dea98-0f6c-4736-829e-9624bbb4e13a', 1 UNION ALL
  SELECT 'Championship Focus Routine', '05ab1ecd-3ba7-4e51-9b9d-71c2a9113966', 2
) s ON t.name = s.r_name;

-- 6. Ensure RLS Policies allow anyone to SELECT templates
-- Re-apply policy to handle the NULL athlete_id
DROP POLICY IF EXISTS "Templates are viewable by everyone" ON public.routines;
CREATE POLICY "Templates are viewable by everyone" ON public.routines
  FOR SELECT USING (is_template = true);

-- Also ensure steps are readable for templates with NULL athlete_id
DROP POLICY IF EXISTS "Template steps are viewable by everyone" ON public.routine_steps;
CREATE POLICY "Template steps are viewable by everyone" ON public.routine_steps
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.routines 
    WHERE routines.id = routine_steps.routine_id AND routines.is_template = true
  ));
