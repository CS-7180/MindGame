import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
                { status: 401 }
            );
        }

        // 2. Fetch routines where is_template = true
        // The RLS policy "Templates are viewable by everyone" should allow this.
        const { data: templates, error } = await supabase
            .from("routines")
            .select(`
                *,
                steps:routine_steps(
                    *,
                    technique:techniques(*)
                )
            `)
            .eq("is_template", true)
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json(
                { data: null, error: { message: error.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        console.log("Raw Templates Fetch:", JSON.stringify(templates, null, 2));

        return NextResponse.json({ data: templates, error: null });
    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
