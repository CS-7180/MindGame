import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../route'
import { createClient } from '@/lib/supabase/server'

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}))

describe('Routines API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('GET /api/routines', () => {
        it('should return 401 if user is not authenticated', async () => {
            // Setup mock to simulate unauthenticated user
            ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) }
            })

            const response = await GET()
            expect(response.status).toBe(401)
        })
    })

    describe('POST /api/routines', () => {
        it('should return 400 if user already has 5 routines', async () => {
            // Setup mock
            const mockEq2 = vi.fn().mockResolvedValue({ count: 5, error: null })
            const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
            const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
            const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

                ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }) },
                    from: mockFrom
                })

            // Create dummy request
            const request = new Request('http://localhost/api/routines', {
                method: 'POST',
                body: JSON.stringify({ name: 'Test', sport: 'Soccer', steps: [{ technique_id: '123e4567-e89b-12d3-a456-426614174000', step_order: 0 }] })
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error.code).toBe('LIMIT_REACHED')
        })
    })
})
