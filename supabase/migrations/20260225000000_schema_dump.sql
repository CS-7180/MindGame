


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."delete_game_log_entry"("entry_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    DELETE FROM public.game_logs
    WHERE id = entry_id
    AND athlete_id = auth.uid();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Entry not found or access denied';
    END IF;
END;
$$;


ALTER FUNCTION "public"."delete_game_log_entry"("entry_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_data"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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
END;
$$;


ALTER FUNCTION "public"."delete_user_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_team_code"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."generate_team_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_team_code_generation"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Only generate if user is a coach and doesn't have a code yet
    IF NEW.role = 'coach' AND (NEW.team_code IS NULL OR NEW.team_code = '') THEN
        NEW.team_code := generate_team_code();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_team_code_generation"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."athlete_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "athlete_id" "uuid" NOT NULL,
    "sport" "text",
    "competitive_level" "text",
    "anxiety_symptoms" "text"[],
    "time_preference" "text",
    "onboarding_complete" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "sports" "text"[] DEFAULT '{}'::"text"[],
    CONSTRAINT "athlete_profiles_competitive_level_check" CHECK (("competitive_level" = ANY (ARRAY['recreational'::"text", 'college'::"text", 'semi_pro'::"text"]))),
    CONSTRAINT "athlete_profiles_time_preference_check" CHECK (("time_preference" = ANY (ARRAY['2min'::"text", '5min'::"text", '10min'::"text"])))
);


ALTER TABLE "public"."athlete_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coach_roster" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "coach_id" "uuid" NOT NULL,
    "athlete_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."coach_roster" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coach_template_steps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "template_id" "uuid" NOT NULL,
    "technique_id" "uuid" NOT NULL,
    "step_order" integer NOT NULL
);


ALTER TABLE "public"."coach_template_steps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coach_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "coach_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "time_tier" "text",
    "coach_note" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "coach_templates_time_tier_check" CHECK (("time_tier" = ANY (ARRAY['quick'::"text", 'standard'::"text", 'extended'::"text"])))
);


ALTER TABLE "public"."coach_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "athlete_id" "uuid" NOT NULL,
    "game_id" "uuid",
    "log_date" "date" NOT NULL,
    "sport" "text" NOT NULL,
    "routine_completed" "text",
    "pre_anxiety_level" integer,
    "pre_confidence_level" integer,
    "pre_notes" "text",
    "pre_logged_at" timestamp with time zone,
    "post_performance" integer,
    "post_mental_state" integer,
    "post_descriptor" "text",
    "post_logged_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "game_logs_post_mental_state_check" CHECK ((("post_mental_state" >= 1) AND ("post_mental_state" <= 5))),
    CONSTRAINT "game_logs_post_performance_check" CHECK ((("post_performance" >= 1) AND ("post_performance" <= 5))),
    CONSTRAINT "game_logs_pre_anxiety_level_check" CHECK ((("pre_anxiety_level" >= 1) AND ("pre_anxiety_level" <= 5))),
    CONSTRAINT "game_logs_pre_confidence_level_check" CHECK ((("pre_confidence_level" >= 1) AND ("pre_confidence_level" <= 5))),
    CONSTRAINT "game_logs_pre_notes_check" CHECK (("char_length"("pre_notes") <= 200)),
    CONSTRAINT "game_logs_routine_completed_check" CHECK (("routine_completed" = ANY (ARRAY['yes'::"text", 'partial'::"text", 'no'::"text"])))
);


ALTER TABLE "public"."game_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."games" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "athlete_id" "uuid" NOT NULL,
    "sport" "text" NOT NULL,
    "game_date" "date" NOT NULL,
    "game_time" time without time zone NOT NULL,
    "reminder_offset_mins" integer DEFAULT 45 NOT NULL,
    "reminder_time" timestamp without time zone GENERATED ALWAYS AS ((("game_date" + "game_time") - (("reminder_offset_mins")::double precision * '00:01:00'::interval))) STORED,
    "reminder_sent" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."games" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "text",
    "display_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "team_code" "text",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['athlete'::"text", 'coach'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "endpoint" "text" NOT NULL,
    "p256dh" "text" NOT NULL,
    "auth" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."push_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."routine_steps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "routine_id" "uuid" NOT NULL,
    "technique_id" "uuid" NOT NULL,
    "step_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."routine_steps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."routines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "athlete_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "source" "text" DEFAULT 'custom'::"text",
    "coach_template_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_template" boolean DEFAULT false NOT NULL,
    "sport" "text" NOT NULL,
    CONSTRAINT "routines_source_check" CHECK (("source" = ANY (ARRAY['custom'::"text", 'recommended'::"text", 'coach_template'::"text"])))
);


ALTER TABLE "public"."routines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."techniques" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "instruction" "text" NOT NULL,
    "duration_minutes" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "techniques_category_check" CHECK (("category" = ANY (ARRAY['breathing'::"text", 'visualization'::"text", 'affirmations'::"text", 'focus'::"text", 'grounding'::"text"])))
);


ALTER TABLE "public"."techniques" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."template_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "athlete_id" "uuid" NOT NULL,
    "coach_id" "uuid" NOT NULL,
    "template_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "template_notifications_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'saved'::"text", 'dismissed'::"text"])))
);


