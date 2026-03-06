import Link from "next/link";
import { Plus, Users, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CoachHomePage() {
    return (
        <div className="p-4 max-w-lg mx-auto space-y-6">
            <div className="pt-4">
                <h1 className="text-2xl font-bold text-white tracking-tight">Coach Dashboard</h1>
                <p className="text-slate-400 mt-1">
                    Manage your routine templates and view your team roster.
                </p>
            </div>

            <div className="space-y-4">
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
