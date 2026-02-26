import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
                { status: 401 }
            );
        }

        const { data: routines, error } = await supabase
            .from("routines")
            .select(`
        *,
        routine_steps (
          *,
          techniques (*)
        )
      `)
            .eq("athlete_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json(
                { data: null, error: { message: error.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: routines, error: null });
    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, source = "custom", steps } = body;

        if (!name || !steps?.length) {
            return NextResponse.json(
                { data: null, error: { message: "Name and at least one step required", code: "VALIDATION_ERROR" } },
                { status: 400 }
            );
        }

        // Check routine limit (max 5)
        const { count } = await supabase
            .from("routines")
            .select("*", { count: "exact", head: true })
            .eq("athlete_id", user.id);

        if (count !== null && count >= 5) {
            return NextResponse.json(
                { data: null, error: { message: "Maximum 5 routines allowed", code: "LIMIT_EXCEEDED" } },
                { status: 400 }
            );
        }

        // Create routine
        const { data: routine, error: routineError } = await supabase
            .from("routines")
            .insert({
                athlete_id: user.id,
                name,
                source,
            })
            .select()
            .single();

        if (routineError || !routine) {
            return NextResponse.json(
                { data: null, error: { message: routineError?.message || "Failed to create routine", code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // Create routine steps
        const stepsToInsert = steps.map((step: { technique_id: string; step_order: number }) => ({
            routine_id: routine.id,
            technique_id: step.technique_id,
            step_order: step.step_order,
        }));

        const { error: stepsError } = await supabase
            .from("routine_steps")
            .insert(stepsToInsert);

        if (stepsError) {
            return NextResponse.json(
                { data: null, error: { message: stepsError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: routine, error: null }, { status: 201 });
    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
