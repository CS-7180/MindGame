-- Create games table for scheduling reminders IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sport TEXT NOT NULL,
    game_date DATE NOT NULL,
    game_time TIME NOT NULL,
    reminder_offset_mins INTEGER NOT NULL DEFAULT 45,
    -- reminder_time is computed: (game_date + game_time) - reminder_offset_mins
    reminder_time TIMESTAMP GENERATED ALWAYS AS (
        (game_date + game_time) - (reminder_offset_mins * INTERVAL '1 minute')
    ) STORED,
    reminder_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for the reminder cron
CREATE INDEX IF NOT EXISTS idx_games_reminder ON public.games(reminder_time) WHERE reminder_sent = false;
CREATE INDEX IF NOT EXISTS idx_games_athlete ON public.games(athlete_id);

-- Create push_subscriptions table for Web Push IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Games RLS Policies
DROP POLICY IF EXISTS "Athletes can manage their own games" ON public.games;
CREATE POLICY "Athletes can manage their own games"
    ON public.games
    FOR ALL
    TO authenticated
    USING (athlete_id = auth.uid())
    WITH CHECK (athlete_id = auth.uid());

-- Push Subscriptions RLS Policies
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage their own push subscriptions"
    ON public.push_subscriptions
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
