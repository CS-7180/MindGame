import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../route'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
            ; (createClient as any).mockResolvedValue({
                auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) }
            })

            const response = await GET()
            expect(response.status).toBe(401)
        })
    })

    describe('POST /api/routines', () => {
        it('should return 400 if user already has 5 routines', async () => {
            // Setup mock
            const mockEq = vi.fn().mockResolvedValue({ count: 5, error: null })
            const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
            const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

                ; (createClient as any).mockResolvedValue({
                    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }) },
                    from: mockFrom
                })

            // Create dummy request
            const request = new Request('http://localhost/api/routines', {
                method: 'POST',
                body: JSON.stringify({ name: 'Test', steps: [{ technique_id: 'test-id', step_order: 0 }] })
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error.code).toBe('LIMIT_REACHED')
        })
    })
})
