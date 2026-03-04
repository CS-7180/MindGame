import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { createClient } from '@/lib/supabase/server'

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}))

// Mock the recommender
vi.mock('@/lib/recommender', () => ({
    recommend: vi.fn().mockReturnValue([{ id: 'tech-1', name: 'Breathing' }])
}))

describe('Onboarding API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('POST /api/onboarding', () => {
        const validBody = {
            sport: 'Soccer',
            competitive_level: 'college',
            anxiety_symptoms: ['overthinking'],
            time_preference: '5min'
        }

        it('should return 401 if user is not authenticated', async () => {
            ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) }
            })

            const request = new Request('http://localhost/api/onboarding', {
                method: 'POST',
                body: JSON.stringify(validBody)
            })

            const response = await POST(request)
            expect(response.status).toBe(401)
        })

        it('should upsert profile and athlete_profile on success', async () => {
            const mockUpsert = vi.fn().mockResolvedValue({ error: null })
            const mockSelect = vi.fn().mockReturnValue({
                data: [{ id: 'tech-1', name: 'Breathing' }],
                error: null
            })
            const mockFrom = vi.fn().mockImplementation((table: string) => {
                if (table === 'profiles' || table === 'athlete_profiles') {
                    return { upsert: mockUpsert }
                }
                if (table === 'techniques') {
                    return { select: mockSelect }
                }
                return { upsert: vi.fn(), select: vi.fn() }
            })

                ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null }) },
                    from: mockFrom
                })

            const request = new Request('http://localhost/api/onboarding', {
                method: 'POST',
                body: JSON.stringify(validBody)
            })

            const response = await POST(request)
            expect(response.status).toBe(200)

            // Verify both profile and athlete_profile were upserted
            expect(mockFrom).toHaveBeenCalledWith('profiles')
            expect(mockFrom).toHaveBeenCalledWith('athlete_profiles')
            expect(mockUpsert).toHaveBeenCalledTimes(2)

            const json = await response.json()
            expect(json.data.profile_saved).toBe(true)
            expect(json.data.recommended).toBeDefined()
        })

        it('should return 500 if profile upsert fails', async () => {
            const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'FK violation' } })
            const mockFrom = vi.fn().mockImplementation((table: string) => {
                if (table === 'profiles') {
                    return { upsert: mockUpsert }
                }
                return { upsert: vi.fn() }
            })

                ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null }) },
                    from: mockFrom
                })

            const request = new Request('http://localhost/api/onboarding', {
                method: 'POST',
                body: JSON.stringify(validBody)
            })

            const response = await POST(request)
            expect(response.status).toBe(500)

            const json = await response.json()
            expect(json.error.message).toBe('Failed to ensure base profile exists')
        })
    })
})
