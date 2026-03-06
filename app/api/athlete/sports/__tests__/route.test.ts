import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, DELETE } from '../route';
import { createClient } from '@/lib/supabase/server';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}));

const mockUser = { id: 'test-user-id' };

describe('Athlete Sports API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const setupMockSupabase = (fetchData: any = { sports: [] }, fetchError = null, updateError = null) => {
        const mockEqUpdate = vi.fn().mockResolvedValue({ error: updateError });
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

        const mockSingle = vi.fn().mockResolvedValue({ data: fetchData, error: fetchError });
        const mockEqSelect = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSelect });

        const mockFrom = vi.fn((table: string) => {
            if (table === 'athlete_profiles') {
                return {
                    select: mockSelect,
                    update: mockUpdate
                };
            }
        });

        ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) },
            from: mockFrom
        });

        return { mockEqUpdate, mockSingle };
    };

    describe('POST /api/athlete/sports', () => {
        it('should return 401 if user is not authenticated', async () => {
            ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) }
            });

            const request = new Request('http://localhost/api/athlete/sports', {
                method: 'POST',
                body: JSON.stringify({ sport: 'Basketball' })
            });
            const response = await POST(request);
            expect(response.status).toBe(401);
        });

        it('should return 400 if sport is missing in request', async () => {
            setupMockSupabase();

            const request = new Request('http://localhost/api/athlete/sports', {
                method: 'POST',
                body: JSON.stringify({})
            });
            const response = await POST(request);
            expect(response.status).toBe(400);
        });

        it('should add sport and return 200 on success', async () => {
            const { mockEqUpdate } = setupMockSupabase({ sports: ['Soccer'] });

            const request = new Request('http://localhost/api/athlete/sports', {
                method: 'POST',
                body: JSON.stringify({ sport: 'Basketball' })
            });
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.data.sports).toEqual(['Soccer', 'Basketball']);
            // The update mock eq should be called with user.id
            expect(mockEqUpdate).toHaveBeenCalledWith('athlete_id', mockUser.id);
        });

        it('should return 500 if update fails', async () => {
            setupMockSupabase({ sports: ['Soccer'] }, null, { message: 'DB Error' });

            const request = new Request('http://localhost/api/athlete/sports', {
                method: 'POST',
                body: JSON.stringify({ sport: 'Basketball' })
            });
            const response = await POST(request);
            expect(response.status).toBe(500);
        });
    });

    describe('DELETE /api/athlete/sports', () => {
        it('should return 401 if user is not authenticated', async () => {
            ; (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) }
            });

            const request = new Request('http://localhost/api/athlete/sports', {
                method: 'DELETE',
                body: JSON.stringify({ sport: 'Basketball' })
            });
            const response = await DELETE(request);
            expect(response.status).toBe(401);
        });

        it('should remove sport and return 200 on success', async () => {
            const { mockEqUpdate } = setupMockSupabase({ sports: ['Soccer', 'Basketball'] });

            const request = new Request('http://localhost/api/athlete/sports', {
                method: 'DELETE',
                body: JSON.stringify({ sport: 'Basketball' })
            });
            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.data.sports).toEqual(['Soccer']);
            expect(mockEqUpdate).toHaveBeenCalledWith('athlete_id', mockUser.id);
        });
    });
});
