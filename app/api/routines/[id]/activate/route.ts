import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
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

        // 1. Verify routine belongs to user
        const routineId = params.id;
        const { data: routine, error: fetchError } = await supabase
            .from("routines")
            .select("id")
            .eq("id", routineId)
            .eq("athlete_id", user.id)
            .single();

        if (fetchError || !routine) {
            return NextResponse.json(
                { data: null, error: { message: "Routine not found", code: "NOT_FOUND" } },
                { status: 404 }
            );
        }

        // 2. Set all other routines for the user to false
        const { error: deactivateError } = await supabase
            .from("routines")
            .update({ is_active: false })
            .eq("athlete_id", user.id);

        if (deactivateError) {
            return NextResponse.json(
                { data: null, error: { message: deactivateError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // 3. Set target routine to true
        const { error: activateError } = await supabase
            .from("routines")
            .update({ is_active: true })
            .eq("id", routineId)
            .eq("athlete_id", user.id);

        if (activateError) {
            return NextResponse.json(
                { data: null, error: { message: activateError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: { message: "Routine activated" }, error: null }, { status: 200 });
    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
