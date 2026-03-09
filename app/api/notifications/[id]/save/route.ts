import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

        const { id: notificationId } = params;

        // 1. Fetch notification and verify ownership
        const { data: notification, error: notifError } = await supabase
            .from("template_notifications")
            .select(`
                *,
                template:coach_templates(
                    *,
                    steps:coach_template_steps(*)
                )
            `)
            .eq("id", notificationId)
            .eq("athlete_id", user.id)
            .eq("status", "pending")
            .single();

        if (notifError || !notification) {
            return NextResponse.json(
                { data: null, error: { message: "Notification not found or unauthorized", code: "NOT_FOUND" } },
                { status: 404 }
            );
        }

        const body = await request.json().catch(() => ({}));
        let targetSport = body.sport;

        // 3. Fetch athlete's sports profile if needed
        const { data: athleteProfile, error: profileError } = await supabase
            .from("athlete_profiles")
            .select("sport, sports")
            .eq("athlete_id", user.id)
            .single();

        if (profileError && !athleteProfile) {
            return NextResponse.json(
                { data: null, error: { message: "Athlete profile not found. Please complete onboarding.", code: "NOT_FOUND" } },
                { status: 404 }
            );
        }

        if (!targetSport) {
            targetSport = (athleteProfile?.sports && athleteProfile.sports.length > 0)
                ? athleteProfile.sports[0]
                : athleteProfile?.sport;
        }

        if (!targetSport) {
            return NextResponse.json(
                { data: null, error: { message: "Athlete sport not found. Please complete onboarding or specify a sport.", code: "NOT_FOUND" } },
                { status: 404 }
            );
        }

        // 2. Check routine limit (max 5 PER SPORT)
        const { count, error: countError } = await supabase
            .from("routines")
            .select("*", { count: "exact", head: true })
            .eq("athlete_id", user.id)
            .eq("sport", targetSport);

        if (countError) {
            return NextResponse.json(
                { data: null, error: { message: countError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        if (count !== null && count >= 5) {
            return NextResponse.json(
                { data: null, error: { message: `Maximum of 5 routines reached for ${targetSport}. Please delete one before saving this template.`, code: "LIMIT_REACHED" } },
                { status: 400 }
            );
        }

        // 4. Create personal routine from template
        const { data: routine, error: routineError } = await supabase
            .from("routines")
            .insert({
                athlete_id: user.id,
                name: notification.template.name,
                sport: targetSport,
                source: "coach_template",
                coach_template_id: notification.template_id,
                is_active: false // Do not activate by default
            })
            .select()
            .single();

        if (routineError) {
            return NextResponse.json(
                { data: null, error: { message: routineError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // 4. Copy steps
        const stepsToInsert = notification.template.steps.map((step: { technique_id: string; step_order: number }) => ({
            routine_id: routine.id,
            technique_id: step.technique_id,
            step_order: step.step_order
        }));

        const { error: stepsError } = await supabase
            .from("routine_steps")
            .insert(stepsToInsert);

        if (stepsError) {
            // Cleanup
            await supabase.from("routines").delete().eq("id", routine.id);
            return NextResponse.json(
                { data: null, error: { message: stepsError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // 5. Update notification status
        await supabase
            .from("template_notifications")
            .update({ status: "saved" })
            .eq("id", notificationId);

        return NextResponse.json({ data: { routine_id: routine.id }, error: null });
    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
