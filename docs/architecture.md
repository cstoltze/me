# Architecture

## Shape of the thing

Almost all of this site is static. Exactly one route is not.

```
Browser
  │
  ├── /           prerendered HTML ──┐
  ├── /resume     prerendered HTML ──┤ served from Cloudflare's CDN
  ├── /_astro/*   JS, CSS ───────────┘
  │
  └── POST /api/chat ──► Worker ──► Gemini
                           │
                           └── system prompt built from src/content/ + profile.json
```

`astro.config.mjs` sets `output: 'static'`. `src/pages/api/chat.ts` opts out with
`export const prerender = false`, so it alone runs in the Worker. That keeps the
page load entirely CDN-served and the Worker invoked only when someone chats.

## Why Cloudflare Workers

The site was on GitHub Pages when it was a Hugo site. The chat endpoint needs a
server runtime and a secret, which Pages cannot provide. Workers gives a static
CDN plus a server route in one deploy, at no cost at this traffic level, and
keeps the existing domain. See [deployment.md](deployment.md).

## The agent

`src/lib/agent-context.ts` builds the system prompt. It reads all three content
collections plus `src/data/profile.json` and formats them into one block, which
is prepended to every request.

There is no retrieval step, no embedding, no database. The whole corpus fits in a
prompt, and at this size that is the better trade: nothing to provision, nothing
to keep in sync, and no chance of retrieving the wrong chunk. Adding knowledge is
adding a markdown file — see [content-authoring.md](content-authoring.md).

The prompt tells the model to answer only from the supplied context and to refer
people to the email address when it cannot. It also tells it to ignore
instructions embedded in visitor messages, since anything a visitor types reaches
the model.

### When to change the agent design

The prompt grows linearly with the content, and every request pays for all of it.
Past roughly 50 entries, move to retrieval — embed each entry, retrieve the few
relevant ones per question — rather than letting the prompt keep growing.
`buildContext()` is the only function that would change.

The model id is the `MODEL` constant in `src/pages/api/chat.ts`.

## Protecting the endpoint

`/api/chat` is public and spends money on each call, so it is bounded on four axes:

| Guard           | Where                                       | Value                |
| --------------- | ------------------------------------------- | -------------------- |
| Requests per IP | `CHAT_RATE_LIMIT` binding, `wrangler.jsonc` | 10 / minute          |
| Message length  | `LIMITS.maxCharsPerMessage`                 | 2,000 characters     |
| History length  | `LIMITS.maxMessages`                        | most recent 20 turns |
| Response length | `LIMITS.maxOutputTokens`                    | 1,024 tokens         |

Oversized messages are rejected; an over-long _history_ is truncated to the most
recent turns rather than rejected, since that is a normal thing for a long
conversation to do.

The rate limit binding does not exist in local dev, where `withinRateLimit`
returns true. Cost controls should also be set on the Google AI Studio key
itself — a code-level cap does not help if the key leaks.

## Secrets

`GOOGLE_GENERATIVE_AI_API_KEY` is read from `cloudflare:workers` at request time:

```ts
import { env } from "cloudflare:workers";
const apiKey = env.GOOGLE_GENERATIVE_AI_API_KEY;
```

**Never read a secret from `import.meta.env`.** Vite replaces `import.meta.env.X`
with a string literal at transform time, so the key ends up baked into the built
bundle. This repo did exactly that until it was caught by grepping `dist/` for
the key — worth re-running after changing anything in this area:

```sh
npm run build && grep -r "$(sed -n 's/^GOOGLE_GENERATIVE_AI_API_KEY=//p' .env)" dist/client
```

`locals.runtime.env` also does not work: the Cloudflare adapter removed it.

## Rendering model output

Chat replies are markdown from a language model, rendered with `{@html}`. Model
output is not trusted, so `src/components/Markdown.svelte` overrides `marked`'s
`html` renderer to escape raw HTML instead of passing it through. Without that, a
prompt-injected reply could inject script into the page.

Code blocks are highlighted with Shiki's **fine-grained** bundle
(`src/lib/highlighter.ts`) — importing `createHighlighter` from the `shiki` root
pulls in every grammar it ships, which produced about 10 MB of chunks. Languages
are listed explicitly, and the JavaScript regex engine avoids the Oniguruma WASM
binary. Adding a language means adding an import there.

## Types

Two generated files carry most of the type information, and both must stay in
`tsconfig.json`'s `include`:

- **`.astro/types.d.ts`** — content collection types, from `astro sync`
- **`worker-configuration.d.ts`** — the `cloudflare:workers` module and the `Env`
  bindings, from `npm run types` (which reads `wrangler.jsonc`)

`exclude` filters `include` in TypeScript, so listing either directory in
`exclude` silently degrades `getCollection()` and `env` to `any` with no error.
That was the state of this repo before; it is why `tsconfig.json` carries a
comment about it. `worker-configuration.d.ts` is generated, not committed — the
`check` script regenerates it.

## Known rough edges

- **Vite is pinned via `overrides`.** Astro 7 ships Vite 8; several dev
  dependencies still resolve Vite 6, and two copies make the Cloudflare plugin's
  dev server fail with `Missing field 'moduleType'`. The `overrides: { vite: "$vite" }`
  entry in `package.json` forces one copy. It can go once the ecosystem settles.
- **`lucide-svelte` is excluded from dep optimization.** It ships raw `.svelte`
  files that esbuild's optimizer cannot load. Icons are imported individually
  (`lucide-svelte/icons/send`) rather than from the barrel, which is also much
  less work for the bundler.
- **`astro dev` backgrounds itself when it detects an AI coding agent.** Its
  output goes to `.astro/dev.log` rather than the terminal.
- **The e2e suite runs against the production build**, not the dev server. The
  dev server compiles routes on demand, which made WebKit time out under
  parallel workers; it also means the tests exercise the real Worker bundle.
- **On NixOS, Playwright's browsers come from `flake.nix`.** Its own download is
  dynamically linked against libraries NixOS does not provide. The npm
  `@playwright/test` version and the nixpkgs `playwright-driver` version must
  match, since Playwright looks for exact browser revisions — `nix flake update`
  is the fix when they drift.
