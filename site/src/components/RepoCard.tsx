import { useEffect, useRef, useState } from "react";
import type { GNode } from "../types";

function render(s: string): string {
  return s
    .replace(
      /[&<>]/g,
      (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[m] || m,
    )
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export default function RepoCard({
  repo,
  color,
  fmt,
}: {
  repo: GNode;
  color: string;
  fmt: (n: number) => string;
}) {
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);
  const pRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = pRef.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight + 2);
  }, []);

  return (
    <div
      className="group flex flex-col rounded-lg border border-white/[0.08] bg-white/[0.015] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.03]"
      style={{ borderTopColor: color + "55" }}
    >
      <div className="flex items-start justify-between gap-3">
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold leading-snug text-champagne hover:underline"
        >
          {repo.label}
        </a>
        {repo.stars > 0 && (
          <span className="shrink-0 font-mono text-xs text-gold">
            ★ {fmt(repo.stars)}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: color }}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
          {repo.category}
        </span>
      </div>
      <p
        ref={pRef}
        className={`mt-3 text-[13.5px] leading-relaxed text-body ${open ? "" : "line-clamp-3"}`}
        dangerouslySetInnerHTML={{ __html: render(repo.desc) }}
      />
      <div className="mt-3 flex items-center justify-between pt-1">
        {clamped ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-xs font-medium text-brandcyan hover:underline"
          >
            {open ? "ნაკლები" : "ვრცლად"}
          </button>
        ) : (
          <span />
        )}
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-faint transition-colors group-hover:text-champagne"
        >
          GitHub ↗
        </a>
      </div>
    </div>
  );
}
