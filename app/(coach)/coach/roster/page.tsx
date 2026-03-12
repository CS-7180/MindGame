import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { TeamCodeCard } from "@/components/coach/TeamCodeCard";

async function getRosterData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { roster: [], teamCode: null };

    // Fetch team code from profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("team_code")
        .eq("id", user.id)
        .single();

    // Fetch roster
    const { data: roster, error: rosterError } = await supabase
        .from("coach_roster")
        .select(`
            athlete_id,
            joined_at,
            athlete:profiles!coach_roster_athlete_id_fkey(
                display_name,
                role
            )
        `)
        .eq("coach_id", user.id);

    if (rosterError || !roster) return { roster: [], teamCode: profile?.team_code || null };

    const athleteIds = roster.map(r => r.athlete_id);
    const activeRoutineMap: Record<string, boolean> = {};

    if (athleteIds.length > 0) {
        const { data: routines } = await supabase
            .from("routines")
            .select("athlete_id, is_active")
            .in("athlete_id", athleteIds)
            .eq("is_active", true);

        if (routines) {
            for (const r of routines) {
                activeRoutineMap[r.athlete_id] = true;
            }
        }
    }

    const formattedRoster = roster.map(entry => {
        let athleteData: { display_name: string | null } | null = null;
        if (Array.isArray(entry.athlete)) {
            athleteData = entry.athlete[0];
        } else {
            athleteData = entry.athlete as unknown as { display_name: string | null };
        }

        return {
            athlete_id: entry.athlete_id,
            display_name: athleteData?.display_name || "Unknown",
            has_active_routine: !!activeRoutineMap[entry.athlete_id],
            joined_at: entry.joined_at,
        };
    });

    return {
        roster: formattedRoster,
        teamCode: profile?.team_code || null
    };
}

type RosterAthlete = {
    athlete_id: string;
    display_name: string;
    joined_at: string | null;
    has_active_routine: boolean;
};

function RosterList({ roster }: { roster: RosterAthlete[] }) {
    if (roster.length === 0) {
        return (
            <div data-testid="empty-roster-state" className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-800 rounded-lg bg-slate-900/40 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-2 text-white">Your roster is empty</h3>
                <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                    Athletes will appear here once they use your invite code to join.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-md border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <div className="p-4 grid grid-cols-12 font-medium text-sm text-slate-400 border-b border-slate-800">
                <div className="col-span-5 sm:col-span-4">Athlete</div>
                <div className="col-span-4 hidden sm:block">Joined</div>
                <div className="col-span-7 sm:col-span-4 text-right">Routine Status</div>
            </div>
            <div className="divide-y divide-slate-800">
                {roster.map((athlete) => (
                    <div key={athlete.athlete_id} className="p-4 grid grid-cols-12 items-center text-sm hover:bg-slate-800/20 transition-colors">
                        <div className="col-span-5 sm:col-span-4 font-medium text-slate-200">
                            {athlete.display_name}
                        </div>
                        <div className="col-span-4 hidden sm:block text-slate-500">
                            {athlete.joined_at ? format(new Date(athlete.joined_at), 'MMM d, yyyy') : 'Unknown'}
                        </div>
                        <div className="col-span-7 sm:col-span-4 text-right flex justify-end">
                            {athlete.has_active_routine ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium px-2.5 py-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Active Routine
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-slate-500 border-slate-700 bg-transparent font-medium px-2.5 py-1">
                                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> No Routine
                                </Badge>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default async function CoachRosterPage() {
    const { roster, teamCode } = await getRosterData();

    return (
        <div className="p-4 max-w-lg mx-auto space-y-6">
            <div className="pt-4">
                <h1 className="text-2xl font-bold text-white tracking-tight">Team Roster</h1>
                <p className="text-slate-400 mt-1">
                    Manage your athletes and monitor their mental preparation.
                </p>
            </div>

            {teamCode && <TeamCodeCard code={teamCode} />}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Athletes</h2>
                    <Badge variant="outline" className="text-slate-400 border-slate-800">
                        {roster.length} Athletes
                    </Badge>
                </div>

                <Suspense fallback={<div className="text-slate-400 animate-pulse">Loading roster...</div>}>
                    <RosterList roster={roster} />
                </Suspense>

                <p className="text-xs text-slate-500 italic mt-2 flex items-center gap-1.5 px-1">
                    Privacy note: You only see activation status, not personal scores or logs.
                </p>
            </div>
        </div>
    );
}
