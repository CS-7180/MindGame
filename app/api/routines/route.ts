import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createRoutineSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    sport: z.string().min(1, "Sport is required"),
    steps: z.array(z.object({
        technique_id: z.string().uuid(),
        step_order: z.number().int().min(0)
    })).min(1, "At least one step is required")
});

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
                steps:routine_steps(
                    *,
                    technique:techniques(*)
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

        // 1. Parse and validate request body first to get the sport
        const body = await request.json();
        const validation = createRoutineSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { data: null, error: { message: "Invalid request data", details: validation.error.format(), code: "INVALID_DATA" } },
                { status: 400 }
            );
        }

        const { name, sport, steps } = validation.data;

        // 2. Check strict 5 routine limit PER SPORT
        const { count, error: countError } = await supabase
            .from("routines")
            .select("*", { count: "exact", head: true })
            .eq("athlete_id", user.id)
            .eq("sport", sport);

        if (countError) {
            return NextResponse.json(
                { data: null, error: { message: countError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        if (count !== null && count >= 5) {
            return NextResponse.json(
                { data: null, error: { message: `Maximum of 5 routines reached for ${sport}. Please delete an existing routine.`, code: "LIMIT_REACHED" } },
                { status: 400 }
            );
        }

        // Deactivate any existing active routines for this athlete and sport
        const { error: deactivateError } = await supabase
            .from("routines")
            .update({ is_active: false })
            .eq("athlete_id", user.id)
            .eq("sport", sport);

        if (deactivateError) {
            return NextResponse.json(
                { data: null, error: { message: "Failed to clear previous active routines", code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // 3. Insert routine
        const { data: routine, error: routineError } = await supabase
            .from("routines")
            .insert({
                athlete_id: user.id,
                name: name,
                sport: sport,
                is_template: false,
                is_active: true,
                source: "custom",
            })
            .select()
            .single();

        if (routineError) {
            return NextResponse.json(
                { data: null, error: { message: routineError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // 4. Insert steps linking to the new routine
        const stepsToInsert = steps.map(step => ({
            routine_id: routine.id,
            technique_id: step.technique_id,
            step_order: step.step_order
        }));

        const { error: stepsError } = await supabase
            .from("routine_steps")
            .insert(stepsToInsert);

        if (stepsError) {
            // Note: In a real system we might want a proper RPC transaction here
            // or we manually cleanup the routine if steps fail.
            await supabase.from("routines").delete().eq("id", routine.id);
            return NextResponse.json(
                { data: null, error: { message: stepsError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // Fetch the fully created routine to return
        const { data: completeRoutine } = await supabase
            .from("routines")
            .select(`
                *,
                steps:routine_steps(
                    *,
                    technique:techniques(*)
                )
            `)
            .eq("id", routine.id)
            .single();

        return NextResponse.json({ data: completeRoutine, error: null }, { status: 201 });

    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
