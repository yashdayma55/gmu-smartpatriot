// src/app/api/advisor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchGmu } from "@/server/searchGmu";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MAX_CONTEXT_CHARS = 9000;

type ChatMessage = { role: "user" | "assistant"; content: string };

/** Build readable conversation memory */
function buildMemorySummary(history: ChatMessage[]): string {
  if (!history || history.length === 0) return "No previous conversation.";
  return history
    .map((msg) => {
      const speaker = msg.role === "user" ? "Student" : "Patriot";
      return `${speaker}: ${msg.content.trim()}`;
    })
    .join("\n");
}

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Missing GROQ_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const message: string = body.message;
    const history: ChatMessage[] = body.history || [];

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const memorySummary = buildMemorySummary(history);

    // 🔍 SCRAPE LIVE GMU PAGES
    const gmuResults = await searchGmu(message, 4);

    let context = "No GMU pages found.";
    const sources: { label: string; title: string; url: string }[] = [];

    if (gmuResults.length > 0) {
      const parts: string[] = [];
      for (let i = 0; i < gmuResults.length; i++) {
        const r = gmuResults[i];
        sources.push({
          label: `GMU Source ${i + 1}`,
          title: r.title || "GMU page",
          url: r.url,
        });
        const text = (r.content || "").replace(/\s+/g, " ").trim();
        parts.push(
          `Source ${i + 1}: ${r.title}\nURL: ${r.url}\nText:\n${text}`
        );
      }
      context = parts.join("\n\n---\n\n");
      if (context.length > MAX_CONTEXT_CHARS) {
        context = context.slice(0, MAX_CONTEXT_CHARS);
      }
    }

    // 🎯 SYSTEM PROMPT
    const systemPrompt = `
You are "Patriot", the GMU virtual assistant.

Conversation memory:
${memorySummary}

Rules:
- Use ONLY the GMU snippets provided.
- Do NOT guess professor names, emails, or policies.
- If info is missing, clearly say so.
- Keep responses friendly, accurate, and student-focused.
`.trim();

    const userPrompt = `
GMU Web Results (may be shortened):

${context}

Student question:
${message}

Task:
Answer ONLY using this information + memory.
If unsure, recommend checking the linked GMU pages or contacting advising.
`.trim();

    const messagesForGroq = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // 🚀 **GROQ — FINAL WORKING MODEL**
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // ← VALID WORKING MODEL
          messages: messagesForGroq,
          temperature: 0.2,
        }),
      }
    );

    const raw = await groqRes.text();

    if (!groqRes.ok) {
      console.error("Groq API error:", groqRes.status, raw);
      return NextResponse.json(
        { error: `Groq API error ${groqRes.status}: ${raw}` },
        { status: 500 }
      );
    }

    const data = JSON.parse(raw);

    const answer =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn’t generate an answer.";

    return NextResponse.json({ answer, sources });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Server error processing request" },
      { status: 500 }
    );
  }
}
