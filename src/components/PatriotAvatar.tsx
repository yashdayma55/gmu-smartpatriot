// src/components/PatriotAvatar.tsx
"use client";

import React from "react";

export type MascotMode = "idle" | "thinking" | "speaking";

interface PatriotAvatarProps {
  mode: MascotMode;
}

export function PatriotAvatar({ mode }: PatriotAvatarProps) {
  const isThinking = mode === "thinking";
  const isSpeaking = mode === "speaking";

  const motionClass =
    mode === "thinking"
      ? "animate-bounce"
      : mode === "speaking"
      ? "animate-pulse"
      : "";

  const statusText = isThinking
    ? "Patriot is thinking about your question…"
    : isSpeaking
    ? "Patriot is answering with details from GMU."
    : "Ask Patriot anything about George Mason University.";

  return (
    <aside className="w-full h-full rounded-lg border border-slate-200 bg-slate-50">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">
          Patriot – GMU Virtual Assistant
        </h2>
        <p className="text-xs text-slate-500">
          Not official advising. Always confirm with GMU offices.
        </p>
      </div>

      <div className="p-4 flex flex-col items-center gap-4">
        {/* Circular avatar */}
        <div
          className={`relative flex items-center justify-center h-28 w-28 rounded-full border border-slate-300 bg-gradient-to-tr from-[#006633]/15 via-white to-[#FFCC33]/20 ${motionClass}`}
        >
          {/* Simple mascot illustration – swap for an image when you have one */}
          <div className="flex flex-col items-center text-slate-900">
            {/* Hat bar */}
            <div className="px-3 py-0.5 rounded-full bg-[#006633] text-[0.6rem] text-white font-semibold mb-1 shadow-sm">
              PATRIOT
            </div>

            {/* Face */}
            <div className="flex flex-col items-center bg-slate-100 rounded-2xl px-3 py-2 border border-slate-300">
              <div className="flex gap-3 mb-1">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                <span className="h-2 w-2 rounded-full bg-slate-900" />
              </div>

              {/* Mouth changes slightly when thinking */}
              <div
                className={`h-3 w-10 border-2 border-slate-900 ${
                  isThinking
                    ? "rounded-t-full border-b-0"
                    : "rounded-full bg-slate-900/80"
                }`}
              />
            </div>

            {/* Small GMU badge */}
            <div className="mt-1 text-[0.6rem] text-[#006633] font-semibold tracking-wide">
              George Mason University
            </div>
          </div>
        </div>

        {/* Status bubble */}
        <div className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2">
          {statusText}
        </div>

        <div className="w-full flex flex-col gap-1 text-[0.65rem] text-slate-500">
          <div className="flex items-center gap-2">
            <span className={isThinking ? "animate-bounce" : ""}>💭</span>
            <span>Uses live GMU web pages when possible.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={isSpeaking ? "animate-bounce" : ""}>📚</span>
            <span>Summarizes catalog, department, and registrar info.</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
