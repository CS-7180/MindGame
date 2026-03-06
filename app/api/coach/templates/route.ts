import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { z } from "zod";

const createTemplateSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    time_tier: z.enum(["quick", "standard", "extended"]).optional(),
    coach_note: z.string().max(300, "Note is too long").optional(),
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

        const { data: templates, error } = await supabase
            .from("coach_templates")
            .select(`
                *,
                steps:coach_template_steps(
                    *,
                    technique:techniques(*)
                )
            `)
            .eq("coach_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json(
                { data: null, error: { message: error.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: templates, error: null });
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

        // Parse and validate request body
        const body = await request.json();
        const validation = createTemplateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { data: null, error: { message: "Invalid request data", details: validation.error.format(), code: "INVALID_DATA" } },
                { status: 400 }
            );
        }

        const { name, time_tier, coach_note, steps } = validation.data;

        // Insert template
        const { data: template, error: templateError } = await supabase
            .from("coach_templates")
            .insert({
                coach_id: user.id,
                name,
                time_tier: time_tier || 'standard',
                coach_note: coach_note || null
            })
            .select()
            .single();

        if (templateError) {
            return NextResponse.json(
                { data: null, error: { message: templateError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // Insert steps linking to the new template
        const stepsToInsert = steps.map(step => ({
            template_id: template.id,
            technique_id: step.technique_id,
            step_order: step.step_order
        }));

        const { error: stepsError } = await supabase
            .from("coach_template_steps")
            .insert(stepsToInsert);

        if (stepsError) {
            // Delete the template if steps fail
            await supabase.from("coach_templates").delete().eq("id", template.id);
            return NextResponse.json(
                { data: null, error: { message: stepsError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // Fetch the fully created template to return
        const { data: completeTemplate } = await supabase
            .from("coach_templates")
            .select(`
                *,
                steps:coach_template_steps(
                    *,
                    technique:techniques(*)
                )
            `)
            .eq("id", template.id)
            .single();

        return NextResponse.json({ data: completeTemplate, error: null }, { status: 201 });

    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