ALTER TABLE "public"."template_notifications" OWNER TO "postgres";


ALTER TABLE ONLY "public"."athlete_profiles"
    ADD CONSTRAINT "athlete_profiles_athlete_id_key" UNIQUE ("athlete_id");



ALTER TABLE ONLY "public"."athlete_profiles"
    ADD CONSTRAINT "athlete_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coach_roster"
    ADD CONSTRAINT "coach_roster_coach_id_athlete_id_key" UNIQUE ("coach_id", "athlete_id");



ALTER TABLE ONLY "public"."coach_roster"
    ADD CONSTRAINT "coach_roster_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coach_template_steps"
    ADD CONSTRAINT "coach_template_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coach_templates"
    ADD CONSTRAINT "coach_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."game_logs"
    ADD CONSTRAINT "game_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_team_code_key" UNIQUE ("team_code");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_endpoint_key" UNIQUE ("endpoint");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routine_steps"
    ADD CONSTRAINT "routine_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routines"
    ADD CONSTRAINT "routines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."techniques"
    ADD CONSTRAINT "techniques_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."techniques"
    ADD CONSTRAINT "techniques_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."template_notifications"
    ADD CONSTRAINT "template_notifications_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_game_logs_athlete_date" ON "public"."game_logs" USING "btree" ("athlete_id", "log_date" DESC);



CREATE INDEX "idx_games_athlete" ON "public"."games" USING "btree" ("athlete_id");



CREATE INDEX "idx_games_reminder" ON "public"."games" USING "btree" ("reminder_time") WHERE ("reminder_sent" = false);



CREATE INDEX "idx_push_subscriptions_user" ON "public"."push_subscriptions" USING "btree" ("user_id");



CREATE INDEX "idx_routines_athlete" ON "public"."routines" USING "btree" ("athlete_id");



CREATE UNIQUE INDEX "idx_routines_athlete_sport_active" ON "public"."routines" USING "btree" ("athlete_id", "sport") WHERE ("is_active" = true);



CREATE INDEX "idx_template_notifications_athlete" ON "public"."template_notifications" USING "btree" ("athlete_id", "status");



CREATE OR REPLACE TRIGGER "on_coach_profile_upsert" BEFORE INSERT OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_team_code_generation"();



ALTER TABLE ONLY "public"."athlete_profiles"
    ADD CONSTRAINT "athlete_profiles_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."coach_roster"
    ADD CONSTRAINT "coach_roster_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."coach_roster"
    ADD CONSTRAINT "coach_roster_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."coach_template_steps"
    ADD CONSTRAINT "coach_template_steps_technique_id_fkey" FOREIGN KEY ("technique_id") REFERENCES "public"."techniques"("id");



ALTER TABLE ONLY "public"."coach_template_steps"
    ADD CONSTRAINT "coach_template_steps_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."coach_templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."coach_templates"
    ADD CONSTRAINT "coach_templates_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_logs"
    ADD CONSTRAINT "game_logs_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routine_steps"
    ADD CONSTRAINT "routine_steps_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routine_steps"
    ADD CONSTRAINT "routine_steps_technique_id_fkey" FOREIGN KEY ("technique_id") REFERENCES "public"."techniques"("id");



ALTER TABLE ONLY "public"."routines"
    ADD CONSTRAINT "routines_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routines"
    ADD CONSTRAINT "routines_coach_template_id_fkey" FOREIGN KEY ("coach_template_id") REFERENCES "public"."coach_templates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."template_notifications"
    ADD CONSTRAINT "template_notifications_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."template_notifications"
    ADD CONSTRAINT "template_notifications_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."template_notifications"
    ADD CONSTRAINT "template_notifications_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."coach_templates"("id") ON DELETE CASCADE;



CREATE POLICY "Allow public lookup by team_code" ON "public"."profiles" FOR SELECT USING (("team_code" IS NOT NULL));



CREATE POLICY "Athletes can join a team" ON "public"."coach_roster" FOR INSERT WITH CHECK (("auth"."uid"() = "athlete_id"));



CREATE POLICY "Athletes can manage their own games" ON "public"."games" TO "authenticated" USING (("athlete_id" = "auth"."uid"())) WITH CHECK (("athlete_id" = "auth"."uid"()));



CREATE POLICY "Coaches can view their own team_code" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Template steps are viewable by everyone" ON "public"."routine_steps" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."routines"
  WHERE (("routines"."id" = "routine_steps"."routine_id") AND ("routines"."is_template" = true)))));



CREATE POLICY "Templates are viewable by everyone" ON "public"."routines" FOR SELECT USING (("is_template" = true));



CREATE POLICY "Users can manage their own push subscriptions" ON "public"."push_subscriptions" TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "athlete_own_logs" ON "public"."game_logs" USING (("auth"."uid"() = "athlete_id")) WITH CHECK (("auth"."uid"() = "athlete_id"));



CREATE POLICY "athlete_own_notifications" ON "public"."template_notifications" USING (("auth"."uid"() = "athlete_id")) WITH CHECK (("auth"."uid"() = "athlete_id"));



