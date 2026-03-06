import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { data: null, error: { message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const { sport } = await request.json();
        if (!sport || typeof sport !== "string" || sport.trim().length === 0) {
            return NextResponse.json(
                { data: null, error: { message: "Sport name is required" } },
                { status: 400 }
            );
        }

        const trimmedSport = sport.trim();

        // Get current profile
        const { data: profile, error: fetchError } = await supabase
            .from("athlete_profiles")
            .select("sports, sport")
            .eq("athlete_id", user.id)
            .single();

        if (fetchError || !profile) {
            return NextResponse.json(
                { data: null, error: { message: "Profile not found" } },
                { status: 404 }
            );
        }

        // Build sports array — deduplicate
        const currentSports: string[] = profile.sports || [];
        if (currentSports.includes(trimmedSport)) {
            return NextResponse.json({
                data: { sports: currentSports },
                error: null,
            });
        }

        const updatedSports = [...currentSports, trimmedSport];

        const { error: updateError } = await supabase
            .from("athlete_profiles")
            .update({ sports: updatedSports })
            .eq("athlete_id", user.id);

        if (updateError) {
            return NextResponse.json(
                { data: null, error: { message: updateError.message } },
                { status: 500 }
            );
        }

        return NextResponse.json({
            data: { sports: updatedSports },
            error: null,
        });
    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error" } },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { data: null, error: { message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const { sport } = await request.json();
        if (!sport || typeof sport !== "string") {
            return NextResponse.json(
                { data: null, error: { message: "Sport name is required" } },
                { status: 400 }
            );
        }

        const { data: profile } = await supabase
            .from("athlete_profiles")
            .select("sports")
            .eq("athlete_id", user.id)
            .single();

        const currentSports: string[] = profile?.sports || [];
        const updatedSports = currentSports.filter(s => s !== sport);

        const { error: updateError } = await supabase
            .from("athlete_profiles")
            .update({ sports: updatedSports })
            .eq("athlete_id", user.id);

        if (updateError) {
            return NextResponse.json(
                { data: null, error: { message: updateError.message } },
                { status: 500 }
            );
        }

        return NextResponse.json({
            data: { sports: updatedSports },
            error: null,
        });
    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error" } },
            { status: 500 }
        );
    }
}
