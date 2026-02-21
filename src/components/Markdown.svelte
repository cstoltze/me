<script lang="ts">
    import { marked } from "marked";
    import { getHighlighter } from "../lib/highlighter";
    import { onMount } from "svelte";
    import type { UIMessage } from "@ai-sdk/svelte";

    let {
        content,
        role,
    }: {
        content: string;
        role: UIMessage["role"];
    } = $props();
    let highlighter: any = $state(null);
    let renderedContent = $state("");

    onMount(async () => {
        highlighter = await getHighlighter();
    });

    $effect(() => {
        if (!content) {
            renderedContent = "";
            return;
        }

        const parseContent = async () => {
            const renderer = new marked.Renderer();

            renderer.code = ({ text, lang }) => {
                if (highlighter && lang) {
                    try {
                        return highlighter.codeToHtml(text, {
                            lang,
                            theme:
                                role === "user"
                                    ? "github-dark"
                                    : "github-light",
                        });
                    } catch (e) {
                        console.warn(
                            "Shiki highlighting failed for lang:",
                            lang,
                            e,
                        );
                    }
                }
                return `<pre><code class="language-${lang || "none"}">${text}</code></pre>`;
            };

            const html = await marked.parse(content || "", {
                renderer,
                async: true,
            });
            renderedContent = html;
        };

        parseContent();
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
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
    }

    /* Inline code styling */
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

    /* Headers in user messages should be even more compact */
    :global(.prose-invert h1),
    :global(.prose-invert h2),
    :global(.prose-invert h3) {
        margin-top: 1rem;
        margin-bottom: 0.5rem;
    }
</style>
