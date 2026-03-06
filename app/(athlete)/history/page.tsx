import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HistoryList } from "@/components/history/HistoryList";

export const metadata = {
    title: "History | MindGame",
    description: "Review your past pre-game mental logs",
};

export default async function HistoryPage({ searchParams }: { searchParams: { sport?: string } }) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    // Removed unused profile query

    // Fetch logs (we do it server side for initial render)
    const { data: logs, error: logsError } = await supabase
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
        .eq("athlete_id", user.id)
        .order("log_date", { ascending: false });

    if (logsError) {
        console.error("Failed to fetch logs:", logsError);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-6">
            <main className="max-w-xl mx-auto space-y-6">
                <HistoryList
                    initialLogs={logs || []}
                    initialSport={searchParams.sport}
                />
            </main>
        </div>
    );
}
