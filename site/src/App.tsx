import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import RepoCard from "./components/RepoCard";
import type { GraphData, GNode } from "./types";

// 3D hero is heavy (Three.js) — code-split so the catalog paints fast.
const Hero3D = lazy(() => import("./components/Hero3D"));

const REPO_URL =
  "https://github.com/tornikebolokadze1-cyber/awesome-ai-pulse-georgia";

function fmt(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "K";
  return "" + n;
}

function Chip({
  label,
  count,
  color,
  on,
  onClick,
}: {
  label: string;
  count: number;
  color?: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] transition-colors ${
        on
          ? "border-transparent bg-champagne text-ink"
          : "border-white/10 text-body hover:border-white/20 hover:text-champagne"
      }`}
    >
      {color && !on && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: color }}
        />
      )}
      <span className="whitespace-nowrap">{label}</span>
      <span
        className={`font-mono text-[11px] ${on ? "text-ink/60" : "text-faint"}`}
      >
        {count}
      </span>
    </button>
  );
}

export default function App() {
  const [data, setData] = useState<GraphData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/graph.json`)
      .then((r) => {
        if (!r.ok) throw new Error("graph load failed");
        return r.json();
      })
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, []);

  const repos = useMemo(
    () => (data ? data.nodes.filter((n) => !n.isHub) : []),
    [data],
  );
  const catColor = useMemo(() => {
    const m: Record<string, string> = {};
    data?.categories.forEach((c) => (m[c.id] = c.color));
    return m;
  }, [data]);
  const catLabel = useMemo(() => {
    const m: Record<string, string> = {};
    data?.categories.forEach((c) => (m[c.id] = c.label));
    return m;
  }, [data]);
  const totalStars = useMemo(
    () => repos.reduce((s, r) => s + (r.stars || 0), 0),
    [repos],
  );

  if (err)
    return (
      <div className="p-10 font-mono text-sm text-coolgray">
        ჩატვირთვა ვერ მოხერხდა: {err}
      </div>
    );
  if (!data)
    return (
      <div className="grid min-h-screen place-items-center font-mono text-sm text-coolgray">
        იტვირთება…
      </div>
    );

  const q = query.trim().toLowerCase();
  const matches = (r: GNode) =>
    !q ||
    (r.label + " " + r.desc + " " + (catLabel[r.category] || ""))
      .toLowerCase()
      .includes(q);
  const visibleCats = data.categories.filter(
    (c) => activeCat === "all" || activeCat === c.id,
  );
  const shownCount = repos.filter(
    (r) => matches(r) && (activeCat === "all" || r.category === activeCat),
  ).length;

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="grid h-[88vh] min-h-[560px] place-items-center bg-ink font-mono text-sm text-coolgray">
            იტვირთება…
          </div>
        }
      >
        <Hero3D
          stats={{
            repos: repos.length,
            cats: data.categories.length,
            stars: totalStars,
          }}
          onEnter={() =>
            document
              .getElementById("catalog")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        />
      </Suspense>

      <header
        id="catalog"
        className="sticky top-0 z-30 border-b border-white/[0.08] bg-ink/85 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <a
            href="#catalog"
            className="flex shrink-0 items-center gap-2 font-mono text-[13px] tracking-wide text-champagne"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brandcyan" />
            AI&nbsp;PULSE&nbsp;GEORGIA
          </a>
          <div className="flex flex-1 items-center justify-end gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ძებნა — სახელი ან აღწერა…"
              aria-label="ძებნა"
              className="w-full max-w-xs rounded-md border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-champagne outline-none transition-colors placeholder:text-faint focus:border-brandcyan"
            />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden shrink-0 rounded-md border border-white/12 px-3.5 py-2 text-sm text-body transition-colors hover:text-champagne sm:inline-block"
            >
              GitHub ↗
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-6xl overflow-x-auto px-5 pb-3">
          <div className="flex gap-2">
            <Chip
              label="ყველა"
              count={repos.length}
              on={activeCat === "all"}
              onClick={() => setActiveCat("all")}
            />
            {data.categories.map((c) => (
              <Chip
                key={c.id}
                label={c.label}
                count={c.count}
                color={c.color}
                on={activeCat === c.id}
                onClick={() => setActiveCat(c.id)}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-12">
        {visibleCats.map((c) => {
          const items = repos
            .filter((r) => r.category === c.id && matches(r))
            .sort((a, b) => b.stars - a.stars);
          if (!items.length) return null;
          return (
            <section key={c.id} className="mb-14 scroll-mt-32">
              <div className="mb-5 flex items-center gap-3 border-b border-white/[0.08] pb-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: c.color }}
                />
                <h2 className="font-serif text-xl font-semibold text-champagne">
                  {c.label}
                </h2>
                <span className="font-mono text-xs text-faint">
                  {items.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((r) => (
                  <RepoCard
                    key={r.id}
                    repo={{
                      ...r,
                      category: catLabel[r.category] || r.category,
                    }}
                    color={catColor[r.category]}
                    fmt={fmt}
                  />
                ))}
              </div>
            </section>
          );
        })}
        {shownCount === 0 && (
          <div className="py-24 text-center text-coolgray">
            ვერაფერი მოიძებნა — სცადე სხვა საძიებო სიტყვა ან კატეგორია.
          </div>
        )}
      </main>

      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-faint">
          <span>AI Pulse Georgia · ღია, ხელით შერჩეული AI კოლექცია</span>
          <div className="flex gap-5">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-champagne"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@aipulsegeorgia/mcp-server"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-champagne"
            >
              MCP / CLI
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
