<script lang="ts">
  import Bot from "lucide-svelte/icons/bot";
  import { fade } from "svelte/transition";
</script>

<div class="flex justify-start" in:fade>
  <div class="flex gap-4 items-center">
    <div
      class="w-8 h-8 rounded-lg bg-brand-400 flex items-center justify-center border border-brand-400/20"
    >
      <Bot class="w-4 h-4 text-slate-950" />
    </div>
    <div
      class="flex space-x-1.5 bg-slate-900/40 border border-white/5 px-6 py-4 rounded-xl"
    >
      <div
        class="w-1 h-1 bg-brand-400/40 rounded-full animate-bounce [animation-delay:-0.3s]"
      ></div>
      <div
        class="w-1 h-1 bg-brand-400/40 rounded-full animate-bounce [animation-delay:-0.15s]"
      ></div>
      <div class="w-1 h-1 bg-brand-400/40 rounded-full animate-bounce"></div>
    </div>
  </div>
</div>
