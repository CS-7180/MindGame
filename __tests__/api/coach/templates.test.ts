import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../../../app/api/coach/templates/route'
import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'

// Mock the dependencies
vi.mock('../../../lib/supabase/server', () => ({
    createClient: vi.fn(),
}))

describe('Coach Templates API', () => {
    const mockUser = { id: 'coach-123' }
    const mockTemplate = {
        name: 'Game Focus',
        time_tier: 'standard',
        coach_note: 'Try this out!',
        steps: [{ technique_id: 'eb79e94c-af6d-4952-bc66-3d37a8b6e22e', step_order: 0 }]
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('GET /api/coach/templates', () => {
        it('returns 401 if unauthorized', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') }),
                },
            }
            vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

            const response = await GET()
            expect(response.status).toBe(401)
        })

        it('returns templates for the authenticated coach', async () => {
            const mockData = [{ id: '1', name: 'Focus' }]
            const matchMock = {
                order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }
            const eqMock = {
                eq: vi.fn().mockReturnValue(matchMock),
            }
            const selectMock = {
                select: vi.fn().mockReturnValue(eqMock),
            }

            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
                },
                from: vi.fn().mockReturnValue(selectMock),
            }

            vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

            const response = await GET()
            const json = await response.json()

            expect(response.status).toBe(200)
            expect(json.data).toEqual(mockData)
            expect(mockSupabase.from).toHaveBeenCalledWith('coach_templates')
            expect(eqMock.eq).toHaveBeenCalledWith('coach_id', mockUser.id)
        })
    })

    describe('POST /api/coach/templates', () => {
        it('returns 400 with invalid payload', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
                },
            }
            vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

            const req = new Request('http://localhost:3000/api/coach/templates', {
                method: 'POST',
                body: JSON.stringify({ name: '' }), // Invalid payload
            })

            const response = await POST(req)
            expect(response.status).toBe(400)
        })

        it('creates template and steps successfully', async () => {
            // Setup successful auth
            const authMock = { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }

            // Setup successful template insert
            const templateSingleMock = vi.fn().mockResolvedValue({ data: { id: 'temp-123' }, error: null })
            const templateSelectMock = { select: vi.fn().mockReturnValue({ single: templateSingleMock }) }
            const templateInsertMock = { insert: vi.fn().mockReturnValue(templateSelectMock) }

            // Setup successful steps insert
            const stepsInsertMock = { insert: vi.fn().mockResolvedValue({ error: null }) }

            // Setup complete fetch fetch
            const completeSingleMock = vi.fn().mockResolvedValue({ data: { ...mockTemplate, id: 'temp-123' }, error: null })
            const completeEqMock = { eq: vi.fn().mockReturnValue({ single: completeSingleMock }) }
            const completeSelectMock = { select: vi.fn().mockReturnValue(completeEqMock) }

            const fromMock = vi.fn((table) => {
                if (table === 'coach_templates') {
                    if (templateInsertMock.insert.mock.calls.length === 0) return templateInsertMock
                    return completeSelectMock
                }
                if (table === 'coach_template_steps') return stepsInsertMock
                return {}
            })

            const mockSupabase = { auth: authMock, from: fromMock }
            vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

            const req = new Request('http://localhost:3000/api/coach/templates', {
                method: 'POST',
                body: JSON.stringify(mockTemplate),
            })

            const response = await POST(req)
            const json = await response.json()

            expect(response.status).toBe(201)
            expect(json.data.id).toBe('temp-123')
            expect(templateInsertMock.insert).toHaveBeenCalledWith({
                coach_id: mockUser.id,
                name: mockTemplate.name,
                time_tier: mockTemplate.time_tier,
                coach_note: mockTemplate.coach_note || null
            })
            expect(stepsInsertMock.insert).toHaveBeenCalledWith([
                { template_id: 'temp-123', technique_id: 'eb79e94c-af6d-4952-bc66-3d37a8b6e22e', step_order: 0 }
            ])
        })
    })
})
