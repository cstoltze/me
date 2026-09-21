/**
 * Stub for the `cloudflare:workers` virtual module, which only exists inside the
 * Workers runtime. Tests mutate `env` to exercise missing secrets and rate limits.
 */
export const env: {
  GOOGLE_GENERATIVE_AI_API_KEY?: string;
  CHAT_RATE_LIMIT?: {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  };
} = {};
