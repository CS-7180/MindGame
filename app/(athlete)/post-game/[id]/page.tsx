import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PostGameForm from '@/components/post-game/PostGameForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export default async function PostGamePage({ params }: { params: { id: string } }) {
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
        redirect('/login');
    }

    const { data: log, error } = await supabase
        .from('game_logs')
        .select('*')
        .eq('id', params.id)
        .eq('athlete_id', session.user.id)
        .single();

    if (error || !log) {
        console.error('Error fetching game log for post-game:', error);
        redirect('/home');
    }

    // If already posted, maybe redirect to history detail
    if (log.post_logged_at) {
        redirect(`/history/${log.id}`);
    }

    const formattedDate = format(new Date(`${log.log_date}T12:00:00`), 'MMMM d, yyyy');

    return (
        <div className="container max-w-2xl py-8 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Post-Game Reflection</h1>
                <p className="text-muted-foreground">
                    Record your performance and mental state for your {log.sport} game on {formattedDate}.
                </p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Reflection Details</CardTitle>
                    <CardDescription>
                        Be honest with yourself to track your progress accurately over time.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PostGameForm logId={log.id} />
                </CardContent>
            </Card>
        </div>
    );
}
