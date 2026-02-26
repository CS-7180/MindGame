import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recommend } from "@/lib/recommender";
import type { AnxietySymptom, TimePreference, Technique } from "@/lib/recommender";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Verify authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { sport, competitive_level, anxiety_symptoms, time_preference } = body;

        // Validate required fields
        if (!sport || !competitive_level || !anxiety_symptoms?.length || !time_preference) {
            return NextResponse.json(
                { data: null, error: { message: "All fields are required", code: "VALIDATION_ERROR" } },
                { status: 400 }
            );
        }

        // Upsert athlete profile (insert or update if exists)
        const { error: profileError } = await supabase
            .from("athlete_profiles")
            .upsert(
                {
                    athlete_id: user.id,
                    sport,
                    competitive_level,
                    anxiety_symptoms,
                    time_preference,
                    onboarding_complete: true,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "athlete_id" }
            );

        if (profileError) {
            return NextResponse.json(
                { data: null, error: { message: profileError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // Fetch all techniques for recommendation
        const { data: techniques, error: techError } = await supabase
            .from("techniques")
            .select("*");

        if (techError || !techniques) {
            return NextResponse.json(
                { data: null, error: { message: "Failed to fetch techniques", code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // Run recommender
        const recommended = recommend(
            anxiety_symptoms as AnxietySymptom[],
            time_preference as TimePreference,
            techniques as Technique[]
        );

        return NextResponse.json({
            data: {
                profile_saved: true,
                recommended,
            },
            error: null,
        });
    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
