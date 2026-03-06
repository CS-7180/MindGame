-- =============================================================================
-- Phase 4: Coach-Athlete Linking (Team Codes)
-- =============================================================================

-- 1. Add team_code column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS team_code TEXT UNIQUE;

-- 2. Create function to generate random 6-character alphanumeric codes
-- Uses a simplified character set to avoid ambiguous characters (O/0, I/1)
CREATE OR REPLACE FUNCTION generate_team_code() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    -- Ensure uniqueness
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE team_code = result);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger function to auto-generate code for coaches
CREATE OR REPLACE FUNCTION public.handle_team_code_generation()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if user is a coach and doesn't have a code yet
    IF NEW.role = 'coach' AND (NEW.team_code IS NULL OR NEW.team_code = '') THEN
        NEW.team_code := generate_team_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Apply trigger to profiles table
DROP TRIGGER IF EXISTS on_coach_profile_upsert ON public.profiles;
CREATE TRIGGER on_coach_profile_upsert
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_team_code_generation();

-- 5. Backfill existing coaches
UPDATE public.profiles
SET team_code = generate_team_code()
WHERE role = 'coach' AND (team_code IS NULL OR team_code = '');

-- 6. Add RLS policy for team_code visibility
-- Coaches should be able to see their own team_code
-- Athletes will need to query by team_code to find a coach, but we usually handle that in the API
CREATE POLICY "Coaches can view their own team_code" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Allow athletes to select from profiles if they know the team_code (needed for joining)
CREATE POLICY "Allow public lookup by team_code" ON public.profiles
    FOR SELECT
    USING (team_code IS NOT NULL);
