import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

/**
 * Syntax highlighting for code blocks in the agent's replies.
 *
 * Deliberately uses Shiki's *fine-grained* bundle. Importing `createHighlighter`
 * from the `shiki` root pulls in every grammar Shiki ships -- that produced ~10MB
 * of lazily-loaded chunks and would not fit a Worker. Listing languages
 * explicitly keeps the bundle to what we actually need.
 *
 * `createJavaScriptRegexEngine` avoids the Oniguruma WASM binary, which is both
 * large and awkward in a Worker. It covers the grammars below.
 *
 * To support another language, add its `shiki/langs/<name>.mjs` import here.
 */
let highlighterPromise: Promise<HighlighterCore> | null = null;

export function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
    themes: [import("shiki/themes/github-dark.mjs")],
    langs: [
      import("shiki/langs/javascript.mjs"),
      import("shiki/langs/typescript.mjs"),
      import("shiki/langs/python.mjs"),
      import("shiki/langs/go.mjs"),
      import("shiki/langs/rust.mjs"),
      import("shiki/langs/sql.mjs"),
      import("shiki/langs/html.mjs"),
      import("shiki/langs/css.mjs"),
      import("shiki/langs/json.mjs"),
      import("shiki/langs/yaml.mjs"),
      import("shiki/langs/bash.mjs"),
    ],
    engine: createJavaScriptRegexEngine(),
  });

  return highlighterPromise;
}

/** Languages the highlighter above can render, for callers that want to check. */
export const SUPPORTED_LANGUAGES = [
  "javascript",
  "js",
  "typescript",
  "ts",
  "python",
  "py",
  "go",
  "rust",
  "rs",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
  "yml",
  "bash",
  "sh",
  "shell",
] as const;
