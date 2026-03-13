# GMU Smart Patriot

[![Live Demo](https://img.shields.io/badge/demo-gmu--smartpatriot.vercel.app-006633?style=flat-square)](https://gmu-smartpatriot.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

**Patriot** is an AI-powered virtual assistant for George Mason University (GMU) students. It answers questions about programs, courses, deadlines, advising, and campus resources by searching live GMU web pages and synthesizing accurate, source-backed answers.

> ⚠️ **Disclaimer:** This is a prototype project and is **not an official GMU tool**. Always verify important information with official GMU offices and advisors.

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
- **Language:** TypeScript 5

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

## API Endpoints

### `POST /api/advisor`

Primary endpoint used by the chat UI. It:

1. Searches GMU web pages via Tavily with query-specific targeting
2. Ranks results by domain authority (catalog, CS dept, registrar, etc.)
3. Sends context to Groq (Llama 3.3 70B) for answer generation
4. Returns the answer and source links

**Request body:**
```json
{
  "message": "What are the MS CS degree requirements?",
  "history": [
    { "role": "user", "content": "Tell me about GMU CS" },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{
  "answer": "...",
  "sources": [
    { "label": "GMU Source 1", "title": "Computer Science, MS", "url": "https://catalog.gmu.edu/..." }
  ]
}
```

### `POST /api/chat`

Alternative endpoint using the static knowledge base (`gmuKnowledge.ts`) instead of live search. Useful for offline or low-cost scenarios.

---

## How Search Works

`searchGmu.ts` builds targeted queries based on question intent:

- **CS programs** → `site:cs.gmu.edu`, `site:catalog.gmu.edu`
- **Course codes** (e.g., CS 583) → exact phrase search on catalog and CS pages
- **Registration / calendar** → `site:registrar.gmu.edu`
- **Housing** → `site:housing.gmu.edu`
- **Assistantships** → GTA/GRA-specific pages on cs.gmu.edu and graduate.gmu.edu
- **Financial aid** → `site:financialaid.gmu.edu`

Results are ranked using:

- **Domain weights** – Higher weight for catalog.gmu.edu, cs.gmu.edu, registrar.gmu.edu
- **Path relevance** – CS questions prefer CS pages; assistantship questions prefer assistantship pages
- **Tavily score** – Original search relevance

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

- **Live Demo:** [gmu-smartpatriot.vercel.app](https://gmu-smartpatriot.vercel.app)
- **Repository:** [github.com/yashdayma55/gmu-smartpatriot](https://github.com/yashdayma55/gmu-smartpatriot)
- **George Mason University:** [gmu.edu](https://www.gmu.edu)
- **GMU Computer Science:** [cs.gmu.edu](https://cs.gmu.edu)
