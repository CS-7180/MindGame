import Link from "next/link";
import { Plus, Users, LayoutTemplate, Sparkles, Share2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamCodeCard } from "@/components/coach/TeamCodeCard";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

export default async function CoachHomePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    interface Template {
        id: string;
        name: string;
        time_tier: string;
        coach_note: string | null;
    }

    interface RosterItem {
        athlete_id: string;
        joined_at: string | null;
        has_active_routine: boolean;
        profiles: {
            full_name: string | null;
            avatar_url: string | null;
        } | null;
    }

    interface RawRosterData {
        athlete_id: string;
        joined_at: string | null;
        profiles: {
            full_name: string | null;
            avatar_url: string | null;
        }[] | {
            full_name: string | null;
            avatar_url: string | null;
        } | null;
    }

    let coachCode = '';
    let rosterCount = 0;
    let templateCount = 0;
    let templates: Template[] = [];
    let roster: RosterItem[] = [];

    if (user) {
        // Fetch coach profile
        const { data: profile } = await supabase
            .from("coach_profiles")
            .select("coach_code")
            .eq("id", user.id)
            .single();

        coachCode = profile?.coach_code || '';

        // Fetch roster count and recent athletes
        const { data: rosterData, count: rc } = await supabase
            .from("coach_roster")
            .select("athlete_id, joined_at, profiles(full_name, avatar_url)", { count: "exact" })
            .eq("coach_id", user.id)
            .order("joined_at", { ascending: false })
            .limit(5);
        rosterCount = rc || 0;

        const athleteIds = (rosterData || []).map(r => r.athlete_id);
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

        // Cast and format the relationship data
        roster = (rosterData as unknown as RawRosterData[])?.map((item) => ({
            ...item,
            profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
            has_active_routine: !!activeRoutineMap[item.athlete_id]
        })) || [];

        // Fetch templates
        const { data: templateData, count: tc } = await supabase
            .from("coach_templates")
            .select("id, name, time_tier, coach_note")
            .eq("coach_id", user.id)
            .limit(3);
        templateCount = tc || 0;
        templates = templateData || [];
    }

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
            {/* Hero / Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                        Coach <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Dashboard</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl">
                        Manage your team, design elite routines, and track athlete performance from one central hub.
                    </p>
                </div>
                <Link href="/coach/templates/new" className="shrink-0">
                    <Button className="h-14 px-8 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:scale-105 transition-all rounded-2xl">
                        <Plus className="mr-2 h-6 w-6" />
                        Create New Template
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Stats & Action Items */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Coach Code Card */}
                    <TeamCodeCard code={coachCode} />

                    {/* Action Items */}
                    <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/5 pb-4">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                Action Center
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-white/5">
                                {rosterCount === 0 ? (
                                    <div className="p-6 text-center space-y-3">
                                        <div className="bg-amber-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto">
                                            <Users className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-300">No athletes joined yet</p>
                                        <p className="text-xs text-slate-500">Share your coach code to start building your roster.</p>
                                    </div>
                                ) : templateCount === 0 ? (
                                    <div className="p-6 text-center space-y-4">
                                        <div className="bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto">
                                            <LayoutTemplate className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-300">Set the standard</p>
                                            <p className="text-xs text-slate-500 mt-1">Create your first routine template to share with your roster.</p>
                                        </div>
                                        <Link href="/coach/templates/new" className="block">
                                            <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-white border-white/5 rounded-xl">Create Template</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="p-6 text-center space-y-4">
                                        <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto">
                                            <Share2 className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-300">Keep them focused</p>
                                            <p className="text-xs text-slate-500 mt-1">You have {templateCount} active templates. Share them with any new athletes on your roster.</p>
                                        </div>
                                        <Link href="/coach/templates" className="block">
                                            <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-white border-white/5 rounded-xl">Sync Templates</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Main Modules */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Templates Module */}
                    <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col group hover:border-indigo-500/30 transition-all duration-300">
                        <CardHeader className="border-b border-white/5 bg-white/5 pb-4 px-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                <LayoutTemplate className="w-5 h-5 text-indigo-400" />
                                Templates
                            </CardTitle>
                            <Badge variant="secondary" className="bg-white/5 text-slate-400 border-none">{templateCount}</Badge>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {templates.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {templates.map((t) => (
                                        <div key={t.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group/item hover:bg-white/10 transition-all">
                                            <div className="space-y-1">
                                                <p className="font-semibold text-slate-200 text-sm truncate max-w-[150px]">{t.name}</p>
                                                <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold">{t.time_tier} Tier</p>
                                            </div>
                                            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <Share2 className="w-4 h-4 text-indigo-400" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-slate-500 py-10 text-sm">No templates archived yet.</p>
                            )}
                        </CardContent>
                        <div className="p-6 pt-0 flex justify-end">
                            <Link href="/coach/templates">
                                <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl font-semibold transition-all">
                                    Manage Repository →
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Detailed Roster Module */}
                    <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col group hover:border-purple-500/30 transition-all duration-300">
                        <CardHeader className="border-b border-white/5 bg-white/5 pb-4 px-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-400" />
                                Team Roster
                            </CardTitle>
                            <Badge variant="secondary" className="bg-white/5 text-slate-400 border-none">{rosterCount} Total</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            {roster.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-white/5 mt-4">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Athlete</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Joined</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {roster.map((athlete) => (
                                                <tr key={athlete.athlete_id} className="group/row hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center text-purple-400 font-bold text-xs ring-1 ring-white/10 group-hover/row:scale-110 transition-transform">
                                                                {athlete.profiles?.full_name?.charAt(0) || 'A'}
                                                            </div>
                                                            <span className="font-semibold text-slate-200">{athlete.profiles?.full_name || 'Anonymous Athlete'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                                                        {athlete.joined_at ? format(new Date(athlete.joined_at), 'MMM d, yyyy') : 'Recently'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {athlete.has_active_routine ? (
                                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium px-2.5 py-1">
                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Active Routine
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-slate-500 border-slate-700 bg-transparent font-medium px-2.5 py-1">
                                                                <XCircle className="w-3.5 h-3.5 mr-1.5" /> No Routine
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center text-slate-500 py-10 text-sm">Roster is currently empty.</p>
                            )}
                        </CardContent>
                        <div className="p-6 flex justify-end">
                            <Link href="/coach/roster">
                                <Button variant="ghost" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-xl font-semibold transition-all">
                                    Manage Athletes →
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <p className="text-xs text-slate-500 italic mt-2 flex items-center gap-1.5 px-6">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Privacy note: You only see activation status, not personal scores or logs.
                    </p>
                </div>
            </div>
        </div>
    );
}
