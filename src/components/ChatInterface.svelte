<script lang="ts">
  import { Chat } from "@ai-sdk/svelte";
  import ChatMessage from "./ChatMessage.svelte";
  import SuggestedQuestions from "./SuggestedQuestions.svelte";
  import ChatInput from "./ChatInput.svelte";
  import TypingIndicator from "./TypingIndicator.svelte";

  // Defaults to POSTing at /api/chat -- see src/pages/api/chat.ts.
  const chat = new Chat({});

  let input = $state("");
  let scrollContainer = $state<HTMLDivElement>();

  const suggestedQuestions = [
    "What does Coleman actually do day to day?",
    "Tell me about a hard system he designed.",
    "How does he use AI in his own work?",
    "What's his experience with Go and GraphQL?",
  ];

  // 'submitted' means the request is away but no tokens have arrived yet. Both it
  // and 'streaming' should block another send and keep the indicator up.
  const isBusy = $derived(
    chat.status === "submitted" || chat.status === "streaming",
  );

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    chat.sendMessage({ text: trimmed });
    input = "";
  }

  function handleFormSubmit(event?: Event) {
    event?.preventDefault();
    send(input);
  }

  $effect(() => {
    // Touch the length so this re-runs as messages stream in.
    void chat.messages.length;
    scrollContainer?.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: "smooth",
    });
  });
</script>

<div
  class="max-w-4xl mx-auto w-full flex flex-col h-[80dvh] bg-transparent overflow-hidden"
>
  <!-- Messages Area -->
  <div
    bind:this={scrollContainer}
    class="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth"
  >
    {#if chat.messages.length === 0}
      <SuggestedQuestions questions={suggestedQuestions} onSelect={send} />
    {/if}

    {#each chat.messages as message (message.id)}
      <ChatMessage {message} />
    {/each}

    {#if isBusy}
      <TypingIndicator />
    {/if}

    {#if chat.error}
      <div
        role="alert"
        class="mx-auto max-w-md rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-center"
      >
        <p class="text-sm text-red-200/80">
          That request didn't go through. Try again in a moment.
        </p>
      </div>
    {/if}
  </div>

  <!-- Input Area -->
  <ChatInput bind:value={input} busy={isBusy} onSubmit={handleFormSubmit} />
</div>

<style>
  /* Match the page scrollbar rather than the platform default. */
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }
  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
  }
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
</style>
