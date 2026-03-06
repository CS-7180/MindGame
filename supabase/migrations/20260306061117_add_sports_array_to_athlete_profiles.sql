-- Add sports TEXT[] column to athlete_profiles
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS sports TEXT[] DEFAULT '{}';

-- Backfill existing sport to sports array
UPDATE athlete_profiles
SET sports = ARRAY[sport]
WHERE sport IS NOT NULL 
  AND sport != '' 
  AND (sports IS NULL OR sports = '{}');
