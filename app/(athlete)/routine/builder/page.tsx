import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Technique } from '@/types'
import { RoutineBuilder } from '@/components/routine/RoutineBuilder'

export default async function RoutineBuilderPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams;
    const initialSport = searchParams.sport as string | undefined;
    const editId = searchParams.edit as string | undefined;

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch techniques to populate the builder library
    const { data: techniques, error } = await supabase
        .from('techniques')
        .select('*')
        .order('category')
        .order('name')

    const { count: currentRoutinesCount, error: countError } = await supabase
        .from('routines')
        .select('*', { count: 'exact', head: true })
        .eq('athlete_id', user.id)
        .eq('is_template', false)

    const { data: athleteProfile } = await supabase
        .from('athlete_profiles')
        .select('sport, sports')
        .eq('athlete_id', user.id)
        .single()

    let editingRoutine = undefined;
    if (editId) {
        const { data: fetchRoutine } = await supabase
            .from('routines')
            .select(`
                *,
                routine_steps (
                    id,
                    step_order,
                    technique:techniques(*)
                )
            `)
            .eq('id', editId)
            .eq('athlete_id', user.id)
            .single();

        if (fetchRoutine) {
            editingRoutine = fetchRoutine;
        }
    }

    const defaultSport = initialSport || athleteProfile?.sport || editingRoutine?.sport || 'Unspecified';

    // Build the list of athlete's enrolled sports
    const athleteSports: string[] = athleteProfile?.sports && athleteProfile.sports.length > 0
        ? athleteProfile.sports
        : athleteProfile?.sport
            ? [athleteProfile.sport]
            : [];

    const isSportLocked = !!initialSport;

    if (error || !techniques || countError !== null) {
        return (
            <div className="container mx-auto py-8 text-center text-red-500">
                Failed to load data. Please try again later.
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
            <div className="container mx-auto py-8 xl:max-w-7xl">
                <div className="mb-8 pl-1">
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Routine Builder
                    </h1>
                    <p className="text-slate-400 mt-2 text-base">
                        Drag and drop techniques to create your personalized pre-game mental routine.
                    </p>
                </div>
                <RoutineBuilder
                    initialTechniques={techniques as Technique[]}
                    initialRoutine={editingRoutine}
                    currentRoutinesCount={currentRoutinesCount || 0}
                    defaultSport={defaultSport}
                    isSportLocked={isSportLocked}
                    athleteSports={athleteSports}
                />
            </div>
        </div>
    )
}
