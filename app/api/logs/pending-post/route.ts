import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sport = searchParams.get('sport');
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get today's date in YYYY-MM-DD
        // Ensure timezone consideration if needed, but for MVP standard ISO split works
        // matching the pre-game log date logic
        const tzOffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, -1);
        const today = localISOTime.split('T')[0];

        // Find a log for today that has pre_logged_at but NO post_logged_at
        let query = supabase
            .from('game_logs')
            .select('*')
            .eq('athlete_id', session.user.id)
            .eq('log_date', today)
            .not('pre_logged_at', 'is', null)
            .is('post_logged_at', null);

        if (sport && sport !== 'Unspecified') {
            query = query.eq('sport', sport);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means zero rows returned from single()
            console.error('Error fetching pending post logs:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json({ pendingLog: data || null });
    } catch (error) {
        console.error('Unexpected error in GET /api/logs/pending-post:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
