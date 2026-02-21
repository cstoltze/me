<script lang="ts">
  import { Chat } from "@ai-sdk/svelte";
  import ChatMessage from "./ChatMessage.svelte";
  import SuggestedQuestions from "./SuggestedQuestions.svelte";
  import ChatInput from "./ChatInput.svelte";
  import TypingIndicator from "./TypingIndicator.svelte";

  const chat = new Chat({});

  let input = $state("");

  const suggestedQuestions = [
    "What is Coleman's philosophy on software?",
    "Tell me about a complex system he designed.",
    "How does he leverage AI in engineering?",
    "What is his experience with Go and GraphQL?",
  ];

  function ask(q: string) {
    input = q;
    handleFormSubmit();
  }

  function handleFormSubmit(e?: Event) {
    if (e) e.preventDefault();
    if (!input || chat.status === "streaming") return;

    console.log("Submitting message:", input);
    chat.sendMessage({ text: input });
    input = "";
  }

  let scrollContainer: HTMLDivElement;

  $effect(() => {
    console.log("Messages updated:", chat.messages);
    if (chat.messages.length > 0 && scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  });
</script>

<div
  class="max-w-4xl mx-auto w-full flex flex-col h-[75dvh] bg-transparent overflow-hidden"
>
  <!-- Messages Area -->
  <div
    bind:this={scrollContainer}
    class="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth"
  >
    {#if chat.messages.length === 0}
      <SuggestedQuestions questions={suggestedQuestions} onSelect={ask} />
    {/if}

    {#each chat.messages as m}
      <ChatMessage message={m} />
    {/each}

    {#if chat.status === "streaming"}
      <TypingIndicator />
    {/if}
  </div>

  <!-- Input Area -->
  <ChatInput
    bind:value={input}
    status={chat.status}
    onSubmit={handleFormSubmit}
  />
</div>

<style>
  /* Custom scrollbar for a cleaner look */
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
