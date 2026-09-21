<script lang="ts">
  import Sparkles from "lucide-svelte/icons/sparkles";
  import { fade } from "svelte/transition";

  let {
    questions,
    onSelect,
    ready = true,
  }: {
    questions: string[];
    onSelect: (question: string) => void;
    /** False until the island has hydrated; see ChatInterface. */
    ready?: boolean;
  } = $props();
</script>

<div
  class="h-full flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto"
  in:fade
>
  <div
    class="mb-10 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-brand-400/5 border border-brand-400/10"
  >
    <Sparkles class="w-4 h-4 text-brand-400" />
    <span
      class="text-[9px] font-black uppercase tracking-[0.3em] text-brand-400"
      >Digital Advocate</span
    >
  </div>

  <h2
    class="text-4xl md:text-5xl font-black tracking-tighter mb-6 text-white leading-tight"
  >
    Ask about<br /><span class="text-white/20 font-light">my work</span>
  </h2>
  <p
    class="text-base md:text-lg text-white/50 mb-12 leading-relaxed font-light max-w-xl"
  >
    This agent has read my resume, project history, and notes on how I work. Ask
    it something specific — it will tell you when it doesn't know.
  </p>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
    {#each questions as question (question)}
      <button
        data-testid="suggested-question"
        disabled={!ready}
        class="text-left p-5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-brand-400/30 transition-all duration-300 group active:scale-[0.98] rounded-xl shadow-lg"
        onclick={() => onSelect(question)}
      >
        <div class="flex items-start gap-4">
          <div
            class="w-2 h-2 rounded-full bg-brand-400/20 group-hover:bg-brand-400 mt-1.5 transition-colors"
          ></div>
          <span
            class="text-sm font-bold text-white/60 group-hover:text-white transition-colors"
            >{question}</span
          >
        </div>
      </button>
    {/each}
  </div>
</div>
