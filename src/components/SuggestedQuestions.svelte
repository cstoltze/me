<script lang="ts">
    import { Sparkles } from "lucide-svelte";
    import { fade } from "svelte/transition";

    let {
        questions,
        onSelect,
    }: {
        questions: string[];
        onSelect: (q: string) => void;
    } = $props();
</script>

<div
    class="h-full flex flex-col items-center justify-center text-center px-4"
    in:fade
>
    <div
        class="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center mb-8 border border-brand-500/20"
    >
        <Sparkles class="w-10 h-10 text-brand-400" />
    </div>
    <h1
        class="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-white"
    >
        Digital Advocate
    </h1>
    <p class="text-xl text-white/40 max-w-lg mb-12 leading-relaxed font-light">
        Ask anything about engineering philosophy, systems design, or technical
        expertise.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {#each questions as q}
            <button
                class="text-left p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-400/30 rounded-2xl transition-all duration-300 group active:scale-[0.98]"
                onclick={() => onSelect(q)}
            >
                <span
                    class="text-sm font-semibold text-white/70 group-hover:text-white"
                    >{q}</span
                >
            </button>
        {/each}
    </div>
</div>
