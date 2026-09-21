<script lang="ts">
  import Send from "lucide-svelte/icons/send";

  let {
    value = $bindable(),
    busy = false,
    onSubmit,
  }: {
    value: string;
    /** True while a reply is pending, so we don't queue a second request. */
    busy?: boolean;
    onSubmit: (event?: Event) => void;
  } = $props();

  const canSend = $derived(value.trim().length > 0 && !busy);

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }
</script>

<div class="p-8 bg-white/[0.01] border-t border-white/5">
  <form
    onsubmit={onSubmit}
    class="relative flex items-end gap-4 bg-white/[0.02] border border-white/10 rounded-2xl p-4 focus-within:border-brand-400/40 focus-within:ring-4 focus-within:ring-brand-400/10 transition-all duration-500"
  >
    <label class="sr-only" for="chat-input">Ask about Coleman's work</label>
    <textarea
      id="chat-input"
      bind:value
      rows="1"
      class="flex-1 bg-transparent border-none focus:ring-0 text-white/90 placeholder-white/20 py-1.5 px-2 resize-none max-h-32 overflow-y-auto text-[14px]"
      placeholder="Ask about my work…"
      onkeydown={handleKeydown}></textarea>

    <button
      type="submit"
      disabled={!canSend}
      aria-label="Send message"
      class="p-2.5 bg-brand-400 text-slate-950 rounded-lg hover:bg-brand-300 disabled:bg-white/5 disabled:text-white/10 transition-all duration-300 flex items-center justify-center shadow-lg shadow-brand-400/10 active:scale-95"
    >
      <Send class="w-4 h-4" />
    </button>
  </form>
  <div
    class="mt-4 text-[9px] text-center text-white/20 font-black uppercase tracking-[0.3em]"
  >
    Shift + Enter for a new line
  </div>
</div>
