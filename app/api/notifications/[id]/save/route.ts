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

        // 1. Fetch notification and verify ownership — accept both "pending" and "saving"
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
            .in("status", ["pending", "saving"])
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

        // 2. Mark notification as "saving" so athlete can re-click without error
        await supabase
            .from("template_notifications")
            .update({ status: "saving" })
            .eq("id", notificationId);

        // Return template data so the builder can open without creating a routine yet.
        // The routine will be created by the standard builder save flow.
        return NextResponse.json({
            data: {
                template: notification.template,
                notification_id: notificationId,
                default_sport: targetSport,
            },
            error: null
        });
    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
