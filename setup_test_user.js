const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    console.log(`Loading env from: ${envPath}`);
    dotenv.config({ path: envPath });
} else {
    console.log('.env.local not found, relying on system environment variables.');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL is missing.');
}
if (!supabaseKey) {
    console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is missing.');
}

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function findUserByEmail(email) {
    let pageNum = 1;
    let hasMore = true;
    while (hasMore) {
        const { data, error } = await supabase.auth.admin.listUsers({ page: pageNum, perPage: 100 });
        if (error) {
            console.error('Error listing users:', error);
            return null;
        }
        const user = data.users.find(u => u.email === email);
        if (user) return user;
        if (data.users.length < 100) hasMore = false;
        pageNum++;
    }
    return null;
}

async function setupUser(email, password, preferredId, role, displayName, teamCode = null) {
    console.log(`Setting up user: ${email} (${role})`);
    
    let user = await findUserByEmail(email);
    let userId;

    if (!user) {
        console.log(`User ${email} not found, creating with ID ${preferredId}...`);
        const { data: newData, error: createErr } = await supabase.auth.admin.createUser({
            id: preferredId,
            email,
            password,
            email_confirm: true,
            user_metadata: { display_name: displayName }
        });
        
        if (createErr) {
            console.error(`Create user error for ${email}:`, createErr.message);
            // Fallback: search one last time in case of a race
            user = await findUserByEmail(email);
            if (!user) return;
            userId = user.id;
        } else {
            userId = newData.user.id;
        }
    } else {
        userId = user.id;
        console.log(`User ${email} found with ID: ${userId}`);
    }

    // Always ensure password/metadata is correct
    console.log(`Ensuring password and metadata for ${email}...`);
    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
        password: password,
        user_metadata: { display_name: displayName }
    });
    
    if (updateErr) {
        console.warn(`Update error for ${email}:`, updateErr.message);
    }

    // 2. Profile
    const { error: profileErr } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            role,
            display_name: displayName,
            team_code: teamCode
        }, { onConflict: 'id' });

    if (profileErr) {
        console.error(`Profile error for ${email}:`, profileErr);
    } else {
        console.log(`Profile ensured for ${email}`);
    }

    // 3. Athlete specific
    if (role === 'athlete') {
        const { error: athleteErr } = await supabase
            .from('athlete_profiles')
            .upsert({
                athlete_id: userId,
                sport: 'basketball',
                competitive_level: 'college',
                anxiety_symptoms: ['overthinking', 'physical_tension'],
                time_preference: '5min',
                onboarding_complete: true
            }, { onConflict: 'athlete_id' });
            
        if (athleteErr) {
            console.error(`Athlete profile error:`, athleteErr);
        } else {
            console.log(`Athlete profile ensured for ${email}`);
        }
    }
}

async function run() {
    try {
        await setupUser(
            'athlete@example.com', 
            'password123', 
            '00000000-0000-0000-0000-000000000001', 
            'athlete', 
            'Test Athlete'
        );
        
        await setupUser(
            'coach@example.com', 
            'password123', 
            '00000000-0000-0000-0000-000000000002', 
            'coach', 
            'Test Coach',
            'COACH1'
        );
        
        console.log('Seeding complete successfully');
    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

run();
