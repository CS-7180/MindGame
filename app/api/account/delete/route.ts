import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
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

        // Call the delete_user_data RPC — deletes all user data across all tables
        const { error: rpcError } = await supabase.rpc("delete_user_data");

        if (rpcError) {
            return NextResponse.json(
                { data: null, error: { message: rpcError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        // Sign out the user after data deletion
        await supabase.auth.signOut();

        return NextResponse.json({
            data: { message: "Account and all data deleted successfully" },
            error: null
        });

    } catch {
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
