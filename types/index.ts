import { Database } from './database'

export type Technique = Database['public']['Tables']['techniques']['Row']
export type Routine = Database['public']['Tables']['routines']['Row']
export type RoutineStep = Database['public']['Tables']['routine_steps']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

// A routine step joined with its technique for UI display
export type RoutineStepWithTechnique = RoutineStep & {
    technique: Technique
}

// A full routine joined with its steps and techniques
export type RoutineWithSteps = Routine & {
    steps: RoutineStepWithTechnique[]
}
