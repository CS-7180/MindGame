const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
    if (userErr || !users.users.length) {
        console.error("No users found", userErr);
        return;
    }
    for (const user of users.users) {
        const userId = user.id;

        const logs = [];
        for (let i = 1; i <= 6; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (7 - i));
            const dt = d.toISOString();

            const routineDone = i % 2 !== 0;

            logs.push({
                athlete_id: userId,
                sport: "Tennis",
                routine_completed: routineDone ? 'yes' : 'no',
                pre_anxiety_level: 3,
                pre_confidence_level: 4,
                pre_notes: "Test pre log " + i,
                pre_logged_at: dt,
                log_date: dt.split("T")[0],
                post_performance: routineDone ? 5 : 2,
                post_mental_state: routineDone ? 4 : 3,
                post_descriptor: "Test post log " + i,
                post_logged_at: dt
            });
        }

        const { error: insErr } = await supabase.from('game_logs').insert(logs);
        if (insErr) {
            console.error("Insert error for user", userId, ":", insErr);
        } else {
            console.log("Successfully inserted 6 test logs for athlete:", userId);
        }
    }
}
seed();
