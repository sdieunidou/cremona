/** Catalog search for the command palette and the not-found page. */
import { catalog, hasBlock, type CatalogGroup, type CatalogItem } from "./discovery.js";

export interface SearchHit {
  key: string;
  group: CatalogGroup;
  item: CatalogItem;
  score: number;
}

export function queryWords(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** "buttons" also looks for "button" (conservative: "status" stays "status"). */
function spellings(word: string): string[] {
  if (word.length <= 3 || /(ss|us|is)$/.test(word) || !word.endsWith("s")) return [word];
  return [word, word.endsWith("ies") ? `${word.slice(0, -3)}y` : word.slice(0, -1)];
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** 1 for a whole word (or its plural), 0.5 for the start of a longer word, 0 otherwise. */
function wordMatch(text: string, word: string): number {
  const w = escape(word);
  if (new RegExp(`(^|[^a-z0-9])${w}(e?s)?([^a-z0-9]|$)`).test(text)) return 1;
  return new RegExp(`(^|[^a-z0-9])${w}`).test(text) ? 0.5 : 0;
}

function scoreWord(group: CatalogGroup, item: CatalogItem, word: string): number {
  const name = item.name.toLowerCase();
  return Math.max(
    ...spellings(word).map(
      (w) =>
        (name === w || item.file === w ? 20 : 10 * wordMatch(name, w)) +
        5 * wordMatch(item.file, w) +
        3 * wordMatch(group.category.toLowerCase(), w) +
        2 * wordMatch(item.description.toLowerCase(), w),
    ),
  );
}

/** Blocks matching every word of the query, best first (names before descriptions). */
export function searchCatalog(query: string): SearchHit[] {
  const words = queryWords(query);
  if (words.length === 0) return [];
  const hits: SearchHit[] = [];
  for (const group of catalog) {
    for (const item of group.items) {
      const key = `${group.slug}/${item.file}`;
      if (!hasBlock(key)) continue;
      let score = 0;
      for (const word of words) {
        const s = scoreWord(group, item, word);
        if (s === 0) {
          score = 0;
          break;
        }
        score += s;
      }
      if (score > 0) hits.push({ key, group, item, score });
    }
  }
  return hits.sort((a, b) => b.score - a.score);
}
