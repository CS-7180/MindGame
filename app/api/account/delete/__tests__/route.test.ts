import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DELETE } from '../route'
import { createClient } from '@/lib/supabase/server'

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}))

describe('Account Delete API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('DELETE /api/account/delete', () => {
        it('should return 401 if user is not authenticated', async () => {
            ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) }
            })

            const response = await DELETE()
            expect(response.status).toBe(401)
        })

        it('should call delete_user_data RPC and sign out on success', async () => {
            const mockSignOut = vi.fn().mockResolvedValue({ error: null })
            const mockRpc = vi.fn().mockResolvedValue({ error: null })

                ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                    auth: {
                        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null }),
                        signOut: mockSignOut,
                    },
                    rpc: mockRpc,
                })

            const response = await DELETE()
            expect(response.status).toBe(200)

            // Verify RPC was called
            expect(mockRpc).toHaveBeenCalledWith('delete_user_data')

            // Verify user was signed out
            expect(mockSignOut).toHaveBeenCalled()

            const json = await response.json()
            expect(json.data.message).toContain('deleted successfully')
        })

        it('should return 500 if RPC fails', async () => {
            const mockRpc = vi.fn().mockResolvedValue({ error: { message: 'RPC failed' } })

                ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                    auth: {
                        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null }),
                    },
                    rpc: mockRpc,
                })

            const response = await DELETE()
            expect(response.status).toBe(500)

            const json = await response.json()
            expect(json.error.code).toBe('DB_ERROR')
        })
    })
})
