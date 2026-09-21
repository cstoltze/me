# Writing content for the agent

Everything the Digital Advocate knows comes from this repo. There is no vector
store, no fine-tuning and no external index: at request time,
`src/lib/agent-context.ts` reads the content collections and pastes them into the
system prompt. **Adding knowledge means adding a markdown file.**

The agent is instructed to answer _only_ from this content and to say so when
something is not covered. So a gap in these files shows up as "I don't have that
information" rather than as an invention — which means the cost of leaving
something out is low, and the value of writing it down is high.

## Where things go

| Collection   | Path                      | Shown on the site?    | Use it for                     |
| ------------ | ------------------------- | --------------------- | ------------------------------ |
| `experience` | `src/content/experience/` | **Yes**, on `/resume` | Jobs and roles                 |
| `anecdotes`  | `src/content/anecdotes/`  | No — agent only       | Specific stories, in STAR form |
| `philosophy` | `src/content/philosophy/` | No — agent only       | How you think about the work   |

`anecdotes` and `philosophy` are invisible on the page. They exist purely so the
agent has something concrete to draw on. That is where depth belongs — detail
that would bloat a resume is exactly what makes an answer good.

The schema for each is defined and commented in `src/content.config.ts`. A file
that does not match its schema **fails the build** with the field named, so a
typo cannot quietly disappear.

## Experience entries

```markdown
---
title: "Founding Engineer"
company: "Develo"
dates: "Sept 2022 - Present"
tags: ["Redwood.js", "BullMQ", "Redis", "System Design"]

# Everything below is agent-only. None of it is rendered on the resume.
challenges_solved:
  - "Built the initial MVP from scratch as the first employee."
key_metrics:
  - "0 to 1 product launch."
system_design_decisions:
  - "Chose Redwood.js for rapid full-stack development with strong conventions."
---

The body is rendered on the resume as markdown. Keep it tight -- bullets of what
you actually did.

- Architected full-stack features using Redwood.js
- Integrated critical third-party APIs (e-prescribe, e-lab, e-fax)
```

**`dates` must read `<Month> <YYYY> - <Month> <YYYY>`, or `- Present`.** The
resume sorts on the start date. Only the start is parsed; the rest is displayed
verbatim. An unparseable month throws at build time rather than silently
scrambling the order (`src/lib/dates.ts`).

Accepted month spellings: `Jan`/`January`, `Sep`/`Sept`/`September`, and the
equivalent short and long forms for every other month. Case does not matter.

### The agent-only fields are the point

`title` and a bullet list tell the agent very little. These three fields are what
let it answer a real question:

- **`challenges_solved`** — the problem, not the technology. "Lab results were
  silently failing to process" beats "worked on reliability".
- **`key_metrics`** — numbers. "Cut p95 from 4s to 400ms", "integrated 3
  third-party APIs". These are what a hiring manager actually asks about.
- **`system_design_decisions`** — the decision _and the reasoning_. "Chose X for
  Y" is far more useful than "used X", because the agent can then explain your
  judgement rather than just your tool list.

## Anecdotes

One story per file, in Situation / Task / Action / Result form. These are the
single highest-value thing to add: they turn "he's good at debugging" into a
specific account of a specific bug.

```markdown
---
title: "The Silent Failure"
tags: ["debugging", "systems-thinking", "persistence"]
situation: "At ixlayer, lab results were occasionally failing to process without triggering alerts."
task: "Identify the root cause and implement a fail-safe mechanism."
action: "I traced the request lifecycle through the distributed system, found a race condition in the third-party webhook handler that swallowed errors, and added a dead-letter queue with comprehensive logging."
result: "Zero silent failures since. The dead-letter queue recovers failed jobs automatically."
---

The body is optional, and is passed to the agent as "Reflection". Use it for the
general lesson -- the part that transfers to other problems.
```

Be specific and be honest. The agent presents this to people deciding whether to
hire you, and it will repeat whatever is here, including the numbers.

## Philosophy

```markdown
---
title: "Systems Thinking over Coding"
summary: "Why I view myself as a Systems Thinker first and a Coder second."
---

The body carries the argument. Markdown, a few paragraphs at most.
```

`summary` is what the agent leans on for a quick answer; the body is there when
someone asks a follow-up.

## Profile

`src/data/profile.json` holds the name, contact details, summary, skills and
education. It feeds the resume sidebar _and_ the agent. Two notes:

- The skills lists are presented to the agent as fact. If something is aspirational,
  label it — the agent is told to be honest about anything marked "Learning",
  but it can only do that if the file says so. `"Rust (Learning)"` works.
- `contact.email` is what the agent hands out when it cannot answer something.

## After you add something

```sh
npm run dev     # schema errors show up immediately
npm test
```

Then just ask the agent about the thing you added. If the answer is vague, the
source entry is usually vague too.

## When this stops scaling

The entire corpus goes into every request's system prompt. That is the right
design at this size — it is simple, has no infrastructure and cannot return a
stale or wrongly-retrieved chunk. But prompt size grows linearly with content,
and so does the per-request cost.

Somewhere past roughly 50 entries, switch to retrieval rather than continuing to
grow the prompt. See [architecture.md](architecture.md#when-to-change-the-agent-design).
