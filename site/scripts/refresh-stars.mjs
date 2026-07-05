/**
 * refresh-stars.mjs — read public/data/graph.json, fetch each repo's live
 * stargazers_count from the GitHub REST API, and write the counts back.
 * Runs in CI (daily cron); uses GITHUB_TOKEN for a higher rate limit.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GRAPH = resolve(__dirname, "..", "public", "data", "graph.json");
const TOKEN = process.env.GITHUB_TOKEN;

function slugOf(url) {
  const m = String(url).match(/github\.com\/([^/]+)\/([^/?#]+)/i);
  return m ? `${m[1]}/${m[2].replace(/\.git$/, "")}` : null;
}

async function fetchStars(slug) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "aipulse-graph-refresh" };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  try {
    const res = await fetch(`https://api.github.com/repos/${slug}`, { headers });
    if (!res.ok) return null;
    const j = await res.json();
    return typeof j.stargazers_count === "number" ? j.stargazers_count : null;
  } catch {
    return null;
  }
}

async function mapLimit(items, limit, fn) {
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) await fn(items[i++]);
  });
  await Promise.all(workers);
}

const graph = JSON.parse(readFileSync(GRAPH, "utf-8"));
let changed = 0, errors = 0;

await mapLimit(graph.nodes, 10, async (n) => {
  const slug = slugOf(n.url);
  if (!slug) return;
  const s = await fetchStars(slug);
  if (s == null) { errors++; return; }
  if (s !== n.stars) { n.stars = s; changed++; }
});

if (changed > 0) writeFileSync(GRAPH, JSON.stringify(graph, null, 2) + "\n", "utf-8");
console.log(`Star refresh: ${changed} updated, ${errors} unreachable, ${graph.nodes.length} total.`);
