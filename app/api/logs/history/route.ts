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

        // Fetch athlete's game logs
        const { data: logs, error: logsError } = await supabase
            .from("game_logs")
            .select(`
                id,
                log_date,
                sport,
                routine_completed,
                pre_anxiety_level,
                pre_confidence_level,
                pre_notes,
                pre_logged_at,
                post_performance,
                post_mental_state,
                post_descriptor,
                post_logged_at
            `)
            .eq("athlete_id", user.id)
            .order("log_date", { ascending: false });

        if (logsError) {
            return NextResponse.json(
                { data: null, error: { message: logsError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: logs, error: null });

    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
