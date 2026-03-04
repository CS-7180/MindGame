import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const deleteEntrySchema = z.object({
    entry_id: z.string().uuid("Invalid entry ID"),
});

export async function DELETE(request: Request) {
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

        // Parse and validate request body
        const body = await request.json();
        const parsed = deleteEntrySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { data: null, error: { message: "Invalid payload", code: "VALIDATION_ERROR", details: parsed.error.issues } },
                { status: 400 }
            );
        }

        // Call the delete_game_log_entry RPC
        const { error: rpcError } = await supabase.rpc("delete_game_log_entry", {
            entry_id: parsed.data.entry_id,
        });

        if (rpcError) {
            // The RPC raises an exception if the entry doesn't belong to the user
            return NextResponse.json(
                { data: null, error: { message: rpcError.message, code: "NOT_FOUND" } },
                { status: 404 }
            );
        }

        return NextResponse.json({
            data: { message: "Entry deleted successfully" },
            error: null
        });

    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
