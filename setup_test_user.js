const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTestUser() {
    const email = 'athlete@example.com';
    const password = 'password123';

    console.log('Searching for user:', email);
    let user = null;
    let pageNum = 1;
    let hasMore = true;

    while (hasMore && !user) {
        const { data, error } = await supabase.auth.admin.listUsers({ page: pageNum, perPage: 50 });
        if (error) {
            console.error('List users error:', error);
            return;
        }
        user = data.users.find(u => u.email === email);
        if (data.users.length < 50) hasMore = false;
        pageNum++;
    }

    if (!user) {
        console.log('User not found in list, attempting to create...');
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });
        if (createErr) {
            console.error('Create user error (might already exist but search failed):', createErr.message);
            // If it still says exists, we have a problem with searching.
            return;
        }
        user = newUser.user;
    } else {
        console.log('User found:', user.id);
    }

    // 2. Ensure profiles row exists
    const { error: baseProfileErr } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            role: 'athlete',
            display_name: 'Test Athlete'
        }, { onConflict: 'id' });

    if (baseProfileErr) {
        console.error('Upsert base profile error:', baseProfileErr);
    } else {
        console.log('Base profile ensured');
    }

    // 3. Ensure athlete_profile exists with a sport
    const { data: profile, error: profileErr } = await supabase
        .from('athlete_profiles')
        .upsert({
            athlete_id: user.id,
            sport: 'Basketball',
            competitive_level: 'college',
            anxiety_symptoms: ['overthinking'],
            time_preference: '5min',
            onboarding_complete: true
        }, { onConflict: 'athlete_id' })
        .select()
        .single();

    if (profileErr) {
        console.error('Upsert athlete profile error:', profileErr);
    } else {
        console.log('Athlete profile ensured:', profile.athlete_id);
    }
}

setupTestUser();
