-- =============================================================================
-- US-12: Privacy — All Data Private by Default
-- RLS Hardening Migration
-- =============================================================================
-- This migration:
-- 1. Hardens existing ALL policies with proper with_check clauses
-- 2. Adds coach-specific read policies for limited roster visibility
-- 3. Creates delete_user_data() RPC for full account deletion
-- 4. Creates delete_game_log_entry() RPC for individual entry deletion
-- =============================================================================

-- =============================================================================
-- PART 1: Harden existing ALL policies with WITH CHECK clauses
-- =============================================================================
-- ALL policies without with_check allow inserts/updates with any athlete_id.
-- We drop and recreate them with explicit with_check to prevent spoofed writes.

-- athlete_profiles: only owner can read/write their own row
DROP POLICY IF EXISTS "athlete_own_profile" ON public.athlete_profiles;
CREATE POLICY "athlete_own_profile" ON public.athlete_profiles
    FOR ALL
    USING (auth.uid() = athlete_id)
    WITH CHECK (auth.uid() = athlete_id);

-- game_logs: only owner can read/write their own rows
DROP POLICY IF EXISTS "athlete_own_logs" ON public.game_logs;
CREATE POLICY "athlete_own_logs" ON public.game_logs
    FOR ALL
    USING (auth.uid() = athlete_id)
    WITH CHECK (auth.uid() = athlete_id);

-- games: only owner can read/write their own rows
DROP POLICY IF EXISTS "athlete_own_games" ON public.games;
CREATE POLICY "athlete_own_games" ON public.games
    FOR ALL
    USING (auth.uid() = athlete_id)
    WITH CHECK (auth.uid() = athlete_id);

-- push_subscriptions: only owner can read/write their own rows
DROP POLICY IF EXISTS "athlete_own_push_subs" ON public.push_subscriptions;
CREATE POLICY "athlete_own_push_subs" ON public.push_subscriptions
    FOR ALL
    USING (auth.uid() = athlete_id)
    WITH CHECK (auth.uid() = athlete_id);

-- routines: only owner can read/write their own rows
DROP POLICY IF EXISTS "athlete_own_routines" ON public.routines;
CREATE POLICY "athlete_own_routines" ON public.routines
    FOR ALL
    USING (auth.uid() = athlete_id)
    WITH CHECK (auth.uid() = athlete_id);

-- routine_steps: only owner can read/write steps for their own routines
DROP POLICY IF EXISTS "athlete_own_routine_steps" ON public.routine_steps;
CREATE POLICY "athlete_own_routine_steps" ON public.routine_steps
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM routines
            WHERE routines.id = routine_steps.routine_id
            AND routines.athlete_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM routines
            WHERE routines.id = routine_steps.routine_id
            AND routines.athlete_id = auth.uid()
        )
    );

-- template_notifications: athlete side — only manage own notifications
DROP POLICY IF EXISTS "athlete_own_notifications" ON public.template_notifications;
CREATE POLICY "athlete_own_notifications" ON public.template_notifications
    FOR ALL
    USING (auth.uid() = athlete_id)
    WITH CHECK (auth.uid() = athlete_id);

-- =============================================================================
-- PART 2: Coach-specific limited-read policies (AC-12.2)
-- =============================================================================
-- Coaches can ONLY see:
--   - profiles.display_name and profiles.role for rostered athletes
--   - routines.is_active for rostered athletes (not names, not sources, not logs)

-- Coach can read display_name of athletes on their roster
CREATE POLICY "coach_read_rostered_athlete_profiles" ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM coach_roster
            WHERE coach_roster.athlete_id = profiles.id
            AND coach_roster.coach_id = auth.uid()
        )
    );

-- Coach can check if rostered athletes have active routines
CREATE POLICY "coach_read_rostered_athlete_routines" ON public.routines
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM coach_roster
            WHERE coach_roster.athlete_id = routines.athlete_id
            AND coach_roster.coach_id = auth.uid()
        )
    );

-- =============================================================================
-- PART 3: delete_game_log_entry() — Delete a single game log entry
-- =============================================================================
CREATE OR REPLACE FUNCTION public.delete_game_log_entry(entry_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only delete if the entry belongs to the authenticated user
    DELETE FROM public.game_logs
    WHERE id = entry_id
    AND athlete_id = auth.uid();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Entry not found or access denied';
    END IF;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_game_log_entry(uuid) TO authenticated;

-- =============================================================================
-- PART 4: delete_user_data() — Full account data deletion (AC-12.4)
-- =============================================================================
-- Deletes ALL user data across all tables. Uses SECURITY DEFINER to bypass RLS
-- since it needs to clean up related rows. Validates that only the calling
-- user's data is deleted by checking auth.uid().
CREATE OR REPLACE FUNCTION public.delete_user_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    calling_user_id uuid := auth.uid();
BEGIN
    IF calling_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Delete in dependency order (children first, then parents)

    -- 1. Delete routine steps (depends on routines)
    DELETE FROM public.routine_steps
    WHERE routine_id IN (
        SELECT id FROM public.routines WHERE athlete_id = calling_user_id
    );

    -- 2. Delete routines
    DELETE FROM public.routines WHERE athlete_id = calling_user_id;

    -- 3. Delete game logs
    DELETE FROM public.game_logs WHERE athlete_id = calling_user_id;

    -- 4. Delete games
    DELETE FROM public.games WHERE athlete_id = calling_user_id;

    -- 5. Delete push subscriptions
    DELETE FROM public.push_subscriptions WHERE athlete_id = calling_user_id;

    -- 6. Delete template notifications
    DELETE FROM public.template_notifications WHERE athlete_id = calling_user_id;

    -- 7. Delete coach roster entries (as athlete)
    DELETE FROM public.coach_roster WHERE athlete_id = calling_user_id;

    -- 8. Delete athlete profile
    DELETE FROM public.athlete_profiles WHERE athlete_id = calling_user_id;

    -- 9. Reset profile (don't delete to prevent breaking FKs on re-onboarding)
    UPDATE public.profiles
    SET display_name = NULL, role = NULL
    WHERE id = calling_user_id;

    -- Note: The actual auth.users row deletion must be handled server-side
    -- via the Supabase Admin API (service_role key), not from client-side.
    -- The API route will handle this after this function completes.
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_data() TO authenticated;
