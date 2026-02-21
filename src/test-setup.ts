import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch for API tests
import createFetchMock from 'vitest-fetch-mock';
const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

// Mock Element.prototype.animate for Svelte transitions
if (typeof Element !== 'undefined') {
    Element.prototype.animate = vi.fn().mockReturnValue({
        finished: Promise.resolve(),
        cancel: vi.fn(),
        pause: vi.fn(),
        play: vi.fn(),
        reverse: vi.fn(),
        finish: vi.fn(),
    });
}
