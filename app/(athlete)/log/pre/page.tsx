import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PreGameLogForm } from "@/components/logging/PreGameLogForm";

export default async function PreGameLogPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("sport")
        .eq("id", user.id)
        .single();

    return <PreGameLogForm sport={profile?.sport} />;
}
