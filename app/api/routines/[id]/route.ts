import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
    } catch (err: any) {
        return NextResponse.json(
            { data: null, error: { message: err.message, code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
