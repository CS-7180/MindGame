import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
    const { data: templates, error } = await supabase
        .from("routines")
        .select(`
            id,
            name,
            steps:routine_steps(
                step_order,
                technique:techniques(name, duration_minutes)
            )
        `)
        .eq("is_template", true)
        .order("created_at", { ascending: false });

    console.log(JSON.stringify(templates, null, 2));
    console.log("Error:", error);
}

test();
