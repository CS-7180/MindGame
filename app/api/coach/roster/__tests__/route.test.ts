import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'
import { createClient } from '@/lib/supabase/server'

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}))

describe('Coach Roster API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('GET /api/coach/roster', () => {
        it('should return 401 if user is not authenticated', async () => {
            ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) }
            })

            const response = await GET()
            expect(response.status).toBe(401)
        })

        it('should return 403 if user is not a coach', async () => {
            const mockSingle = vi.fn().mockResolvedValue({ data: { role: 'athlete' }, error: null })
            const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
            const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
            const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

                ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'athlete-id' } }, error: null }) },
                    from: mockFrom
                })

            const response = await GET()
            expect(response.status).toBe(403)

            const data = await response.json()
            expect(data.error.code).toBe('FORBIDDEN')
        })

        it('should return limited data for coach users', async () => {
            // Mock profile query for coach role check
            const mockProfileSingle = vi.fn().mockResolvedValue({ data: { role: 'coach' }, error: null })
            const mockProfileEq = vi.fn().mockReturnValue({ single: mockProfileSingle })
            const mockProfileSelect = vi.fn().mockReturnValue({ eq: mockProfileEq })

            // Mock roster query
            const rosterEq = vi.fn().mockResolvedValue({
                data: [
                    {
                        athlete_id: 'athlete-1',
                        joined_at: '2026-01-01',
                        athlete: { display_name: 'Test Athlete', role: 'athlete' }
                    }
                ],
                error: null
            })
            const rosterSelect = vi.fn().mockReturnValue({ eq: rosterEq })

            // Mock routines query for active routine check
            const routinesEq = vi.fn().mockResolvedValue({
                data: [{ athlete_id: 'athlete-1', is_active: true }],
                error: null
            })
            const routinesIn = vi.fn().mockReturnValue({ eq: routinesEq })
            const routinesSelect = vi.fn().mockReturnValue({ in: routinesIn })

            const mockFrom = vi.fn().mockImplementation((table: string) => {
                if (table === 'profiles') {
                    return { select: mockProfileSelect }
                }
                if (table === 'coach_roster') {
                    return { select: rosterSelect }
                }
                if (table === 'routines') {
                    return { select: routinesSelect }
                }
                return { select: vi.fn() }
            })

                ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'coach-id' } }, error: null }) },
                    from: mockFrom
                })

            const response = await GET()
            expect(response.status).toBe(200)

            const json = await response.json()
            expect(json.data).toHaveLength(1)
            expect(json.data[0]).toEqual({
                athlete_id: 'athlete-1',
                display_name: 'Test Athlete',
                has_active_routine: true,
                joined_at: '2026-01-01',
            })

            // Verify NO sensitive data is exposed
            expect(json.data[0]).not.toHaveProperty('anxiety_scores')
            expect(json.data[0]).not.toHaveProperty('performance_ratings')
            expect(json.data[0]).not.toHaveProperty('game_logs')
        })
    })
})
