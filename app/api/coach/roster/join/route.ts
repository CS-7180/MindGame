import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const joinSchema = z.object({
    team_code: z.string().min(6).max(6).toUpperCase(),
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // 1. Verify authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
                { status: 401 }
            );
        }

        // 2. Validate input
        const body = await req.json();
        const result = joinSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { data: null, error: { message: "Invalid team code format", code: "BAD_REQUEST" } },
                { status: 400 }
            );
        }
        const { team_code } = result.data;

        // 3. Find coach by team_code
        const { data: coachProfile, error: coachError } = await supabase
            .from("profiles")
            .select("id, display_name")
            .eq("team_code", team_code)
            .eq("role", "coach")
            .single();

        if (coachError || !coachProfile) {
            return NextResponse.json(
                { data: null, error: { message: "Team not found. Please check the code.", code: "NOT_FOUND" } },
                { status: 404 }
            );
        }

        // 4. Check if already on roster
        const { data: existing } = await supabase
            .from("coach_roster")
            .select("id")
            .eq("coach_id", coachProfile.id)
            .eq("athlete_id", user.id)
            .maybeSingle();

        if (existing) {
            return NextResponse.json(
                { data: null, error: { message: "You are already a member of this team.", code: "ALREADY_EXISTS" } },
                { status: 400 }
            );
        }

        // 5. Join the team
        const { error: joinError } = await supabase
            .from("coach_roster")
            .insert({
                coach_id: coachProfile.id,
                athlete_id: user.id,
            });

        if (joinError) {
            return NextResponse.json(
                { data: null, error: { message: joinError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({
            data: {
                message: `Successfully joined ${coachProfile.display_name}'s team!`,
                coach_name: coachProfile.display_name,
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
