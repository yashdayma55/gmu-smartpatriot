// src/server/scrapeGmu.ts
import * as cheerio from "cheerio";

const MS_CS_CATALOG_URL =
  "https://catalog.gmu.edu/colleges-schools/engineering-computing/school-computing/computer-science/computer-science-ms/";
const CS_COURSES_URL =
  "https://catalog.gmu.edu/courses/cs/"; // GMU CS course listing page

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

/**
 * Get a big chunk of text describing MS CS requirements from the catalog.
 * We keep it simple: grab the main content area and strip extra whitespace.
 */
export async function getMsCsRequirementsText(): Promise<string> {
  const html = await fetchHtml(MS_CS_CATALOG_URL);
  const $ = cheerio.load(html);

  // These selectors may need tweaking after you inspect the page,
  // but this will at least grab the main body text.
  const main =
    $("main").text() ||
    $(".page-content").text() ||
    $("#content").text() ||
    $("body").text();

  return main.replace(/\s+/g, " ").trim();
}

/**
 * Extract the description for a specific CS course (e.g., "CS 583")
 * from the CS course listing page.
 */
export async function getCourseDescription(
  courseCode: string
): Promise<string | null> {
  const html = await fetchHtml(CS_COURSES_URL);
  const $ = cheerio.load(html);

  // Normalize course code like "CS 583"
  const normalized = courseCode.toUpperCase().replace(/\s+/, " ");

  // The catalog usually has headings like "CS 583: Title"
  // We'll search for any element containing that code and grab
  // its nearby text.
  let foundText: string | null = null;

  $("*").each((_, elem) => {
    const text = $(elem).text().trim();
    if (!text) return;

    if (text.toUpperCase().startsWith(normalized)) {
      // Grab this element + its siblings in the course block
      const blockText = $(elem)
        .parent()
        .text()
        .replace(/\s+/g, " ")
        .trim();
      foundText = blockText;
      return false; // break out of .each
    }
  });

  if (!foundText) {
    // Fallback: just return the whole page text if nothing matches
    const all = $("main").text() || $("body").text();
    return all ? all.replace(/\s+/g, " ").trim() : null;
  }

  return foundText;
}

export const GMU_SOURCE_URLS = {
  msCsCatalog: MS_CS_CATALOG_URL,
  csCourses: CS_COURSES_URL,
};
