import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../chat';

// Mock astro:content
vi.mock('astro:content', () => ({
    getCollection: vi.fn().mockResolvedValue([])
}));

// Mock AI SDK
vi.mock('ai', () => ({
    streamText: vi.fn().mockReturnValue({
        toUIMessageStreamResponse: vi.fn().mockReturnValue(new Response('stream data'))
    }),
    convertToModelMessages: vi.fn().mockReturnValue([])
}));

vi.mock('@ai-sdk/google', () => ({
    createGoogleGenerativeAI: vi.fn().mockReturnValue(vi.fn())
}));

describe('Chat API', () => {
    it('returns a stream response', async () => {
        const request = new Request('http://localhost/api/chat', {
            method: 'POST',
            body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
        });

        const response = await POST({ request } as any);

        expect(response).toBeInstanceOf(Response);
        const text = await response.text();
        expect(text).toBe('stream data');
    });
});
