-- Bugfix: Explicitly ensure coaches can read display_name and role of athletes on their roster
-- This migration hardens the existing selection policy for profiles.

DROP POLICY IF EXISTS "coach_read_rostered_athlete_profiles" ON public.profiles;

CREATE POLICY "coach_read_rostered_athlete_profiles" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.coach_roster cr
            WHERE cr.athlete_id = public.profiles.id
            AND cr.coach_id = auth.uid()
        )
    );

-- Ensure coach can also see the athlete_profiles join if needed later
DROP POLICY IF EXISTS "coach_read_rostered_athlete_details" ON public.athlete_profiles;

CREATE POLICY "coach_read_rostered_athlete_details" ON public.athlete_profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.coach_roster cr
            WHERE cr.athlete_id = public.athlete_profiles.id
            AND cr.coach_id = auth.uid()
        )
    );
