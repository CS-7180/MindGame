import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

async function getTemplates() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: templates } = await supabase
        .from("coach_templates")
        .select(`
        *,
        steps:coach_template_steps(
            *,
            technique:techniques(*)
        )
    `)
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

    return templates || [];
}


export default async function CoachTemplatesPage() {
    const templates = await getTemplates();

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
                <TemplateListClient initialTemplates={templates} />
            </Suspense>
        </div>
    );
}

// We'll define TemplateListClient separately
import { TemplateListClient } from "@/components/coach/TemplateListClient";
