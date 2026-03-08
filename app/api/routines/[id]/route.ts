import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateRoutineSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    sport: z.string().min(1, "Sport is required"),
    steps: z.array(z.object({
        technique_id: z.string().uuid(),
        step_order: z.number().int().min(0)
    })).min(1, "At least one step is required")
});

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const routineId = resolvedParams.id;

        if (!routineId) {
            return NextResponse.json(
                { data: null, error: { message: "Routine ID required", code: "BAD_REQUEST" } },
                { status: 400 }
            );
        }

        // Attempt to delete. RLS policy 'athlete_own_routines' will ensure they can only delete their own.
        const { error } = await supabase
            .from("routines")
            .delete()
            .eq("id", routineId)
            .eq("athlete_id", user.id); // Extra safety check

        if (error) {
            return NextResponse.json(
                { data: null, error: { message: error.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: { success: true }, error: null });
    } catch (err: unknown) {
        return NextResponse.json(
            { data: null, error: { message: err instanceof Error ? err.message : "Unknown error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const routineId = resolvedParams.id;

        if (!routineId) {
            return NextResponse.json(
                { data: null, error: { message: "Routine ID required", code: "BAD_REQUEST" } },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validation = updateRoutineSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { data: null, error: { message: "Invalid request data", details: validation.error.format(), code: "INVALID_DATA" } },
                { status: 400 }
            );
        }

        const { name, sport, steps } = validation.data;

        // Verify ownership and routine exists
        const { data: existingRoutine, error: fetchError } = await supabase
            .from("routines")
            .select("id")
            .eq("id", routineId)
            .eq("athlete_id", user.id)
            .single();

        if (fetchError || !existingRoutine) {
            return NextResponse.json(
                { data: null, error: { message: "Routine not found or access denied", code: "NOT_FOUND" } },
                { status: 404 }
            );
        }

        // Update basic routine info
        const { error: updateError } = await supabase
            .from("routines")
            .update({
                name,
                sport,
                updated_at: new Date().toISOString()
            })
            .eq("id", routineId);

        if (updateError) {
            return NextResponse.json(
                { data: null, error: { message: updateError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // Delete existing steps
        const { error: deleteStepsError } = await supabase
            .from("routine_steps")
            .delete()
            .eq("routine_id", routineId);

        if (deleteStepsError) {
            return NextResponse.json(
                { data: null, error: { message: deleteStepsError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // Insert new steps
        const stepsToInsert = steps.map(step => ({
            routine_id: routineId,
            technique_id: step.technique_id,
            step_order: step.step_order
        }));

        const { error: insertStepsError } = await supabase
            .from("routine_steps")
            .insert(stepsToInsert);

        if (insertStepsError) {
            return NextResponse.json(
                { data: null, error: { message: insertStepsError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // Fetch back complete updated routine
        const { data: completeRoutine, error: reloadError } = await supabase
            .from("routines")
            .select(`
                *,
                steps:routine_steps(
                    *,
                    technique:techniques(*)
                )
            `)
            .eq("id", routineId)
            .single();

        if (reloadError) {
            return NextResponse.json(
                { data: null, error: { message: reloadError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: completeRoutine, error: null }, { status: 200 });
    } catch (err: unknown) {
        return NextResponse.json(
            { data: null, error: { message: err instanceof Error ? err.message : "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
