<script lang="ts">
  import { Chat } from '@ai-sdk/svelte';
  import { fade, fly } from 'svelte/transition';

  const chat = new Chat({
    api: '/api/chat',
  });

  const suggestedQuestions = [
    "What is Coleman's philosophy on software?",
    "Tell me about a complex system he designed.",
    "How does he leverage AI in engineering?",
    "What is his experience with Go and GraphQL?"
  ];

  function ask(q: string) {
    chat.input = q;
  }
</script>

<div class="max-w-3xl mx-auto w-full flex flex-col min-h-[80dvh] justify-between">
  
  <!-- Messages Area -->
  <div class="flex-1 overflow-y-auto space-y-8 pr-4 scrollbar-hide">
    {#if chat.messages.length === 0}
      <div class="mt-20" in:fade>
        <h1 class="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-[0.9]">
          SYSTEMS<br>THINKER.
        </h1>
        <p class="text-xl text-gray-500 max-w-md mb-12 leading-relaxed">
          I am Coleman's Digital Advocate. I can tell you about his experience, his philosophy, and why he prefers deleting code over writing it.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each suggestedQuestions as q, i}
            <button 
              class="text-left p-4 md:p-6 border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all duration-300 group active:scale-[0.98]"
              onclick={() => ask(q)}
            >
              <span class="block text-xs font-bold text-gray-400 mb-2 group-hover:text-blue-600">0{i + 1}</span>
              <span class="text-base md:text-lg font-medium">{q}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    {#each chat.messages as m}
      <div class="flex flex-col items-start {m.role === 'user' ? 'items-end' : ''}" in:fly={{ y: 20, duration: 300 }}>
        <div class="max-w-[90%]">
          <span class="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-widest">
            {m.role === 'user' ? 'You' : 'Digital Advocate'}
          </span>
          <div class="text-lg leading-relaxed whitespace-pre-wrap {m.role === 'user' ? 'text-gray-900' : 'text-blue-900'}">
            {m.content}
          </div>
        </div>
      </div>
    {/each}
    
    {#if chat.isLoading}
      <div class="flex items-center space-x-2 text-blue-600" in:fade>
        <div class="w-2 h-2 bg-current rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-current rounded-full animate-bounce delay-100"></div>
        <div class="w-2 h-2 bg-current rounded-full animate-bounce delay-200"></div>
      </div>
    {/if}
  </div>

  <!-- Input Area -->
  <form onsubmit={(e) => { e.preventDefault(); chat.handleSubmit(e); }} class="mt-8 relative group">
    <input
      bind:value={chat.input}
      class="w-full bg-transparent text-xl md:text-4xl font-bold placeholder-gray-200 border-b-4 border-gray-200 focus:border-blue-600 outline-none py-4 pr-24 transition-colors duration-300"
      placeholder="Ask me anything..."
    />
    <button 
      type="submit"
      class="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 md:px-6 py-2 font-bold text-xs md:text-sm uppercase tracking-widest hover:bg-blue-700 transition-all duration-300 {(chat.input || '').length > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}"
    >
      Send
    </button>
  </form>

</div>
