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

        const { data: notifications, error } = await supabase
            .from("template_notifications")
            .select(`
                *,
                coach:profiles!coach_id(display_name),
                template:coach_templates(
                    *,
                    steps:coach_template_steps(
                        *,
                        technique:techniques(*)
                    )
                )
            `)
            .eq("athlete_id", user.id)
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json(
                { data: null, error: { message: error.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: notifications, error: null });
    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
