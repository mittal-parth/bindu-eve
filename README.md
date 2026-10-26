# Bindu

An open source personal assistant like Grok Bot / Muse / OpenAI Dots.

It is currently a work in progress.

Built using [Vercel eve](https://eve.dev).

## Features

- [x] Be able to chat with an LLM.
- [x] File based agent memory
- [x] Full browser access with the ability to click around, take screenshots, record, fill forms, browse the internet, etc.
- [x] Sandbox execution. Vercel Sandbox in production and just-bash during local dev
- [x] Evals for anything added. Evolving as we go.
- [ ] User-defined schedules
- [ ] Skills. Some custom skills might be needed which are perhaps not being done well by the agent by default. User-defined skills dynamically created with usage.
- [ ] Subagents
- [ ] Connections to popular apps. Whether this is done with Composio or one by one, will be decided.
- [ ] Processing of webhook events from connected apps to add proactivity 
- [ ] Configurable persona of the agent / bot per user.
- [ ] Chat based UI. 
- [ ] Multiple bots per user.
- [ ] Authenticated users.
- [ ] 1-2 non web based channel like Discord, iMessage. Adding another surface is more of an operational overhead.


## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Chat with the agent in the terminal. |
| `npm run eval` | Run evals. `npx eve eval capabilities` or `npx eve eval memory` runs one. |
| `npm run typecheck` | Typecheck the agent and evals. |
| `npm run build` | Build for production. |
| `npm run start` | Run a production build locally. |
| `npm run deploy` | Link a Vercel project if needed, then deploy. |

## Environment

Local chat can use an Anthropic key saved with `/login` inside `eve dev`. Deployments need `ANTHROPIC_API_KEY`.

Before the first production build or deploy, link the app with `eve link`. Before relying on memory in production, run `eve integration setup file-memory`. That connects a Blob store. [Blob pricing](https://vercel.com/pricing) includes 1 GB, 10,000 reads, and 2,000 writes a month on Hobby. One memory document is at most 64 KB.

`memory/recall` calls the model, so it needs the same Anthropic credential as chat. `capabilities` does not.

----

PS: guess why its called bindu :)
