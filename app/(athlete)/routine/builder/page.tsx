import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Technique } from '@/types'
import { RoutineBuilder } from '@/components/routine/RoutineBuilder'

export default async function RoutineBuilderPage() {
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

    if (error || !techniques) {
        return (
            <div className="container mx-auto py-8 text-center text-red-500">
                Failed to load technique library. Please try again later.
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
                <RoutineBuilder initialTechniques={techniques as Technique[]} />
            </div>
        </div>
    )
}
