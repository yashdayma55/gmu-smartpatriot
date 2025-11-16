// src/app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { retrieveRelevantChunks } from "@/utils/retrieve";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

function shouldIncludeSourceLink(query: string): boolean {
  const q = query.toLowerCase();

  // You can tweak these trigger words later.
  const triggers = [
    "credit",        // "how many credits", "120 credits"
    "requirement",   // "what are the requirements"
    "catalog",       // "catalog page"
    "link",          // "send me the link"
    "website",       // "what website"
    "page",          // "which page"
    "where can i find",
    "more info",
  ];

  return triggers.some((t) => q.includes(t));
}

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Missing API_KEY" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const message: string = body.message;
    const history: { role: "user" | "assistant"; content: string }[] =
      body.history || [];

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Retrieve GMU undergrad CS context
    const chunks = retrieveRelevantChunks(message, 3);

    const contextText =
      chunks.length > 0
        ? chunks
            .map((c, idx) => {
              const contactsString =
                c.contacts
                  ?.map((ct) => {
                    const parts = [
                      ct.label,
                      ct.email ? `Email: ${ct.email}` : "",
                      ct.phone ? `Phone: ${ct.phone}` : "",
                    ].filter(Boolean);
                    return parts.join(" | ");
                  })
                  .join("\n") ?? "";

              return [
                `Source ${idx + 1}: ${c.title}`,
                c.text,
                contactsString ? `Contacts:\n${contactsString}` : "",
              ]
                .filter(Boolean)
                .join("\n\n");
            })
            .join("\n\n---\n\n")
        : "No specific GMU context was found for this question.";

        const systemPrompt = `
        You are a helpful assistant for George Mason University students, especially those in Computer Science
        at both the undergraduate (BS CS) and graduate (MS CS) levels.
        
        You will be given GMU-related context and a user question.
        
        Rules:
        - Use the provided context as your main source of truth about GMU programs.
        - If the context does NOT clearly answer the question, say you are not completely sure
          and suggest checking the official GMU website (cs.gmu.edu, gmu.edu/programs, the catalog, etc.).
        - ONLY provide email addresses, phone numbers, or other contact details if they explicitly appear
          in the supplied context. NEVER make up or guess contact information.
        - Do NOT include raw URLs or full web links in your answer. The UI will show links separately
          when needed.
        - Do NOT invent precise dates, dollar amounts, or policies that are not clearly stated in the context.
        - Keep answers concise but clear, and structured in short paragraphs or bullet points when helpful.
        `.trim();
        

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      {
        role: "user",
        content: `
Here is some GMU context that may be relevant:

${contextText}

User question: ${message}
        `.trim(),
      },
    ];

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages,
          temperature: 0.3,
        }),
      }
    );

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json(
        { error: "Error calling Groq API" },
        { status: 500 }
      );
    }

    const data = await groqRes.json();
    const answer: string =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    // 2️⃣ Decide whether to include a link below the chat
    const includeSources = shouldIncludeSourceLink(message);
    let sources:
      | { label: string; title: string; url: string }[]
      | [] = [];

    if (includeSources && chunks.length > 0) {
      const top = chunks[0];
      sources = [
        {
          label: "Official GMU page",
          title: top.title,
          url: top.url,
        },
      ];
    }

    return NextResponse.json({
      answer,
      sources,
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Server error processing request" },
      { status: 500 }
    );
  }
}
