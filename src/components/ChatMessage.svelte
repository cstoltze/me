<script lang="ts">
    import { User, Bot } from "lucide-svelte";
    import { fly } from "svelte/transition";
    import type { UIMessage } from "@ai-sdk/svelte";
    import Markdown from "./Markdown.svelte";

    let { message }: { message: UIMessage } = $props();
</script>

<div
    class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}"
    in:fly={{ y: 10, duration: 300 }}
>
    <div
        class="flex gap-3 max-w-[85%] {message.role === 'user'
            ? 'flex-row-reverse'
            : 'flex-row'}"
    >
        <!-- Avatar -->
        <div
            class="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center {message.role ===
            'user'
                ? 'bg-white/10 border border-white/20'
                : 'bg-brand-500 shadow-lg shadow-brand-500/20'}"
        >
            {#if message.role === "user"}
                <User class="w-4 h-4 text-white/70" />
            {:else}
                <Bot class="w-4 h-4 text-white" />
            {/if}
        </div>

        <!-- Bubble -->
        <div
            class="flex flex-col {message.role === 'user'
                ? 'items-end'
                : 'items-start'}"
        >
            <div
                class="px-5 py-3 rounded-2xl text-[15px] leading-relaxed relative group transition-all
        {message.role === 'user'
                    ? 'bg-brand-500 text-white rounded-tr-none shadow-lg shadow-brand-500/10'
                    : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none backdrop-blur-sm'}"
            >
                <div>
                    {#each message.parts as part}
                        {#if part.type === "text"}
                            <Markdown content={part.text} role={message.role} />
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
