import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
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

        // 1. Fetch the routine to verify ownership and get its sport
        const { data: routine, error: fetchError } = await supabase
            .from("routines")
            .select("sport")
            .eq("id", routineId)
            .eq("athlete_id", user.id)
            .single();

        if (fetchError || !routine) {
            return NextResponse.json(
                { data: null, error: { message: "Routine not found", code: "NOT_FOUND" } },
                { status: 404 }
            );
        }

        // 2. Set all routines for this athlete and sport to inactive
        const { error: deactivateError } = await supabase
            .from("routines")
            .update({ is_active: false })
            .eq("athlete_id", user.id)
            .eq("sport", routine.sport);

        if (deactivateError) {
            return NextResponse.json(
                { data: null, error: { message: "Failed to deactivate current routines", code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // 3. Set the chosen routine to active
        const { error: activateError } = await supabase
            .from("routines")
            .update({ is_active: true })
            .eq("id", routineId)
            .eq("athlete_id", user.id);

        if (activateError) {
            return NextResponse.json(
                { data: null, error: { message: "Failed to set active routine", code: "DB_ERROR" } },
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
