// src/server/searchGmu.ts

type TavilyResult = {
    title: string;
    url: string;
    content: string;
    score?: number;
  };
  
  const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
  if (!TAVILY_API_KEY) {
    console.warn("TAVILY_API_KEY is not set. GMU search will not work.");
  }
  
  // High-value GMU domains get higher weight in ranking
  const DOMAIN_WEIGHTS: Record<string, number> = {
    "catalog.gmu.edu": 3.0,
    "cs.gmu.edu": 3.0,
    "registrar.gmu.edu": 2.8,
    "graduate.gmu.edu": 2.5,
    "housing.gmu.edu": 2.5,
    "financialaid.gmu.edu": 2.3,
    "dining.gmu.edu": 2.0,
    "transportation.gmu.edu": 2.0,
    "students.gmu.edu": 2.0,
    "provost.gmu.edu": 2.0,
    "gmu.edu": 1.0,
  };
  
  function getDomainWeight(url: string): number {
    try {
      const host = new URL(url).hostname.toLowerCase();
      if (DOMAIN_WEIGHTS[host] !== undefined) return DOMAIN_WEIGHTS[host];
  
      // handle subdomains like something.cs.gmu.edu
      const parts = host.split(".");
      for (let i = 0; i < parts.length - 2; i++) {
        const sub = parts.slice(i).join(".");
        if (DOMAIN_WEIGHTS[sub] !== undefined) return DOMAIN_WEIGHTS[sub];
      }
    } catch {
      // ignore parse errors
    }
    return 0.5; // default low weight
  }
  
  function detectCourseCode(question: string): string | null {
    // match patterns like CS 583, SWE645, CYSE 610, etc.
    const match = question.match(/\b([A-Z]{2,4})\s*\d{3}\b/);
    if (!match) return null;
    const prefix = match[1].toUpperCase();
    const number = match[0].match(/\d{3}/)![0];
    return `${prefix} ${number}`;
  }
  
  function isMsCsQuestion(q: string): boolean {
    q = q.toLowerCase();
    return (
      q.includes("ms cs") ||
      q.includes("ms in computer science") ||
      q.includes("master in computer science") ||
      (q.includes("graduate") && q.includes("computer science"))
    );
  }
  
  function isBsCsQuestion(q: string): boolean {
    q = q.toLowerCase();
    return (
      q.includes("bs cs") ||
      q.includes("bs in computer science") ||
      q.includes("bachelor in computer science") ||
      q.includes("undergrad") ||
      q.includes("undergraduate")
    );
  }
  
  function isRegistrarQuestion(q: string): boolean {
    q = q.toLowerCase();
    return (
      q.includes("add/drop") ||
      q.includes("add drop") ||
      q.includes("withdraw") ||
      q.includes("withdrawal") ||
      q.includes("refund") ||
      q.includes("last day") ||
      q.includes("deadline") ||
      q.includes("academic calendar") ||
      q.includes("registration")
    );
  }
  
  function isHousingQuestion(q: string): boolean {
    q = q.toLowerCase();
    return (
      q.includes("housing") ||
      q.includes("dorm") ||
      q.includes("residence hall") ||
      q.includes("campus apartment") ||
      q.includes("room selection")
    );
  }
  
  function isAssistantshipQuestion(q: string): boolean {
    q = q.toLowerCase();
    return (
      q.includes("gta") ||
      q.includes("gra") ||
      q.includes("assistantship") ||
      q.includes("teaching assistant") ||
      q.includes("research assistant")
    );
  }
  
  function isTuitionMoneyQuestion(q: string): boolean {
    q = q.toLowerCase();
    return (
      q.includes("tuition") ||
      q.includes("fees") ||
      q.includes("cost") ||
      q.includes("scholarship") ||
      q.includes("financial aid")
    );
  }
  
  /**
   * Extra path-based weight: make sure CS questions prefer CS pages,
   * and we only like assistantship pages when the question is about GTA/GRA.
   */
  function getPathWeight(url: string, question: string): number {
    let score = 0;
    const qLower = question.toLowerCase();
  
    let path = "";
    let host = "";
    try {
      const u = new URL(url);
      path = u.pathname.toLowerCase();
      host = u.hostname.toLowerCase();
    } catch {
      return 0;
    }
  
    const csQuestion =
      qLower.includes("cs ") ||
      qLower.includes("computer science") ||
      isMsCsQuestion(qLower) ||
      isBsCsQuestion(qLower) ||
      !!detectCourseCode(qLower);
  
    const assistantQ = isAssistantshipQuestion(qLower);
  
    if (csQuestion) {
      // Big boost if it's clearly CS-specific
      if (host === "cs.gmu.edu") score += 3;
      if (path.includes("computer-science")) score += 2;
      if (path.includes("/cs/")) score += 1.5;
      if (path.includes("school-computing")) score += 1;
  
      // Penalize obviously non-CS programs like IT, IS, etc.
      if (path.includes("information-technology")) score -= 2;
      if (path.includes("information-technology-phd")) score -= 3;
      if (path.includes("data-analytics")) score -= 0.5;
  
      // ❗ NEW: if question is NOT about assistantships, penalize assistantship pages
      if (!assistantQ && path.includes("assistant")) {
        // this catches /assistantships/, /graduate-teaching-assistantships/, etc.
        score -= 3;
      }
    }
  
    if (isRegistrarQuestion(qLower)) {
      if (host === "registrar.gmu.edu") score += 3;
      if (path.includes("academic-calendar")) score += 2;
    }
  
    if (isHousingQuestion(qLower)) {
      if (host === "housing.gmu.edu") score += 3;
    }
  
    if (assistantQ) {
      if (host === "cs.gmu.edu" && path.includes("assistant")) score += 4; // strong boost only when relevant
      if (host === "graduate.gmu.edu") score += 2;
    }
  
    if (isTuitionMoneyQuestion(qLower)) {
      if (host === "financialaid.gmu.edu") score += 3;
      if (path.includes("tuition")) score += 1.5;
    }
  
    return score;
  }
  
  /**
   * Build a set of targeted search queries for a GMU question.
   * We will run Tavily on each query and merge results.
   */
  function buildSearchQueries(question: string): string[] {
    const q = question.trim();
    const courseCode = detectCourseCode(q);
    const ms = isMsCsQuestion(q);
    const bs = isBsCsQuestion(q);
    const registrar = isRegistrarQuestion(q);
    const housing = isHousingQuestion(q);
    const assistant = isAssistantshipQuestion(q);
    const money = isTuitionMoneyQuestion(q);
  
    const queries: string[] = [];
  
    // Always: a generic GMU-scoped query
    queries.push(`site:gmu.edu ${q}`);
  
    if (courseCode) {
      queries.push(`site:catalog.gmu.edu "${courseCode}"`);
      queries.push(`site:cs.gmu.edu "${courseCode}"`);
    }
  
    if (ms) {
      queries.push(`site:catalog.gmu.edu "Computer Science, MS"`);
      queries.push(`site:cs.gmu.edu "MS in Computer Science"`);
    }
  
    if (bs) {
      queries.push(`site:catalog.gmu.edu "Computer Science, BS"`);
      queries.push(`site:cs.gmu.edu "BS in Computer Science"`);
    }
  
    if (registrar) {
      queries.push(`site:registrar.gmu.edu ${q}`);
      queries.push(`site:catalog.gmu.edu "academic calendar"`);
    }
  
    if (housing) {
      queries.push(`site:housing.gmu.edu ${q}`);
    }
  
    if (assistant) {
      queries.push(
        `site:cs.gmu.edu "Graduate Teaching Assistantships"`,
        `site:cs.gmu.edu "Graduate Research Assistantships"`,
        `site:graduate.gmu.edu assistantships`
      );
    }
  
    if (money) {
      queries.push(`site:financialaid.gmu.edu ${q}`);
      queries.push(`site:gmu.edu tuition fees`);
    }
  
    // Deduplicate while preserving order
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const s of queries) {
      if (!seen.has(s)) {
        seen.add(s);
        unique.push(s);
      }
    }
    return unique;
  }
  
  async function tavilySearchSingle(
    query: string,
    maxResults: number
  ): Promise<TavilyResult[]> {
    if (!TAVILY_API_KEY) return [];
  
    const body = {
      api_key: TAVILY_API_KEY,
      query,
      max_results: maxResults,
      include_answer: false,
      include_raw_content: true,
    };
  
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  
    if (!res.ok) {
      const text = await res.text();
      console.error("Tavily search error:", res.status, text, "for query:", query);
      return [];
    }
  
    const json = await res.json();
  
    const results: TavilyResult[] =
      json.results?.map((r: any) => ({
        title: r.title as string,
        url: r.url as string,
        content: (r.raw_content || r.content || "") as string,
        score: r.score,
      })) || [];
  
    return results;
  }
  
  /**
   * Main GMU search function.
   * Runs several targeted Tavily queries, merges and ranks the results,
   * and returns the top maxResults items.
   */
  export async function searchGmu(
    question: string,
    maxResults: number = 4
  ): Promise<TavilyResult[]> {
    const queries = buildSearchQueries(question);
  
    const allResults: TavilyResult[] = [];
    const seenUrls = new Set<string>();
  
    for (const q of queries) {
      const results = await tavilySearchSingle(q, 4);
      for (const r of results) {
        if (!r.url) continue;
        if (seenUrls.has(r.url)) continue;
        seenUrls.add(r.url);
        allResults.push(r);
      }
    }
  
    // Rank by Tavily score + domain weight + path weight
    const scored = allResults.map((r) => {
      const domainScore = getDomainWeight(r.url);
      const pathScore = getPathWeight(r.url, question);
      const tavScore = typeof r.score === "number" ? r.score : 0;
      const combined = tavScore + domainScore + pathScore;
      return { ...r, combinedScore: combined };
    });
  
    scored.sort((a, b) => (b.combinedScore ?? 0) - (a.combinedScore ?? 0));
  
    return scored.slice(0, maxResults).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score,
    }));
  }
  