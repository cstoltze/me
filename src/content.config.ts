import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

/**
 * Content that feeds both the rendered resume and the AI agent's context.
 *
 * The `challenges_solved` / `key_metrics` / `system_design_decisions` fields are
 * never rendered on the page -- they exist purely to give the agent in
 * `src/pages/api/chat.ts` specifics to draw on. See docs/content-authoring.md.
 */
const experience = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/experience" }),
  schema: z.object({
    title: z.string(),
    company: z.string(),
    dates: z.string(),
    location: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // Agent-only context; not rendered.
    challenges_solved: z.array(z.string()).optional(),
    key_metrics: z.array(z.string()).optional(),
    system_design_decisions: z.array(z.string()).optional(),
  }),
});

/** Situation / Task / Action / Result stories. Agent-only; not rendered. */
const anecdotes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/anecdotes" }),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    situation: z.string(),
    task: z.string(),
    action: z.string(),
    result: z.string(),
  }),
});

/** Opinions on engineering. Agent-only; not rendered. */
const philosophy = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/philosophy" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
  }),
});

export const collections = { experience, anecdotes, philosophy };
