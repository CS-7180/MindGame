import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getTemplates() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { templates: [], rosterCount: 0 };

    const { data: templates } = await supabase
        .from("coach_templates")
        .select(`
        *,
        steps:coach_template_steps(
            *,
            technique:techniques(*)
        ),
        notifications:template_notifications(athlete_id)
    `)
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

    const { count: rosterCount } = await supabase
        .from("coach_roster")
        .select("*", { count: 'exact', head: true })
        .eq("coach_id", user.id);

    return { templates: templates || [], rosterCount: rosterCount || 0 };
}


interface TemplateData {
    id: string;
    name: string;
    time_tier: string;
    coach_note: string | null;
    notifications?: { athlete_id: string }[];
    [key: string]: unknown;
}

export default async function CoachTemplatesPage() {
    const { templates, rosterCount } = await getTemplates() as { templates: TemplateData[], rosterCount: number };

    // Map templates to include sharing stats
    const mappedTemplates = templates.map((t: TemplateData) => ({
        ...t,
        coach_note: t.coach_note || undefined,
        sharedCount: t.notifications ? t.notifications.length : 0
    }));

    return (
        <div className="p-4 max-w-lg mx-auto space-y-6">
            <div className="flex items-center justify-between pt-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Routine Templates</h1>
                    <p className="text-slate-400 mt-1">
                        Create and manage mental routines for your team.
                    </p>
                </div>
                <Link href="/coach/templates/new">
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md">
                        <Plus className="mr-2 h-4 w-4" />
                        New Template
                    </Button>
                </Link>
            </div>

            <Suspense fallback={<div>Loading templates...</div>}>
                {/* We will build a client component for the list to handle sharing and deleting */}
                <TemplateListClient initialTemplates={mappedTemplates} rosterCount={rosterCount} />
            </Suspense>
        </div>
    );
}

// We'll define TemplateListClient separately
import { TemplateListClient } from "@/components/coach/TemplateListClient";
