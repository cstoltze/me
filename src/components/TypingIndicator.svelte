<script lang="ts">
    import { Bot } from "lucide-svelte";
    import { fade } from "svelte/transition";
</script>

<div class="flex justify-start" in:fade>
    <div class="flex gap-3 items-center">
        <div
            class="w-8 h-8 rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20 flex items-center justify-center"
        >
            <Bot class="w-4 h-4 text-white" />
        </div>
        <div
            class="flex space-x-1.5 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl rounded-tl-none backdrop-blur-sm"
        >
            <div
                class="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"
            ></div>
            <div
                class="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"
            ></div>
            <div
                class="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"
            ></div>
        </div>
    </div>
</div>
