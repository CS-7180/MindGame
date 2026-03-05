import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const resolvedParams = await params;
        const logId = resolvedParams.id;

        if (!logId) {
            return NextResponse.json(
                { data: null, error: { message: "Log ID is required", code: "BAD_REQUEST" } },
                { status: 400 }
            );
        }

        // Fetch single game log
        const { data: log, error: logError } = await supabase
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
            .eq("id", logId)
            .eq("athlete_id", user.id) // Ensure they own it
            .single();

        if (logError) {
            if (logError.code === 'PGRST116') {
                return NextResponse.json(
                    { data: null, error: { message: "Log not found", code: "NOT_FOUND" } },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { data: null, error: { message: logError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: log, error: null });

    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
