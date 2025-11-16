// src/app/page.tsx
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { PatriotAvatar, MascotMode } from "@/components/PatriotAvatar";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Source = {
  label: string;
  title: string;
  url: string;
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello, I’m Patriot, a prototype GMU assistant. Ask me about programs, courses, deadlines, or offices at George Mason University.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastSources, setLastSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [mascotMode, setMascotMode] = useState<MascotMode>("idle");
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setError(null);

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsSending(true);
    setLastSources([]);
    setMascotMode("thinking");

    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history: newMessages,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong.");
        setIsSending(false);
        setMascotMode("idle");
        return;
      }

      const data = (await res.json()) as {
        answer: string;
        sources: Source[];
      };

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setLastSources(data.sources || []);
      setIsSending(false);

      setMascotMode("speaking");
      speakTimeoutRef.current = setTimeout(() => {
        setMascotMode("idle");
      }, 1600);
    } catch (err) {
      console.error(err);
      setError("Network error talking to the assistant.");
      setIsSending(false);
      setMascotMode("idle");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col">
      {/* GMU-style top banner */}
      <div className="w-full bg-[#006633] text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-sm bg-[#FFCC33] flex items-center justify-center text-[#006633] font-bold text-sm">
              GMU
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide">
                George Mason University
              </span>
              <span className="text-[0.7rem] text-emerald-50">
                Prototype – Not an official GMU tool
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[0.75rem]">
            <span className="hover:underline cursor-default"></span>
            <span className="hover:underline cursor-default"></span>
            <span className="hover:underline cursor-default">
              
            </span>
          </div>
        </div>
      </div>

      {/* Sub-header like an internal tool page */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              GMU Assistant – Patriot
            </h1>
            <p className="text-xs text-slate-500">
              Ask questions about George Mason University. Answers are based on
              GMU web pages and should be verified with official offices.
            </p>
          </div>
        
        </div>
      </header>

      {/* Main content area */}
      <section className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chat card */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-slate-200 bg-white flex flex-col h-[70vh] sm:h-[75vh]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-md px-3 py-2 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-[#006633] text-white"
                          : "bg-slate-50 text-slate-800 border border-slate-200"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex justify-start">
                    <div className="max-w-[60%] rounded-md px-3 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#006633] animate-ping" />
                      <span>Patriot is reviewing GMU pages…</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-2 text-xs text-red-500">{error}</div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Sources */}
              {lastSources.length > 0 && (
                <div className="border-t border-slate-200 px-4 py-3 text-xs bg-slate-50">
                  <div className="font-semibold mb-1 text-slate-800">
                    Sources (official GMU pages):
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {lastSources.map((s, i) => (
                      <li key={i}>
                        <span className="font-medium">{s.label}: </span>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-[#006633] hover:text-[#004826]"
                        >
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="border-t border-slate-200 p-3 flex gap-2 items-center bg-slate-50"
              >
                <input
                  className="flex-1 bg-[#F4F8F6] border border-[#006633] rounded-md px-3 py-2 
                             text-sm text-slate-800 placeholder:text-slate-500
                             focus:ring-1 focus:ring-[#006633] focus:border-[#006633] outline-none"
                  placeholder="Ask Patriot about GMU (e.g., MS CS requirements, GTA positions, academic calendar)…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="px-4 py-2 text-sm rounded-md bg-[#006633] text-white font-semibold hover:bg-[#004826] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Patriot sidebar */}
          <div className="lg:col-span-1">
            <PatriotAvatar mode={mascotMode} />
          </div>
        </div>
      </section>
    </main>
  );
}
