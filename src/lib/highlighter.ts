import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

export async function getHighlighter() {
    if (highlighterPromise) return highlighterPromise;

    highlighterPromise = createHighlighter({
        themes: ["github-light", "github-dark"],
        langs: [
            "javascript",
            "typescript",
            "python",
            "go",
            "html",
            "css",
            "json",
            "markdown",
            "bash",
            "sh",
        ],
    });

    return highlighterPromise;
}
