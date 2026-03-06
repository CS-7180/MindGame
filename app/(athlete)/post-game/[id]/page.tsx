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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="space-y-4 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                        Post-Game Reflection
                    </h1>
                    <p className="text-lg text-slate-300">
                        Record your performance and mental state for your <span className="font-semibold text-white">{log.sport}</span> game on <span className="font-semibold text-indigo-300">{formattedDate}</span>.
                    </p>
                </div>

                <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl overflow-hidden rounded-2xl">
                    <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 h-2 w-full" />
                    <CardHeader className="pb-6">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
                            Reflection Details
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-base">
                            Be honest with yourself to track your progress accurately over time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <PostGameForm logId={log.id} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
