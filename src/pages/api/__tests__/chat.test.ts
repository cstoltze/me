import { describe, it, expect, vi, beforeEach } from "vitest";
import { env } from "cloudflare:workers";

/**
 * `wrangler types` declares the bindings as always present, because the config
 * guarantees them in a deployed Worker. These tests deliberately simulate them
 * being absent -- an unset secret, or local dev with no edge rate limiter -- so
 * they need a view of `env` where both are optional.
 */
const testEnv = env as unknown as {
  GOOGLE_GENERATIVE_AI_API_KEY?: string;
  CHAT_RATE_LIMIT?: {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  };
};

const streamText = vi.fn();

vi.mock("ai", () => ({
  streamText,
  convertToModelMessages: vi.fn(async (messages) => messages),
  toUIMessageStream: vi.fn(({ stream }) => stream),
  createUIMessageStreamResponse: vi.fn(() => new Response("stream data")),
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(() => vi.fn((model: string) => ({ model }))),
}));

vi.mock("../../../lib/agent-context", () => ({
  buildSystemPrompt: vi.fn().mockResolvedValue("SYSTEM PROMPT"),
}));

const { POST } = await import("../chat");

function post(body: unknown) {
  return new Request("https://example.com/api/chat", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function userMessage(text: string) {
  return { id: "1", role: "user", parts: [{ type: "text", text }] };
}

function call(request: Request) {
  return POST({
    request,
    clientAddress: "203.0.113.1",
  } as never) as Promise<Response>;
}

/** Installs a rate limiter that either allows or blocks. */
function rateLimiter(allows: boolean) {
  const limit = vi.fn().mockResolvedValue({ success: allows });
  testEnv.CHAT_RATE_LIMIT = { limit };
  return limit;
}

beforeEach(() => {
  // `env` is module state shared across tests; reset it each time.
  testEnv.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
  testEnv.CHAT_RATE_LIMIT = undefined;

  streamText.mockReset();
  streamText.mockReturnValue({ stream: "raw-stream" });
});

describe("POST /api/chat", () => {
  it("streams a reply for a valid request", async () => {
    const response = await call(post({ messages: [userMessage("Hello")] }));

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("stream data");
    expect(streamText).toHaveBeenCalledOnce();
    expect(streamText.mock.calls[0][0]).toMatchObject({
      system: "SYSTEM PROMPT",
    });
  });

  it("caps the output tokens it will pay for", async () => {
    await call(post({ messages: [userMessage("Hello")] }));
    expect(streamText.mock.calls[0][0].maxOutputTokens).toBeLessThanOrEqual(
      1024,
    );
  });

  it("returns 503 when no API key is configured", async () => {
    testEnv.GOOGLE_GENERATIVE_AI_API_KEY = undefined;
    const response = await call(post({ messages: [userMessage("Hello")] }));

    expect(response.status).toBe(503);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("returns 429 when the rate limit is exceeded", async () => {
    rateLimiter(false);
    const response = await call(post({ messages: [userMessage("Hello")] }));

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(streamText).not.toHaveBeenCalled();
  });

  it("keys the rate limit by client address", async () => {
    const limit = rateLimiter(true);
    await call(post({ messages: [userMessage("Hello")] }));
    expect(limit).toHaveBeenCalledWith({ key: "203.0.113.1" });
  });

  it("allows requests when no rate limiter is bound, as in local dev", async () => {
    const response = await call(post({ messages: [userMessage("Hello")] }));
    expect(response.status).toBe(200);
  });

  it("rejects a non-JSON body", async () => {
    expect((await call(post("not json"))).status).toBe(400);
    expect(streamText).not.toHaveBeenCalled();
  });

  it.each([{}, { messages: "nope" }, { messages: [] }])(
    "rejects %j",
    async (body) => {
      expect((await call(post(body))).status).toBe(400);
      expect(streamText).not.toHaveBeenCalled();
    },
  );

  it("rejects an over-long message", async () => {
    const response = await call(
      post({ messages: [userMessage("x".repeat(2_001))] }),
    );
    expect(response.status).toBe(400);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("truncates history rather than rejecting a long conversation", async () => {
    const messages = Array.from({ length: 50 }, (_, i) =>
      userMessage(`message ${i}`),
    );
    const response = await call(post({ messages }));

    expect(response.status).toBe(200);
    const sent = streamText.mock.calls[0][0].messages;
    expect(sent).toHaveLength(20);
    // The most recent turns are the ones kept.
    expect(sent.at(-1).parts[0].text).toBe("message 49");
  });
});
