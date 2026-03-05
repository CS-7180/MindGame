import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const preGameLogSchema = z.object({
    log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    routine_completed: z.enum(["yes", "partial", "no"]),
    pre_anxiety_level: z.number().int().min(1).max(5),
    pre_confidence_level: z.number().int().min(1).max(5),
    pre_notes: z.string().max(200).optional().nullable(),
    sport: z.string().min(1)
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

        // Destructure validated data
        const { log_date, sport, routine_completed, pre_anxiety_level, pre_confidence_level, pre_notes } = parsed.data;

        console.log("Saving pre-game log:", {
            athlete_id: user.id,
            sport: sport,
            routine_completed: routine_completed,
            pre_anxiety_level: pre_anxiety_level,
            pre_confidence_level: pre_confidence_level,
            pre_notes: pre_notes || null,
            pre_logged_at: new Date().toISOString(),
        });

        // Insert pre-game log (allows multiple per day now)
        const { data: log, error: insertError } = await supabase
            .from("game_logs")
            .insert({
                athlete_id: user.id,
                log_date: log_date,
                sport: sport,
                routine_completed: routine_completed,
                pre_anxiety_level: pre_anxiety_level,
                pre_confidence_level: pre_confidence_level,
                pre_notes: pre_notes || null,
                pre_logged_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json(
                { data: null, error: { message: insertError.message, code: "DB_ERROR" } },
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
