import { defineCollection, z } from 'astro:content';

const experience = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        company: z.string(),
        dates: z.string(),
        location: z.string().optional(),
        tags: z.array(z.string()).optional(),
        // Extended Context for AI
        challenges_solved: z.array(z.string()).optional(),
        key_metrics: z.array(z.string()).optional(),
        system_design_decisions: z.array(z.string()).optional(),
    }),
});

const anecdotes = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        tags: z.array(z.string()),
        situation: z.string(),
        task: z.string(),
        action: z.string(),
        result: z.string(),
    }),
});

const philosophy = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        summary: z.string(),
    }),
});

export const collections = { experience, anecdotes, philosophy };
