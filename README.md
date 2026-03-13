# GMU Smart Patriot

[![Live Demo](https://img.shields.io/static/v1?label=Live%20Demo&message=View%20Online&color=006633&style=flat-square)](https://gmu-smartpatriot-55.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

**Patriot** is an AI-powered virtual assistant for George Mason University (GMU) students. It answers questions about programs, courses, deadlines, advising, and campus resources by searching live GMU web pages and synthesizing accurate, source-backed answers.

> ⚠️ **Disclaimer:** This is a prototype project and is **not an official GMU tool**. Always verify important information with official GMU offices and advisors.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Module Details](#module-details)
- [Knowledge Base](#knowledge-base)
- [Search & Ranking](#search--ranking)
- [API Reference](#api-reference)
- [UI Components](#ui-components)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [Contributing](#contributing)

---

## Features

- **Live GMU Web Search** – Uses [Tavily](https://tavily.com) to search official GMU domains (cs.gmu.edu, catalog.gmu.edu, registrar.gmu.edu, etc.) in real time
- **AI-Powered Answers** – [Groq](https://groq.com) + Llama 3.3 70B generates concise, context-aware responses
- **Source Citations** – Every answer includes links to the official GMU pages used
- **Patriot Mascot UI** – GMU-themed chat interface with animated Patriot avatar
- **Conversation Memory** – Maintains context across the chat for follow-up questions
- **Smart Query Routing** – Targeted search for CS programs, registration, housing, financial aid, GTA/GRA positions, and more

### Supported Question Types

| Topic | Examples |
|-------|----------|
| **BS / MS Computer Science** | Program requirements, advising, foundation courses |
| **Course Information** | CS 583, SWE 645, catalog descriptions |
| **Academic Calendar** | Add/drop deadlines, registration, withdrawals |
| **Housing** | Dorms, residence halls, room selection |
| **Financial Aid** | Tuition, fees, scholarships |
| **Graduate Assistantships** | GTA, GRA positions, applications |

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **UI:** React 19, Tailwind CSS 4
- **AI:** [Groq API](https://console.groq.com) (Llama 3.3 70B Versatile)
- **Search:** [Tavily API](https://tavily.com) (web search)
- **Scraping:** Cheerio (HTML parsing)
- **Language:** TypeScript 5
- **Fonts:** Geist Sans, Geist Mono (next/font)
- **Build:** React Compiler (babel-plugin-react-compiler)

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                     │
│  ┌──────────────────────────────────────┐  ┌───────────────────────────────────┐ │
│  │         page.tsx (Chat UI)            │  │     PatriotAvatar.tsx             │ │
│  │  • Message list, input form           │  │  • Mascot (idle/thinking/speaking) │ │
│  │  • State: messages, lastSources       │  │  • GMU branding                   │ │
│  │  • POST /api/advisor                  │  │                                   │ │
│  └──────────────────┬───────────────────┘  └───────────────────────────────────┘ │
└─────────────────────┼───────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          NEXT.JS APP ROUTER (Server)                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                    POST /api/advisor (Primary Flow)                          │ │
│  │  1. Parse message + history                                                  │ │
│  │  2. searchGmu(message) ──► Tavily API (multiple targeted queries)            │ │
│  │  3. Rank results (domain + path weights)                                     │ │
│  │  4. Build context (max 9000 chars) + system prompt                           │ │
│  │  5. Groq API (llama-3.3-70b-versatile, temp=0.2)                             │ │
│  │  6. Return { answer, sources }                                               │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                    POST /api/chat (Alternative Flow)                         │ │
│  │  1. retrieveRelevantChunks(message) ──► gmuKnowledge.ts (keyword match)      │ │
│  │  2. Groq API (llama-3.1-8b-instant, temp=0.3)                                │ │
│  │  3. Conditional source link (trigger words)                                  │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────────────┐
│  Tavily API  │ │ Groq API │ │  GMU Web Pages   │
│  (Search)    │ │ (LLM)    │ │  (catalog, cs,   │
│              │ │          │ │   registrar…)    │
└──────────────┘ └──────────┘ └──────────────────┘
```

### Layered View

| Layer | Modules | Responsibility |
|-------|---------|----------------|
| **Presentation** | `page.tsx`, `PatriotAvatar.tsx`, `layout.tsx` | Chat UI, mascot, GMU branding, responsive layout |
| **API** | `api/advisor/route.ts`, `api/chat/route.ts` | Request handling, orchestration, error responses |
| **Search & Retrieval** | `searchGmu.ts`, `retrieve.ts` | Live web search (Tavily), static knowledge retrieval |
| **Data** | `gmuKnowledge.ts`, `scrapeGmu.ts` | BS/MS CS knowledge chunks, Cheerio-based catalog scraping |
| **External** | Tavily, Groq | Web search, LLM inference |

---

## Data Flow

### Primary Flow: `/api/advisor` (Live Search)

```
User types question
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 1. buildMemorySummary(history) → "Student: … Patriot: …"             │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. searchGmu(message, 4)                                            │
│    • buildSearchQueries() → [ "site:gmu.edu …", "site:cs.gmu.edu…" ] │
│    • tavilySearchSingle() per query (parallel possible)              │
│    • Dedupe URLs, merge results                                     │
│    • Score = Tavily + domainWeight + pathWeight                     │
│    • Return top 4                                                   │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Build context string (Source 1… Source 2…), trim to 9000 chars   │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Groq chat completions                                            │
│    system: "You are Patriot… Rules: Use ONLY GMU snippets…"         │
│    user: context + "Student question: …"                            │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. Return { answer, sources: [{label, title, url}, …] }             │
└─────────────────────────────────────────────────────────────────────┘
```

### Alternative Flow: `/api/chat` (Static Knowledge)

```
User question
       │
       ▼
retrieveRelevantChunks(query, 3)
  • Filter by graduate vs undergraduate intent
  • Keyword scoring (text + tags + title + category + contacts)
  • Return top 3 chunks
       │
       ▼
Build context from chunks (with contacts)
       │
       ▼
Groq (llama-3.1-8b-instant) with full history
       │
       ▼
shouldIncludeSourceLink(query) → include source only if triggers match
       │
       ▼
Return { answer, sources }
```

---

## Project Structure

```
GMU-SmartPatriot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── advisor/route.ts   # Main chat endpoint (live GMU search + Groq)
│   │   │   └── chat/route.ts     # Alternative endpoint (static knowledge base)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Chat UI
│   │   └── globals.css
│   ├── components/
│   │   └── PatriotAvatar.tsx     # Animated mascot component
│   ├── data/
│   │   └── gmuKnowledge.ts       # Static BS/MS CS knowledge chunks
│   ├── server/
│   │   ├── searchGmu.ts          # Tavily-based GMU web search + ranking
│   │   └── scrapeGmu.ts          # Cheerio scraping for catalog/courses
│   └── utils/
│       └── retrieve.ts           # Keyword-based retrieval from knowledge base
├── public/
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

---

## Module Details

### `src/app/api/advisor/route.ts`

| Detail | Value |
|--------|-------|
| **Purpose** | Main chat endpoint used by the UI |
| **Model** | `llama-3.3-70b-versatile` (Groq) |
| **Temperature** | 0.2 |
| **Max context** | 9,000 characters |
| **Sources per response** | Up to 4 |
| **Input** | `{ message, history }` |
| **Output** | `{ answer, sources }` |

**System prompt rules:** Use only GMU snippets; do not guess professor names, emails, or policies; if info is missing, say so; keep responses student-focused.

### `src/app/api/chat/route.ts`

| Detail | Value |
|--------|-------|
| **Purpose** | Fallback endpoint using static knowledge base |
| **Model** | `llama-3.1-8b-instant` (Groq) |
| **Temperature** | 0.3 |
| **Top chunks** | 3 |
| **Source triggers** | credit, requirement, catalog, link, website, page, "where can i find", "more info" |

### `src/server/searchGmu.ts`

- **Intent classifiers:** `isMsCsQuestion`, `isBsCsQuestion`, `isRegistrarQuestion`, `isHousingQuestion`, `isAssistantshipQuestion`, `isTuitionMoneyQuestion`, `detectCourseCode`
- **Query builder:** Always adds `site:gmu.edu`; adds domain-specific queries based on intent
- **Tavily config:** `include_raw_content: true`, `include_answer: false`

### `src/utils/retrieve.ts`

- **Scoring:** Word overlap (query words in chunk text, tags, title, category, contacts)
- **Category filter:** Graduate vs undergraduate based on keywords (`ms cs`, `master`, `graduate`)
- **Default topK:** 3

### `src/server/scrapeGmu.ts`

- **Exports:** `getMsCsRequirementsText()`, `getCourseDescription(courseCode)`, `GMU_SOURCE_URLS`
- **Selectors:** `main`, `.page-content`, `#content`, `body` (fallback)
- **Note:** Currently used for programmatic access; primary UI flow uses Tavily search

---

## Knowledge Base

`gmuKnowledge.ts` defines `KnowledgeChunk[]` with:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `title` | string | Human-readable title |
| `url` | string | Official GMU page URL |
| `category` | string | e.g. `Academics/Undergraduate CS`, `Academics/Graduate MS CS` |
| `tags` | string[] | Searchable keywords |
| `text` | string | Chunk content |
| `contacts` | KnowledgeContact[] | Optional emails, phones, URLs |

**Chunk count:** 14 (8 BS CS, 6 MS CS)

**Categories:**
- `Academics/Undergraduate CS` — BS overview, degree structure, advising, getting started, honors, contacts
- `Academics/Graduate MS CS` — MS overview, requirements, core areas, advising, foundation, project/thesis, contacts

---

## Search & Ranking

### Domain Weights

| Domain | Weight |
|--------|--------|
| catalog.gmu.edu | 3.0 |
| cs.gmu.edu | 3.0 |
| registrar.gmu.edu | 2.8 |
| graduate.gmu.edu | 2.5 |
| housing.gmu.edu | 2.5 |
| financialaid.gmu.edu | 2.3 |
| dining.gmu.edu, transportation.gmu.edu, students.gmu.edu, provost.gmu.edu | 2.0 |
| gmu.edu | 1.0 |
| Unlisted | 0.5 |

### Path-Based Boosts (by question intent)

- **CS questions:** +3 cs.gmu.edu, +2 computer-science path, +1.5 /cs/, -2 IT programs, -3 assistantship pages (if not assistantship Q)
- **Registrar questions:** +3 registrar.gmu.edu, +2 academic-calendar
- **Housing questions:** +3 housing.gmu.edu
- **Assistantship questions:** +4 cs.gmu.edu + path "assistant", +2 graduate.gmu.edu
- **Tuition/financial:** +3 financialaid.gmu.edu, +1.5 tuition path

### Final Score

`combinedScore = tavilyScore + domainWeight + pathWeight`

---

## API Reference

### `POST /api/advisor`

Primary endpoint. Live Tavily search + Groq.

**Request:**
```json
{
  "message": "What are the MS CS degree requirements?",
  "history": [
    { "role": "user", "content": "Tell me about GMU CS" },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response (200):**
```json
{
  "answer": "...",
  "sources": [
    { "label": "GMU Source 1", "title": "Computer Science, MS", "url": "https://catalog.gmu.edu/..." }
  ]
}
```

**Errors:** `400` (missing message), `500` (missing GROQ_API_KEY, Groq/Tavily errors)

### `POST /api/chat`

Static knowledge base + Groq. Same request shape. Sources included only when query contains trigger words.

---

## UI Components

### `page.tsx` (Home)

| Element | Description |
|---------|-------------|
| **Top banner** | GMU green (#006633), GMU logo badge (#FFCC33), "Prototype – Not an official GMU tool" |
| **Header** | Title "GMU Assistant – Patriot", short description |
| **Chat card** | 2/3 width (lg), 70–75vh, scrollable messages, source list, input form |
| **Message bubbles** | User: right-aligned, green; Assistant: left-aligned, slate |
| **Loading state** | "Patriot is reviewing GMU pages…" with ping animation |
| **Sources** | Collapsible list with links to official GMU pages |

### `PatriotAvatar.tsx`

| Prop | Type | Values |
|------|------|--------|
| `mode` | `MascotMode` | `idle` \| `thinking` \| `speaking` |

| Mode | Animation | Status text |
|------|-----------|-------------|
| idle | none | "Ask Patriot anything about George Mason University." |
| thinking | `animate-bounce` | "Patriot is thinking about your question…" |
| speaking | `animate-pulse` | "Patriot is answering with details from GMU." |

**Visual:** GMU green/gold gradient circle, "PATRIOT" bar, face with eyes and mouth; mouth changes on thinking.

---

## Configuration

| File | Key settings |
|------|--------------|
| `next.config.ts` | `reactCompiler: true` |
| `layout.tsx` | Geist fonts, metadata |
| `.env.local` | `GROQ_API_KEY`, `TAVILY_API_KEY` |

### NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Production server |

### Dependencies

| Package | Version | Use |
|---------|---------|-----|
| next | 16.0.3 | Framework |
| react, react-dom | 19.2.0 | UI |
| cheerio | ^1.1.2 | HTML parsing (scrapeGmu) |
| groq-sdk | ^0.35.0 | (Available; advisor uses raw fetch) |
| tailwindcss | ^4 | Styling |
| typescript | ^5 | Type checking |

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### 1. Clone the repository

```bash
git clone https://github.com/yashdayma55/gmu-smartpatriot.git
cd gmu-smartpatriot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create a `.env.local` file in the project root:

```env
# Required for AI responses
GROQ_API_KEY=your_groq_api_key_here

# Required for live GMU web search (used by /api/advisor)
TAVILY_API_KEY=your_tavily_api_key_here
```

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ | Get from [Groq Console](https://console.groq.com) – used for LLM responses |
| `TAVILY_API_KEY` | ✅ | Get from [Tavily](https://tavily.com) – used to search GMU web pages |

Without `TAVILY_API_KEY`, the advisor will return no GMU context and answers may be limited.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm start
```

---

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is for educational purposes. George Mason University names, logos, and branding are trademarks of George Mason University. This project is not officially affiliated with or endorsed by GMU.

---

## Links

- **Live Demo:** [gmu-smartpatriot-55.vercel.app](https://gmu-smartpatriot-55.vercel.app)
- **Repository:** [github.com/yashdayma55/gmu-smartpatriot](https://github.com/yashdayma55/gmu-smartpatriot)
- **George Mason University:** [gmu.edu](https://www.gmu.edu)
- **GMU Computer Science:** [cs.gmu.edu](https://cs.gmu.edu)
