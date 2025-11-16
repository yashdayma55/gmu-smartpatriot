// src/utils/retrieve.ts

import { KNOWLEDGE_BASE, KnowledgeChunk } from "@/data/gmuKnowledge";

function isGraduateQuery(query: string): boolean {
  const q = query.toLowerCase();
  // You can expand this list if needed
  const gradKeywords = ["ms cs", "ms in computer science", "master", "graduate"];
  return gradKeywords.some((k) => q.includes(k));
}

export function retrieveRelevantChunks(
  query: string,
  topK: number = 3
): KnowledgeChunk[] {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);

  const grad = isGraduateQuery(q);

  // Filter by category if we can infer intent
  const candidates = KNOWLEDGE_BASE.filter((chunk) => {
    const cat = chunk.category.toLowerCase();
    if (grad) {
      // Prefer graduate/MS categories
      return cat.includes("graduate");
    } else {
      // Prefer undergraduate/bs categories by default
      return cat.includes("undergraduate") || !cat.includes("graduate");
    }
  });

  return candidates
    .map((chunk) => {
      const contactStrings =
        chunk.contacts
          ?.map((c) => `${c.label} ${c.email ?? ""} ${c.phone ?? ""}`)
          .join(" ") ?? "";

      const haystack = (
        chunk.text +
        " " +
        chunk.tags.join(" ") +
        " " +
        chunk.title +
        " " +
        chunk.category +
        " " +
        contactStrings
      ).toLowerCase();

      let score = 0;
      for (const w of words) {
        if (haystack.includes(w)) {
          score += 1;
        }
      }

      return { chunk, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.chunk);
}
