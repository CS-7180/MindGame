import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";

export async function POST(
    request: Request,
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

        const { id: templateId } = params;

        // 1. Verify template ownership
        const { data: template, error: templateError } = await supabase
            .from("coach_templates")
            .select("id")
            .eq("id", templateId)
            .eq("coach_id", user.id)
            .single();

        if (templateError || !template) {
            return NextResponse.json(
                { data: null, error: { message: "Template not found or unauthorized", code: "NOT_FOUND" } },
                { status: 404 }
            );
        }

        // 2. Fetch the roster
        const { data: roster, error: rosterError } = await supabase
            .from("coach_roster")
            .select("athlete_id")
            .eq("coach_id", user.id);

        if (rosterError) {
            return NextResponse.json(
                { data: null, error: { message: rosterError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        if (!roster || roster.length === 0) {
            return NextResponse.json(
                { data: null, error: { message: "Roster is empty", code: "EMPTY_ROSTER" } },
                { status: 400 }
            );
        }

        // 3. Create notifications for each athlete
        const notificationsToInsert = roster.map((athlete) => ({
            athlete_id: athlete.athlete_id,
            coach_id: user.id,
            template_id: templateId,
            status: 'pending'
        }));

        const { error: insertError } = await supabase
            .from("template_notifications")
            .insert(notificationsToInsert);

        if (insertError) {
            return NextResponse.json(
                { data: null, error: { message: insertError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: { success: true, count: roster.length }, error: null });
    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
