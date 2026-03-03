import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RoutineExecution } from '@/components/routine/RoutineExecution'
import { RoutineWithSteps } from '@/types/index'

export default async function ExecuteRoutinePage({ params }: { params: { routineId: string } }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch the routine along with its steps and populated techniques
    const { data: routine, error } = await supabase
        .from('routines')
        .select(`
            *,
            steps:routine_steps(
                *,
                technique:techniques(*)
            )
        `)
        .eq('id', params.routineId)
        .eq('athlete_id', user.id)
        .single()

    if (error || !routine) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-300">
                <h1 className="text-2xl font-bold mb-2 text-white">Routine Not Found</h1>
                <p>We couldn&apos;t load this routine. It may have been deleted.</p>
                <a href="/home" className="mt-6 text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                    Return Home
                </a>
            </div>
        )
    }

    return <RoutineExecution routine={routine as unknown as RoutineWithSteps} />
}
