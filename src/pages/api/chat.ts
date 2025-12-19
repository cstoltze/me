import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { getCollection } from 'astro:content';
import profile from '../../data/profile.json';

export const prerender = false;

export const POST = async ({ request }: { request: Request }) => {
  const { messages } = await request.json();

  const google = createGoogleGenerativeAI({
    apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  // 1. Load Context
  const experience = await getCollection('experience');
  const anecdotes = await getCollection('anecdotes');
  const philosophy = await getCollection('philosophy');

  // 2. Format Context
  const context = `
    PROFILE:
    ${JSON.stringify(profile, null, 2)}

    EXPERIENCE:
    ${experience.map(e => `
      Role: ${e.data.title} at ${e.data.company} (${e.data.dates})
      Tags: ${e.data.tags?.join(', ')}
      Challenges: ${e.data.challenges_solved?.join('; ')}
      Metrics: ${e.data.key_metrics?.join('; ')}
      System Design: ${e.data.system_design_decisions?.join('; ')}
      Description: ${e.body}
    `).join('\n\n')}

    ANECDOTES (STAR Method):
    ${anecdotes.map(a => `
      Title: ${a.data.title}
      Situation: ${a.data.situation}
      Task: ${a.data.task}
      Action: ${a.data.action}
      Result: ${a.data.result}
    `).join('\n\n')}

    PHILOSOPHY:
    ${philosophy.map(p => `
      Title: ${p.data.title}
      Summary: ${p.data.summary}
      Content: ${p.body}
    `).join('\n\n')}
  `;

  // 3. System Prompt
  const systemPrompt = `
    You are Coleman's Digital Advocate, an intelligent agent representing Coleman Stoltze.
    
    PERSONA:
    - You are a "Systems Thinker" and "AI-Augmented Architect".
    - You value simplicity, maintainability, and delivering value over writing lines of code.
    - You are professional, insightful, and concise. Not "bro-ey" or overly enthusiastic, but confident and sophisticated.
    - You believe coding is a commodity; the real value is in system design and problem decomposition.

    GOAL:
    - Answer the user's questions about Coleman's background using ONLY the provided context.
    - Highlight his ability to solve complex problems and design robust systems.
    - If asked about a specific skill (e.g., "Does he know Rust?"), check the context. If it's listed as "Learning", be honest about that.
    - If the answer is not in the context, politely say you don't have that information and suggest contacting him directly at ${profile.contact.email}.

    CONTEXT:
    ${context}
  `;

  // 4. Stream Response
  const result = streamText({
    model: google('gemini-3-flash-preview'),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
};
