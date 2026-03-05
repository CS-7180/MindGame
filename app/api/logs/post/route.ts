import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
    try {
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

        const body = await request.json();
        const { log_id, post_performance, post_mental_state, post_descriptor, skipped } = body;

        if (!log_id) {
            return NextResponse.json({ error: 'log_id is required' }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
            post_logged_at: new Date().toISOString()
        };

        if (!skipped) {
            if (post_performance === undefined || post_mental_state === undefined) {
                return NextResponse.json({ error: 'Performance and mental state are required unless skipped' }, { status: 400 });
            }
            updateData.post_performance = post_performance;
            updateData.post_mental_state = post_mental_state;
            if (post_descriptor !== undefined) {
                updateData.post_descriptor = post_descriptor;
            }
        }

        const { data, error } = await supabase
            .from('game_logs')
            .update(updateData)
            .eq('id', log_id)
            .eq('athlete_id', session.user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating game log:', error);
            return NextResponse.json({ error: 'Failed to update game log' }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Unexpected error in PUT /api/logs/post:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
