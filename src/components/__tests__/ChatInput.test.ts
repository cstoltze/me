import { fireEvent, screen } from '@testing-library/svelte';
import { render } from '@testing-library/svelte-core';
import { describe, it, expect, vi } from 'vitest';
import ChatInput from '../ChatInput.svelte';

describe('ChatInput', () => {
    it('renders correctly', async () => {
        render(ChatInput, { value: '', status: 'ready', onSubmit: () => { } });
        expect(await screen.findByPlaceholderText(`Ask Coleman's Digital Advocate...`)).toBeInTheDocument();
    });

    it('updates value on input', async () => {
        render(ChatInput, { value: '', status: 'ready', onSubmit: () => { } });
        const textarea = await screen.findByPlaceholderText(`Ask Coleman's Digital Advocate...`);

        await fireEvent.input(textarea, { target: { value: 'Hello' } });
        // In Svelte 5, $bindable() might need special handling in tests depending on how it's rendered
        // But standard fireEvent should work for the DOM state.
        expect(textarea).toHaveValue('Hello');
    });

    it('calls onSubmit when button is clicked', async () => {
        const onSubmit = vi.fn();
        render(ChatInput, { value: 'Hello', status: 'ready', onSubmit });

        const button = screen.getByRole('button');
        await fireEvent.click(button);

        expect(onSubmit).toHaveBeenCalled();
    });

    it('disables button when value is empty', () => {
        render(ChatInput, { value: '', status: 'ready', onSubmit: () => { } });
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('disables button when status is streaming', () => {
        render(ChatInput, { value: 'Hello', status: 'streaming', onSubmit: () => { } });
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('calls onSubmit on Enter keydown', async () => {
        const onSubmit = vi.fn();
        render(ChatInput, { props: { value: 'Hello', status: 'ready', onSubmit } });

        const textarea = screen.getByPlaceholderText(`Ask Coleman's Digital Advocate...`);
        await fireEvent.keyDown(textarea, { key: 'Enter' });

        expect(onSubmit).toHaveBeenCalled();
    });

    it('does not call onSubmit on Shift+Enter keydown', async () => {
        const onSubmit = vi.fn();
        render(ChatInput, { props: { value: 'Hello', status: 'ready', onSubmit } });

        const textarea = screen.getByPlaceholderText(`Ask Coleman's Digital Advocate...`);
        await fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

        expect(onSubmit).not.toHaveBeenCalled();
    });
});
