import Link from "next/link";
import { Plus, Users, LayoutTemplate, Sparkles, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "../../../../lib/supabase/server";

export default async function CoachHomePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let coachCode = '';
    let rosterCount = 0;
    let templateCount = 0;

    if (user) {
        // Fetch coach profile for the code
        const { data: profile } = await supabase
            .from("profiles")
            .select("team_code")
            .eq("id", user.id)
            .single();

        coachCode = profile?.team_code || '';

        // Fetch roster count
        const { count: rc } = await supabase
            .from("coach_roster")
            .select("*", { count: "exact", head: true })
            .eq("coach_id", user.id);
        rosterCount = rc || 0;

        // Fetch template count
        const { count: tc } = await supabase
            .from("coach_templates")
            .select("*", { count: "exact", head: true })
            .eq("coach_id", user.id);
        templateCount = tc || 0;
    }
    return (
        <div className="p-4 max-w-lg mx-auto space-y-6">
            <div className="pt-4">
                <h1 className="text-2xl font-bold text-white tracking-tight">Coach Dashboard</h1>
                <p className="text-slate-400 mt-1">
                    Manage your routine templates and view your team roster.
                </p>
            </div>

            <div className="space-y-4">
                {/* Action Items */}
                <Card className="border-indigo-500/30 bg-indigo-950/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            Action Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {rosterCount === 0 && (
                            <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <div className="bg-amber-500/20 p-2 rounded-full mt-0.5 shrink-0">
                                    <Users className="w-4 h-4 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-200">Invite Athletes</p>
                                    <p className="text-xs text-slate-400 mt-1">Share your coach code <strong className="text-white bg-slate-800 px-1 py-0.5 rounded">{coachCode}</strong> to add athletes to your roster.</p>
                                </div>
                            </div>
                        )}

                        {templateCount === 0 && (
                            <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <div className="bg-emerald-500/20 p-2 rounded-full mt-0.5 shrink-0">
                                    <LayoutTemplate className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="w-full">
                                    <p className="text-sm font-medium text-slate-200">Create a Template</p>
                                    <p className="text-xs text-slate-400 mt-1 mb-2">Build your first routine template to share with your athletes.</p>
                                    <Link href="/coach/templates/new">
                                        <Button size="sm" variant="outline" className="w-full text-xs h-8 bg-slate-800 hover:bg-slate-700 border-slate-700 text-white">
                                            Create Template
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {rosterCount > 0 && templateCount > 0 && (
                            <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <div className="bg-blue-500/20 p-2 rounded-full mt-0.5 shrink-0">
                                    <Share2 className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="w-full">
                                    <p className="text-sm font-medium text-slate-200">Share Templates</p>
                                    <p className="text-xs text-slate-400 mt-1 mb-2">Ensure all your newly joined athletes have received your routine templates.</p>
                                    <Link href="/coach/templates">
                                        <Button size="sm" variant="outline" className="w-full text-xs h-8 bg-slate-800 hover:bg-slate-700 border-slate-700 text-white">
                                            View Templates
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Link href="/coach/templates/new" className="block">
                    <Button className="w-full h-14 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all">
                        <Plus className="mr-2 h-5 w-5" />
                        Create New Template
                    </Button>
                </Link>

                <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:bg-slate-900/80 transition-all text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            My Templates
                        </CardTitle>
                        <LayoutTemplate className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-2">View templates</div>
                        <p className="text-xs text-slate-400 mb-4">
                            Manage your existing templates and share them.
                        </p>
                        <Link href="/coach/templates">
                            <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/25">View Templates</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:bg-slate-900/80 transition-all text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Team Roster
                        </CardTitle>
                        <Users className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-2">My Athletes</div>
                        <p className="text-xs text-slate-400 mb-4">
                            Check who on your team is using a prep routine.
                        </p>
                        <Link href="/coach/roster">
                            <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/25">View Roster</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