CREATE POLICY "athlete_own_profile" ON "public"."athlete_profiles" USING (("auth"."uid"() = "athlete_id")) WITH CHECK (("auth"."uid"() = "athlete_id"));



CREATE POLICY "athlete_own_routine_steps" ON "public"."routine_steps" USING ((EXISTS ( SELECT 1
   FROM "public"."routines"
  WHERE (("routines"."id" = "routine_steps"."routine_id") AND ("routines"."athlete_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."routines"
  WHERE (("routines"."id" = "routine_steps"."routine_id") AND ("routines"."athlete_id" = "auth"."uid"())))));



CREATE POLICY "athlete_own_routines" ON "public"."routines" USING (("auth"."uid"() = "athlete_id")) WITH CHECK (("auth"."uid"() = "athlete_id"));



ALTER TABLE "public"."athlete_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "athlete_read_shared_template_steps" ON "public"."coach_template_steps" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."template_notifications" "tn"
     JOIN "public"."coach_templates" "ct" ON (("ct"."id" = "tn"."template_id")))
  WHERE (("coach_template_steps"."template_id" = "ct"."id") AND ("tn"."athlete_id" = "auth"."uid"())))));



CREATE POLICY "athlete_read_shared_templates" ON "public"."coach_templates" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."template_notifications"
  WHERE (("template_notifications"."template_id" = "coach_templates"."id") AND ("template_notifications"."athlete_id" = "auth"."uid"())))));



CREATE POLICY "coach_own_template_steps" ON "public"."coach_template_steps" USING ((EXISTS ( SELECT 1
   FROM "public"."coach_templates"
  WHERE (("coach_templates"."id" = "coach_template_steps"."template_id") AND ("coach_templates"."coach_id" = "auth"."uid"())))));



CREATE POLICY "coach_own_templates" ON "public"."coach_templates" USING (("auth"."uid"() = "coach_id"));



CREATE POLICY "coach_read_rostered_athlete_profiles" ON "public"."profiles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."coach_roster"
  WHERE (("coach_roster"."athlete_id" = "profiles"."id") AND ("coach_roster"."coach_id" = "auth"."uid"())))));



CREATE POLICY "coach_read_rostered_athlete_routines" ON "public"."routines" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."coach_roster"
  WHERE (("coach_roster"."athlete_id" = "routines"."athlete_id") AND ("coach_roster"."coach_id" = "auth"."uid"())))));



ALTER TABLE "public"."coach_roster" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "coach_roster_athlete_read" ON "public"."coach_roster" FOR SELECT USING (("auth"."uid"() = "athlete_id"));



CREATE POLICY "coach_roster_coach" ON "public"."coach_roster" USING (("auth"."uid"() = "coach_id"));



CREATE POLICY "coach_send_notifications" ON "public"."template_notifications" FOR INSERT WITH CHECK (("auth"."uid"() = "coach_id"));



ALTER TABLE "public"."coach_template_steps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."coach_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."routine_steps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."routines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."techniques" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "techniques_read" ON "public"."techniques" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."template_notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_own_profile_insert" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "users_own_profile_select" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "users_own_profile_update" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."delete_game_log_entry"("entry_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_game_log_entry"("entry_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_game_log_entry"("entry_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_team_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_team_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_team_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_team_code_generation"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_team_code_generation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_team_code_generation"() TO "service_role";


















GRANT ALL ON TABLE "public"."athlete_profiles" TO "anon";
GRANT ALL ON TABLE "public"."athlete_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."athlete_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."coach_roster" TO "anon";
GRANT ALL ON TABLE "public"."coach_roster" TO "authenticated";
GRANT ALL ON TABLE "public"."coach_roster" TO "service_role";



GRANT ALL ON TABLE "public"."coach_template_steps" TO "anon";
GRANT ALL ON TABLE "public"."coach_template_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."coach_template_steps" TO "service_role";



GRANT ALL ON TABLE "public"."coach_templates" TO "anon";
GRANT ALL ON TABLE "public"."coach_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."coach_templates" TO "service_role";



GRANT ALL ON TABLE "public"."game_logs" TO "anon";
GRANT ALL ON TABLE "public"."game_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."game_logs" TO "service_role";



GRANT ALL ON TABLE "public"."games" TO "anon";
GRANT ALL ON TABLE "public"."games" TO "authenticated";
GRANT ALL ON TABLE "public"."games" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."push_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."routine_steps" TO "anon";
GRANT ALL ON TABLE "public"."routine_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."routine_steps" TO "service_role";



GRANT ALL ON TABLE "public"."routines" TO "anon";
GRANT ALL ON TABLE "public"."routines" TO "authenticated";
GRANT ALL ON TABLE "public"."routines" TO "service_role";



GRANT ALL ON TABLE "public"."techniques" TO "anon";
GRANT ALL ON TABLE "public"."techniques" TO "authenticated";
GRANT ALL ON TABLE "public"."techniques" TO "service_role";



GRANT ALL ON TABLE "public"."template_notifications" TO "anon";
GRANT ALL ON TABLE "public"."template_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."template_notifications" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


