import Link from "next/link";
import { Plus, Users, LayoutTemplate, Sparkles, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { toast } from "sonner";

export default async function CoachHomePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let coachCode = '';
    let rosterCount = 0;
    let templateCount = 0;
    let templates: any[] = [];
    let roster: any[] = [];

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
            .select("athlete_id, profiles(full_name, avatar_url)", { count: "exact" })
            .eq("coach_id", user.id)
            .limit(5);
        rosterCount = rc || 0;
        roster = rosterData || [];

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
                    <Card className="border-indigo-500/20 bg-indigo-950/20 backdrop-blur-xl relative overflow-hidden rounded-3xl group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Your Team Access
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-3xl font-mono font-bold text-white tracking-widest" data-testid="coach-code">{coachCode}</p>
                                    <p className="text-xs text-slate-500">Share this code with your athletes</p>
                                </div>
                                <Button size="sm" variant="ghost" className="text-indigo-400 hover:bg-white/5 h-12 w-12 rounded-xl" onClick={() => {
                                    navigator.clipboard.writeText(coachCode);
                                    toast.success("Code copied!");
                                }}>
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

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
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Templates Module */}
                    <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col group hover:border-indigo-500/30 transition-all duration-300">
                        <CardHeader className="border-b border-white/5 bg-white/5 pb-4 px-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                <LayoutTemplate className="w-5 h-5 text-indigo-400" />
                                Templates
                            </CardTitle>
                            <Badge variant="secondary" className="bg-white/5 text-slate-400 border-none">{templateCount}</Badge>
                        </CardHeader>
                        <CardContent className="p-6 flex-1 space-y-4">
                            {templates.length > 0 ? (
                                <ul className="space-y-3">
                                    {templates.map((t) => (
                                        <li key={t.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group/item hover:bg-white/10 transition-all">
                                            <div className="space-y-1">
                                                <p className="font-semibold text-slate-200">{t.name}</p>
                                                <p className="text-xs text-slate-500 capitalize">{t.time_tier} Tier</p>
                                            </div>
                                            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <Share2 className="w-4 h-4 text-indigo-400" />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-slate-500 py-10 text-sm">No templates archived yet.</p>
                            )}
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                            <Link href="/coach/templates">
                                <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-2xl font-semibold transition-all group-hover:bg-indigo-600 group-hover:border-indigo-500">
                                    View Repository
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Roster Module */}
                    <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col group hover:border-purple-500/30 transition-all duration-300">
                        <CardHeader className="border-b border-white/5 bg-white/5 pb-4 px-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-400" />
                                Team Roster
                            </CardTitle>
                            <Badge variant="secondary" className="bg-white/5 text-slate-400 border-none">{rosterCount}</Badge>
                        </CardHeader>
                        <CardContent className="p-6 flex-1 space-y-4">
                            {roster.length > 0 ? (
                                <ul className="space-y-3">
                                    {roster.map((r) => (
                                        <li key={r.athlete_id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/40 to-indigo-500/40 flex items-center justify-center text-white font-bold text-sm">
                                                {r.profiles?.full_name?.charAt(0) || 'A'}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="font-semibold text-slate-200 text-sm">{r.profiles?.full_name || 'Anonymous Athlete'}</p>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-slate-500 py-10 text-sm">Roster is currently empty.</p>
                            )}
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                            <Link href="/coach/roster">
                                <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-2xl font-semibold transition-all group-hover:bg-purple-600 group-hover:border-purple-500">
                                    Manage Athletes
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
