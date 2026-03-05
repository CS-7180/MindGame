import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HistoryDetail } from "@/components/history/HistoryDetail";

export const metadata = {
    title: "Entry Detail | MindGame",
    description: "Detailed view of your game log",
};

export default async function HistoryDetailPage(
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const logId = params.id;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    // Fetch the single log. The RLS and logic ensures we only get it if we own it.
    const { data: log, error: logError } = await supabase
        .from("game_logs")
        .select(`
            id,
            log_date,
            sport,
            routine_completed,
            pre_anxiety_level,
            pre_confidence_level,
            pre_notes,
            pre_logged_at,
            post_performance,
            post_mental_state,
            post_descriptor,
            post_logged_at
        `)
        .eq("id", logId)
        .eq("athlete_id", user.id)
        .single();

    if (logError || !log) {
        // Option to display a "Not Found" UI instead, but redirecting to history is cleaner for now
        redirect("/history");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-6">
            <main className="max-w-xl mx-auto space-y-6">
                <HistoryDetail log={log} />
            </main>
        </div>
    );
}
