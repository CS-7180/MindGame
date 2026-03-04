import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const preGameLogSchema = z.object({
    sport: z.string().min(1, "Sport is required"),
    routine_completed: z.enum(["yes", "partial", "no"]),
    pre_anxiety_level: z.number().int().min(1).max(5),
    pre_confidence_level: z.number().int().min(1).max(5),
    pre_notes: z.string().max(200, "Notes cannot exceed 200 characters").optional(),
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

        // Validate payload
        const validationResult = preGameLogSchema.safeParse(body);
        if (!validationResult.success) {
            const errorMessage = validationResult.error.issues[0]?.message || "Validation failed";
            return NextResponse.json(
                { data: null, error: { message: errorMessage, code: "VALIDATION_ERROR" } },
                { status: 400 }
            );
        }

        const validData = validationResult.data;

        // Use current local date for log_date and UTC timestamp for pre_logged_at
        const now = new Date();
        const logDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const preLoggedAt = now.toISOString();

        // Insert or update pre-game log for today
        const { error: dbError } = await supabase
            .from("game_logs")
            .upsert(
                {
                    athlete_id: user.id,
                    log_date: logDate,
                    sport: validData.sport,
                    routine_completed: validData.routine_completed,
                    pre_anxiety_level: validData.pre_anxiety_level,
                    pre_confidence_level: validData.pre_confidence_level,
                    pre_notes: validData.pre_notes || null,
                    pre_logged_at: preLoggedAt,
                },
                { onConflict: "athlete_id, log_date" }
            );

        if (dbError) {
            return NextResponse.json(
                { data: null, error: { message: dbError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({
            data: { success: true },
            error: null,
        });

    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
