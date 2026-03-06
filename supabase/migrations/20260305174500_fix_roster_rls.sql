-- Add RLS policy to allow athletes to join a team
-- This allows an authenticated user to insert themselves into a coach's roster
CREATE POLICY "Athletes can join a team" ON public.coach_roster
    FOR INSERT
    WITH CHECK (auth.uid() = athlete_id);
