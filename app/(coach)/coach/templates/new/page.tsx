import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Technique } from '@/types'
import { TemplateBuilder } from '@/components/coach/TemplateBuilder'

export default async function NewTemplatePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Verify coach role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'coach') {
        redirect('/home')
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
                Failed to load data. Please try again later.
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 xl:max-w-7xl">
            <div className="mb-6 pl-1">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    Create Routine Template
                </h1>
                <p className="text-slate-400 mt-1 text-sm">
                    Build a recommended mental routine for your athletes to customize and use.
                </p>
            </div>

            <TemplateBuilder initialTechniques={techniques as Technique[]} />
        </div>
    )
}
