const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
    if (userErr) {
        console.error('User list error:', userErr);
        return;
    }

    console.log('Total users found:', users.users.length);
    users.users.forEach(u => console.log(`- ${u.email} (${u.id})`));

    const { data: profile, error: profileErr } = await supabase
        .from('athlete_profiles')
        .select('*')
        .eq('id', athleteUser.id)
        .single();

    if (profileErr) {
        console.log('Profile error (may not exist):', profileErr.message);
    } else {
        console.log('Profile found:', profile);
    }
}

checkUser();
