import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // Verify authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
                { status: 401 }
            );
        }

        // Verify user is a coach
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || !profile || profile.role !== "coach") {
            return NextResponse.json(
                { data: null, error: { message: "Forbidden: coach access only", code: "FORBIDDEN" } },
                { status: 403 }
            );
        }

        // Fetch rostered athletes with limited data only
        // RLS ensures we only see athletes on this coach's roster
        const { data: roster, error: rosterError } = await supabase
            .from("coach_roster")
            .select(`
                athlete_id,
                joined_at,
                athlete:profiles!coach_roster_athlete_id_fkey(
                    display_name,
                    role
                )
            `)
            .eq("coach_id", user.id);

        if (rosterError) {
            return NextResponse.json(
                { data: null, error: { message: rosterError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // For each athlete, check if they have at least one active routine
        // RLS coach_read_rostered_athlete_routines policy allows this read
        const athleteIds = (roster || []).map(r => r.athlete_id);

        const activeRoutineMap: Record<string, boolean> = {};

        if (athleteIds.length > 0) {
            const { data: routines, error: routinesError } = await supabase
                .from("routines")
                .select("athlete_id, is_active")
                .in("athlete_id", athleteIds)
                .eq("is_active", true);

            if (!routinesError && routines) {
                for (const r of routines) {
                    activeRoutineMap[r.athlete_id] = true;
                }
            }
        }

        // Build response — ONLY display_name + has_active_routine (AC-12.2)
        const rosterResponse = (roster || []).map(entry => {
            // Supabase join can return object or array depending on relationship type
            let athleteData: { display_name: string | null } | null = null;

            if (Array.isArray(entry.athlete)) {
                athleteData = entry.athlete[0];
            } else {
                athleteData = entry.athlete as any;
            }

            return {
                athlete_id: entry.athlete_id,
                display_name: athleteData?.display_name || "Unknown",
                has_active_routine: !!activeRoutineMap[entry.athlete_id],
                joined_at: entry.joined_at,
            };
        });

        return NextResponse.json({ data: rosterResponse, error: null });

    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
