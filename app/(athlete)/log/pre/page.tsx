import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PreGameLogForm } from "@/components/logging/PreGameLogForm";

export default async function PreGameLogPage({ searchParams }: { searchParams: { sport?: string; gameId?: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("athlete_profiles")
        .select("sport")
        .eq("athlete_id", user.id)
        .single();

    return <PreGameLogForm sport={searchParams.sport || profile?.sport} gameId={searchParams.gameId} />;
}
