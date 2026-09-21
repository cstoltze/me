<script lang="ts">
  import User from "lucide-svelte/icons/user";
  import Bot from "lucide-svelte/icons/bot";
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
      class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border {message.role ===
      'user'
        ? 'bg-white/5 border-white/10'
        : 'bg-brand-400 border-brand-400/20'}"
    >
      {#if message.role === "user"}
        <User class="w-4 h-4 text-white/40" />
      {:else}
        <Bot class="w-4 h-4 text-slate-950" />
      {/if}
    </div>

    <!-- Bubble -->
    <div
      class="flex flex-col {message.role === 'user'
        ? 'items-end'
        : 'items-start'}"
    >
      <div
        class="px-6 py-4 rounded-xl text-[14px] leading-relaxed relative group transition-all
        {message.role === 'user'
          ? 'bg-white/[0.03] text-white/90 border border-white/10 shadow-lg shadow-black/20'
          : 'bg-slate-900/40 text-white/90 border border-white/5 shadow-xl shadow-black/40'}"
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
