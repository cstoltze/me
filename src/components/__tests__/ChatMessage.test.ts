import { screen } from '@testing-library/svelte';
import { render } from '@testing-library/svelte-core';
import { describe, it, expect, vi } from 'vitest';
import ChatMessage from '../ChatMessage.svelte';

// Mock Markdown component
vi.mock('../Markdown.svelte', async () => {
    const MockMarkdown = await import('./MockMarkdown.svelte');
    return { default: MockMarkdown.default };
});

describe('ChatMessage', () => {
    it('renders user message correctly', () => {
        const message = { id: '1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] } as any;
        render(ChatMessage, { message });

        expect(screen.getByText('Hello')).toBeInTheDocument();
        // The outer container is two levels up from the text in the bubble
        const bubble = screen.getByText('Hello').closest('.rounded-2xl');
        const outerContainer = bubble?.parentElement?.parentElement?.parentElement;
        expect(outerContainer).toHaveClass('justify-end');
    });

    it('renders assistant message correctly', () => {
        const message = { id: '2', role: 'assistant', parts: [{ type: 'text', text: 'Hi there' }] } as any;
        render(ChatMessage, { message });

        expect(screen.getByText('Hi there')).toBeInTheDocument();
        const bubble = screen.getByText('Hi there').closest('.rounded-2xl');
        const outerContainer = bubble?.parentElement?.parentElement?.parentElement;
        expect(outerContainer).toHaveClass('justify-start');
    });

    it('renders message parts if present', () => {
        const message = {
            id: '3',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Part 1' }, { type: 'text', text: 'Part 2' }]
        } as any;
        render(ChatMessage, { message });

        expect(screen.getByText('Part 1')).toBeInTheDocument();
        expect(screen.getByText('Part 2')).toBeInTheDocument();
    });
});
