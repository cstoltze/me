import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  streamText,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { buildSystemPrompt } from "../../lib/agent-context";

export const prerender = false;

/** Gemini model backing the agent. See docs/architecture.md before changing. */
const MODEL = "gemini-3-flash-preview";

/**
 * Guards against a public endpoint being used as a free LLM proxy.
 * The per-IP request rate is capped separately by the CHAT_RATE_LIMIT binding.
 */
const LIMITS = {
  /** Turns kept from the client's history. Older turns are dropped. */
  maxMessages: 20,
  /** Characters per message. Roughly 500 tokens; plenty for a question. */
  maxCharsPerMessage: 2_000,
  /** Ceiling on what we'll pay for in one response. */
  maxOutputTokens: 1_024,
} as const;

function json(
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function badRequest(message: string) {
  return json({ error: message }, 400);
}

/**
 * Applies the Cloudflare rate limit binding, keyed by client IP.
 *
 * Returns true when the request may proceed. The binding is absent in local dev,
 * where there is no edge rate limiter, so requests are allowed through.
 */
async function withinRateLimit(clientAddress: string): Promise<boolean> {
  const limiter = env.CHAT_RATE_LIMIT;
  if (!limiter) return true;

  const { success } = await limiter.limit({ key: clientAddress });
  return success;
}

function textLength(message: UIMessage): number {
  return message.parts
    .filter(
      (part): part is Extract<typeof part, { type: "text" }> =>
        part.type === "text",
    )
    .reduce((total, part) => total + part.text.length, 0);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!(await withinRateLimit(clientAddress))) {
    return json({ error: "Too many requests. Try again shortly." }, 429, {
      "retry-after": "60",
    });
  }

  /**
   * Read the key from the Worker env, never `import.meta.env`: Vite replaces
   * `import.meta.env.X` with a literal at transform time, which would bake the
   * secret into the built bundle. `cloudflare:workers` resolves it per request,
   * and in local dev the Vite plugin backs it with `.env`.
   */
  const apiKey = env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
    return json({ error: "Chat is not configured." }, 503);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Body must be JSON.");
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !Array.isArray((payload as { messages?: unknown }).messages)
  ) {
    return badRequest("Expected { messages: [...] }.");
  }

  const incoming = (payload as { messages: UIMessage[] }).messages;
  if (incoming.length === 0) return badRequest("No messages supplied.");
  if (
    incoming.some((message) => textLength(message) > LIMITS.maxCharsPerMessage)
  ) {
    return badRequest(
      `Messages are limited to ${LIMITS.maxCharsPerMessage} characters.`,
    );
  }

  // Keep the most recent turns rather than rejecting a long conversation.
  const messages = incoming.slice(-LIMITS.maxMessages);

  const google = createGoogleGenerativeAI({ apiKey });

  const result = streamText({
    model: google(MODEL),
    system: await buildSystemPrompt(),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: LIMITS.maxOutputTokens,
    // Without this, a provider failure is silently folded into the stream as a
    // generic "An error occurred." and never reaches the Worker logs.
    onError: ({ error }) => {
      console.error("streamText failed", error);
    },
  });

  // `result.toUIMessageStreamResponse()` is deprecated in ai v7 and slated for
  // removal; these standalone helpers are the supported path.
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
};
