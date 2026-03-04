import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const preGameLogSchema = z.object({
    log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    routine_completed: z.enum(["yes", "partial", "no"]),
    pre_anxiety_level: z.number().int().min(1).max(5),
    pre_confidence_level: z.number().int().min(1).max(5),
    pre_notes: z.string().max(200).optional().nullable(),
});

export async function POST(request: Request) {
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

        const body = await request.json();

        // Validate request body
        const parsed = preGameLogSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { data: null, error: { message: "Invalid payload", code: "VALIDATION_ERROR", details: parsed.error.issues } },
                { status: 400 }
            );
        }

        const { log_date, routine_completed, pre_anxiety_level, pre_confidence_level, pre_notes } = parsed.data;

        // Fetch athlete's sport from athlete_profiles
        const { data: profile, error: profileError } = await supabase
            .from("athlete_profiles")
            .select("sport")
            .eq("athlete_id", user.id)
            .single();

        if (profileError || !profile || !profile.sport) {
            return NextResponse.json(
                { data: null, error: { message: "Athlete profile or sport not found", code: "NOT_FOUND" } },
                { status: 404 }
            );
        }

        // Upsert pre-game log (log_date is unique per athlete)
        const { data: log, error: logError } = await supabase
            .from("game_logs")
            .upsert({
                athlete_id: user.id,
                log_date,
                sport: profile.sport,
                routine_completed,
                pre_anxiety_level,
                pre_confidence_level,
                pre_notes: pre_notes || null,
                pre_logged_at: new Date().toISOString()
            }, { onConflict: "athlete_id, log_date" })
            .select()
            .single();

        if (logError) {
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
