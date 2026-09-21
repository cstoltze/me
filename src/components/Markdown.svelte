<script lang="ts">
  import { Marked } from "marked";
  import { getHighlighter } from "../lib/highlighter";
  import type { UIMessage } from "@ai-sdk/svelte";

  let {
    content,
    role,
  }: {
    content: string;
    role: UIMessage["role"];
  } = $props();

  let renderedContent = $state("");

  function escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Renders markdown to HTML for `{@html}`.
   *
   * This content comes from a language model, so it is not trusted. `marked`
   * passes raw HTML through by default, which would let a prompt-injected reply
   * inject script into the page. Overriding the `html` renderer escapes any raw
   * HTML instead, so model output can only ever produce markdown-derived markup.
   */
  async function render(markdown: string): Promise<string> {
    const marked = new Marked({ async: true, gfm: true });
    const highlighter = await getHighlighter();
    const loaded = new Set(highlighter.getLoadedLanguages());

    marked.use({
      renderer: {
        // Drop raw HTML: escape it so it renders as visible text.
        html({ text }) {
          return escapeHtml(text);
        },
        code({ text, lang }) {
          const language = lang?.trim().toLowerCase();
          if (language && loaded.has(language)) {
            return highlighter.codeToHtml(text, {
              lang: language,
              theme: "github-dark",
            });
          }
          return `<pre><code>${escapeHtml(text)}</code></pre>`;
        },
      },
    });

    return marked.parse(markdown);
  }

  $effect(() => {
    if (!content) {
      renderedContent = "";
      return;
    }

    let cancelled = false;
    render(content)
      .then((html) => {
        if (!cancelled) renderedContent = html;
      })
      .catch((error) => {
        console.error("Failed to render markdown", error);
        // Fall back to plain text rather than showing nothing.
        if (!cancelled) renderedContent = `<p>${escapeHtml(content)}</p>`;
      });

    // Streaming re-runs this effect on every chunk; ignore stale renders so a
    // slow one cannot overwrite a newer one.
    return () => {
      cancelled = true;
    };
  });
</script>

<div
  class="prose prose-sm md:prose-base max-w-none
  {role === 'user' ? 'prose-invert prose-slate' : 'prose-slate'}
  prose-p:leading-relaxed
  prose-headings:font-bold prose-headings:tracking-tight
  prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
  prose-pre:p-0 prose-pre:bg-transparent
  prose-code:text-inherit prose-code:bg-transparent prose-code:px-0 prose-code:py-0 prose-code:before:content-none prose-code:after:content-none"
>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- escaped in render() above -->
  {@html renderedContent}
</div>

<style>
  :global(.prose pre) {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    border-radius: 0.75rem;
    overflow-x: auto;
    border: 1px solid rgba(0, 0, 0, 0.05);
    background-color: rgba(0, 0, 0, 0.02);
  }

  :global(.prose-invert pre) {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(255, 255, 255, 0.05);
  }

  :global(.prose pre.shiki) {
    padding: 1rem !important;
    background-color: transparent !important;
    margin: 0 !important;
  }

  :global(.prose code) {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
  }

  /* Inline code */
  :global(.prose :not(pre) > code) {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 0.375rem;
    font-size: 0.9em;
  }

  :global(.prose-invert :not(pre) > code) {
    background-color: rgba(255, 255, 255, 0.1);
  }

  :global(.prose p:first-child) {
    margin-top: 0;
  }
  :global(.prose p:last-child) {
    margin-bottom: 0;
  }

  /* Headings in user messages are more compact. */
  :global(.prose-invert h1),
  :global(.prose-invert h2),
  :global(.prose-invert h3) {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
</style>
