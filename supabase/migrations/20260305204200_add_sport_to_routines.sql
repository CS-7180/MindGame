-- =============================================================================
-- US-01 Multi-Sport Dashboard Navigation: Add sport to routines
-- =============================================================================
-- This migration adds a 'sport' column to the 'routines' table and 
-- backfills it using the athlete's primary sport from 'profiles'
-- for existing routines.

-- 1. Add the column (nullable temporarily for existing rows)
ALTER TABLE public.routines 
ADD COLUMN sport text;

-- 2. Backfill existing routines with the athlete's primary sport
UPDATE public.routines r
SET sport = p.sport
FROM public.athlete_profiles p
WHERE r.athlete_id = p.athlete_id;

-- 3. Set a fallback for any routines where the athlete had no primary sport
UPDATE public.routines
SET sport = 'Unspecified'
WHERE sport IS NULL;

-- 4. Make the column NOT NULL after backfilling
ALTER TABLE public.routines 
ALTER COLUMN sport SET NOT NULL;

-- 5. Set templates to inactive (so they don't break the unique index)
UPDATE public.routines
SET is_active = false
WHERE athlete_id = '00000000-0000-0000-0000-000000000000';

-- 6. Deduplicate active routines per athlete and sport (keep the most recently created one)
UPDATE public.routines
SET is_active = false
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY athlete_id, sport ORDER BY created_at DESC) as rn
    FROM public.routines
    WHERE is_active = true
  ) sub
  WHERE rn > 1
);

-- 7. Drop the old partial index on is_active = true
DROP INDEX IF EXISTS idx_routines_athlete_active;

-- 8. Create a new partial index enforcing one active routine PER SPORT per athlete
CREATE UNIQUE INDEX idx_routines_athlete_sport_active 
ON public.routines (athlete_id, sport) 
WHERE is_active = true;
