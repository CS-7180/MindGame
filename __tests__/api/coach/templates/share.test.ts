import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../../../../app/api/coach/templates/[id]/share/route'
import { createClient } from '../../../../lib/supabase/server'

// Mock the dependencies
vi.mock('../../../../lib/supabase/server', () => ({
    createClient: vi.fn(),
}))

describe('Coach Templates Share API', () => {
    const mockUser = { id: 'coach-123' }
    const templateId = 'template-456'

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('POST /api/coach/templates/[id]/share', () => {
        it('returns 401 if unauthorized', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') }),
                },
            }
            vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

            const req = new Request(`http://localhost:3000/api/coach/templates/${templateId}/share`, { method: 'POST' })
            const response = await POST(req, { params: { id: templateId } })
            expect(response.status).toBe(401)
        })

        it('returns 404 if template not found or unauthorized', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
                },
                from: vi.fn().mockImplementation((table) => {
                    if (table === 'coach_templates') {
                        return {
                            select: vi.fn().mockReturnValue({
                                eq: vi.fn().mockReturnValue({
                                    eq: vi.fn().mockReturnValue({
                                        single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') })
                                    })
                                })
                            })
                        }
                    }
                }),
            }
            vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

            const req = new Request(`http://localhost:3000/api/coach/templates/${templateId}/share`, { method: 'POST' })
            const response = await POST(req, { params: { id: templateId } })
            expect(response.status).toBe(404)
        })

        it('returns 400 if roster is empty', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
                },
                from: vi.fn().mockImplementation((table) => {
                    if (table === 'coach_templates') {
                        return {
                            select: vi.fn().mockReturnValue({
                                eq: vi.fn().mockReturnValue({
                                    eq: vi.fn().mockReturnValue({
                                        single: vi.fn().mockResolvedValue({ data: { id: templateId }, error: null })
                                    })
                                })
                            })
                        }
                    }
                    if (table === 'coach_roster') {
                        return {
                            select: vi.fn().mockReturnValue({
                                eq: vi.fn().mockResolvedValue({ data: [], error: null })
                            })
                        }
                    }
                }),
            }
            vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

            const req = new Request(`http://localhost:3000/api/coach/templates/${templateId}/share`, { method: 'POST' })
            const response = await POST(req, { params: { id: templateId } })
            expect(response.status).toBe(400)
        })

        it('shares successfully with the roster', async () => {
            const mockRoster = [
                { athlete_id: 'athlete-1' },
                { athlete_id: 'athlete-2' }
            ]
            const insertMock = vi.fn().mockResolvedValue({ error: null })

            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
                },
                from: vi.fn().mockImplementation((table) => {
                    if (table === 'coach_templates') {
                        return {
                            select: vi.fn().mockReturnValue({
                                eq: vi.fn().mockReturnValue({
                                    eq: vi.fn().mockReturnValue({
                                        single: vi.fn().mockResolvedValue({ data: { id: templateId }, error: null })
                                    })
                                })
                            })
                        }
                    }
                    if (table === 'coach_roster') {
                        return {
                            select: vi.fn().mockReturnValue({
                                eq: vi.fn().mockResolvedValue({ data: mockRoster, error: null })
                            })
                        }
                    }
                    if (table === 'template_notifications') {
                        return {
                            select: vi.fn().mockReturnValue({
                                eq: vi.fn().mockResolvedValue({ data: [], error: null })
                            }),
                            insert: insertMock
                        }
                    }
                }),
            }
            vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

            const req = new Request(`http://localhost:3000/api/coach/templates/${templateId}/share`, { method: 'POST' })
            const response = await POST(req, { params: { id: templateId } })
            const json = await response.json()

            expect(response.status).toBe(200)
            expect(json.data.success).toBe(true)
            expect(json.data.count).toBe(2)

            expect(insertMock).toHaveBeenCalledWith([
                { athlete_id: 'athlete-1', coach_id: mockUser.id, template_id: templateId, status: 'pending' },
                { athlete_id: 'athlete-2', coach_id: mockUser.id, template_id: templateId, status: 'pending' }
            ])
        })
    })
})
