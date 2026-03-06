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

        const { data: games, error } = await supabase
            .from("games")
            .select("*")
            .eq("athlete_id", user.id)
            .gte("game_date", new Date().toISOString().split('T')[0])
            .order("game_date", { ascending: true })
            .order("game_time", { ascending: true });

        if (error) {
            return NextResponse.json(
                { data: null, error: { message: error.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: games, error: null });
    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { sport, game_date, game_time, reminder_offset_mins } = body;

        if (!sport || !game_date || !game_time) {
            return NextResponse.json(
                { data: null, error: { message: "Missing required fields", code: "MISSING_FIELDS" } },
                { status: 400 }
            );
        }

        const { data: game, error } = await supabase
            .from("games")
            .insert({
                athlete_id: user.id,
                sport,
                game_date,
                game_time,
                reminder_offset_mins: reminder_offset_mins || 45
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { data: null, error: { message: error.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: game, error: null }, { status: 201 });
    } catch (e) {
        console.error("Game creation error:", e);
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
