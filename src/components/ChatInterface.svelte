<script lang="ts">
  import { Chat } from "@ai-sdk/svelte";
  import { fade, fly } from "svelte/transition";
  import { Send, User, Bot, Sparkles, CornerDownLeft } from "lucide-svelte";
  import Markdown from "./Markdown.svelte";

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
  class="max-w-4xl mx-auto w-full flex flex-col h-[85dvh] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
>
  <!-- Messages Area -->
  <div
    bind:this={scrollContainer}
    class="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
  >
    {#if chat.messages.length === 0}
      <div
        class="h-full flex flex-col items-center justify-center text-center px-4"
        in:fade
      >
        <div
          class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6"
        >
          <Sparkles class="w-8 h-8 text-blue-600" />
        </div>
        <h1
          class="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900"
        >
          Coleman's Digital Advocate
        </h1>
        <p class="text-lg text-gray-500 max-w-md mb-10 leading-relaxed">
          Ask me anything about Coleman's experience, engineering philosophy, or
          technical expertise.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
          {#each suggestedQuestions as q}
            <button
              class="text-left p-4 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl transition-all duration-200 group active:scale-[0.98]"
              onclick={() => ask(q)}
            >
              <span
                class="text-sm font-medium text-gray-700 group-hover:text-blue-700"
                >{q}</span
              >
            </button>
          {/each}
        </div>
      </div>
    {/if}

    {#each chat.messages as m}
      <div
        class="flex {m.role === 'user' ? 'justify-end' : 'justify-start'}"
        in:fly={{ y: 10, duration: 300 }}
      >
        <div
          class="flex gap-3 max-w-[85%] {m.role === 'user'
            ? 'flex-row-reverse'
            : 'flex-row'}"
        >
          <!-- Avatar -->
          <div
            class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center {m.role ===
            'user'
              ? 'bg-gray-100'
              : 'bg-blue-600'}"
          >
            {#if m.role === "user"}
              <User class="w-4 h-4 text-gray-600" />
            {:else}
              <Bot class="w-4 h-4 text-white" />
            {/if}
          </div>

          <!-- Bubble -->
          <div
            class="flex flex-col {m.role === 'user'
              ? 'items-end'
              : 'items-start'}"
          >
            <div
              class="px-4 py-3 rounded-2xl text-[16px] leading-relaxed shadow-sm
              {m.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none'}"
            >
              <div class="">
                {#if m.parts && m.parts.length > 0}
                  {#each m.parts as part}
                    {#if part.type === "text"}
                      <Markdown content={part.text} role={m.role} />
                    {/if}
                  {/each}
                {:else}
                  <Markdown content={m.content} role={m.role} />
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
    {/each}

    {#if chat.status === "streaming"}
      <div class="flex justify-start" in:fade>
        <div class="flex gap-3 items-center">
          <div
            class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center"
          >
            <Bot class="w-4 h-4 text-white" />
          </div>
          <div
            class="flex space-x-1 bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none"
          >
            <div
              class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"
            ></div>
            <div
              class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"
            ></div>
            <div
              class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            ></div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Input Area -->
  <div class="p-4 md:p-6 bg-white border-t border-gray-100">
    <form
      onsubmit={handleFormSubmit}
      class="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all duration-200"
    >
      <textarea
        bind:value={input}
        rows="1"
        class="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 py-2 px-3 resize-none max-h-32 overflow-y-auto"
        placeholder="Ask me anything..."
        onkeydown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleFormSubmit();
          }
        }}
      ></textarea>

      <button
        type="submit"
        disabled={!input || chat.status === "streaming"}
        class="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all duration-200 flex items-center justify-center"
      >
        <Send class="w-5 h-5" />
      </button>
    </form>
    <div
      class="mt-2 text-[10px] text-center text-gray-400 font-medium uppercase tracking-wider"
    >
      Press Enter to send, Shift + Enter for new line
    </div>
  </div>
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
    background: #e5e7eb;
    border-radius: 10px;
  }
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
  }
</style>
