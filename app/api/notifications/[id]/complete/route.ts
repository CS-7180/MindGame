import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    void request; // unused but required by Next.js route signature
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

        // Mark notification as saved
        const { error: updateError } = await supabase
            .from("template_notifications")
            .update({ status: "saved" })
            .eq("id", notificationId)
            .eq("athlete_id", user.id);

        if (updateError) {
            return NextResponse.json(
                { data: null, error: { message: updateError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: { success: true }, error: null });
    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
