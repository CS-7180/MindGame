import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DELETE } from '../route'
import { createClient } from '@/lib/supabase/server'

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}))

describe('Delete Entry API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('DELETE /api/account/delete-entry', () => {
        it('should return 401 if user is not authenticated', async () => {
            ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) }
            })

            const request = new Request('http://localhost/api/account/delete-entry', {
                method: 'DELETE',
                body: JSON.stringify({ entry_id: '550e8400-e29b-41d4-a716-446655440000' })
            })

            const response = await DELETE(request)
            expect(response.status).toBe(401)
        })

        it('should return 400 if entry_id is not a valid UUID', async () => {
            ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null }) }
            })

            const request = new Request('http://localhost/api/account/delete-entry', {
                method: 'DELETE',
                body: JSON.stringify({ entry_id: 'not-a-uuid' })
            })

            const response = await DELETE(request)
            expect(response.status).toBe(400)

            const json = await response.json()
            expect(json.error.code).toBe('VALIDATION_ERROR')
        })

        it('should call delete_game_log_entry RPC with valid entry_id', async () => {
            const entryId = '550e8400-e29b-41d4-a716-446655440000'
            const mockRpc = vi.fn().mockResolvedValue({ error: null })

                ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null }) },
                    rpc: mockRpc,
                })

            const request = new Request('http://localhost/api/account/delete-entry', {
                method: 'DELETE',
                body: JSON.stringify({ entry_id: entryId })
            })

            const response = await DELETE(request)
            expect(response.status).toBe(200)

            expect(mockRpc).toHaveBeenCalledWith('delete_game_log_entry', { entry_id: entryId })
        })

        it('should return 404 if entry does not belong to user', async () => {
            const mockRpc = vi.fn().mockResolvedValue({ error: { message: 'Entry not found or access denied' } })

                ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null }) },
                    rpc: mockRpc,
                })

            const request = new Request('http://localhost/api/account/delete-entry', {
                method: 'DELETE',
                body: JSON.stringify({ entry_id: '550e8400-e29b-41d4-a716-446655440000' })
            })

            const response = await DELETE(request)
            expect(response.status).toBe(404)
        })
    })
})
