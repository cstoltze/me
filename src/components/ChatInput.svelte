<script lang="ts">
    import { Send } from "lucide-svelte";

    let {
        value = $bindable(),
        status,
        onSubmit,
    }: {
        value: string;
        status: string;
        onSubmit: (e?: Event) => void;
    } = $props();

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    }
</script>

<div class="p-6 bg-white/5 border-t border-white/10">
    <form
        onsubmit={onSubmit}
        class="relative flex items-end gap-3 bg-white/5 border border-white/10 rounded-[1.25rem] p-3 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-400/10 transition-all duration-300"
    >
        <textarea
            bind:value
            rows="1"
            class="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-white/30 py-2 px-3 resize-none max-h-32 overflow-y-auto text-sm"
            placeholder="Ask Coleman's Digital Advocate..."
            onkeydown={handleKeydown}
        ></textarea>

        <button
            type="submit"
            disabled={!value || status === "streaming"}
            class="p-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-400 disabled:bg-white/5 disabled:text-white/20 transition-all duration-300 flex items-center justify-center shadow-lg shadow-brand-500/20 active:scale-95"
        >
            <Send class="w-5 h-5" />
        </button>
    </form>
    <div
        class="mt-3 text-[10px] text-center text-white/20 font-bold uppercase tracking-[0.2em]"
    >
        Press Enter to send &bull; Shift + Enter for new line
    </div>
</div>
