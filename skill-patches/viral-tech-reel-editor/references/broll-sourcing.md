# B-roll / Proof Sourcing — Prove, Clarify, Intensify

Every proof visual must answer: "what spoken claim does this prove or clarify?" If the answer is "none", it's filler — cut it.

## Automatic mode (DEFAULT — no-ask, tool-wired)

B-roll resolves automatically. For every beat that needs a proof visual, walk the sourcing ladder below WITHOUT asking the user per-insert. Only pause and escalate when: (a) third-party footage has unclear rights and cannot be recreated, (b) proving the claim would require fabricating data/benchmarks/product behavior, or (c) a recording would leak private/unsafe content. Everything else is decided and executed by the agent and logged to `source-notes.md`.

**Per-beat algorithm** — stop at the first rung that yields a precisely contextual asset; cheaper/owned rungs always come before paid generation:

1. Owned footage the user supplied → extract a presenter-free moment (product UI, demo, cursor, terminal, before/after).
2. Official / press asset → auto-fetch from the company newsroom or product page (Firecrawl `scrape`, or browser-harness for JS-heavy pages). Prefer the original source over re-uploads.
3. Contextual free stock → auto-search & download from Pexels / Pixabay / Coverr / Mixkit ONLY when a clip depicts the exact subject discussed. Fetch via Firecrawl/browser (or a Pexels/Pixabay free API key if configured). Generic mood footage stays banned (see Hard rules).
4. Recreate → rebuild the screen/UI as a stylized HyperFrames HTML mock or an imagegen still; or draw the mechanism as a diagram (≤4 labeled nodes per mobile screen).
5. AI-generate → Higgsfield MCP `generate_video` / `generate_image` (or `imagegen`) for invisible concepts (architecture, data flow, scale) or when no real/contextual asset exists. Tag AI-generated segments per platform disclosure.

**Tool wiring** (ready unless noted):

| Rung | Tool | Setup |
|---|---|---|
| Official / stock fetch | Firecrawl (`FIRECRAWL_API_KEY`) + browser-harness | key already set |
| Contextual stock (optional, more reliable) | Pexels / Pixabay free API | one-time free key |
| Recreate UI / still | HyperFrames (HTML) / imagegen | ready |
| AI-generate shot | Higgsfield MCP `generate_video` / `generate_image` | ready (credit-based) |

**Cost discipline (hybrid)**: owned → official → free stock → recreate are free/cheap and are ALWAYS tried before paid AI generation. AI generation fills genuine gaps only, and its share of runtime stays within `CINEMATIC_RATIO` from the Edit Profile. Every auto-fetched or generated asset: log it to `source-notes.md` (range | asset | origin/URL or prompt+model | license), run the presenter-leak scan, and match the reel's LUT/grain before it goes in.

## Sourcing ladder (try in order)

1. **User-provided footage**: promo videos, screen recordings, product shots supplied by the user. Extract presenter-free moments: product UI, feature demos, cursor actions, terminal output, app screens, before/after. Skip any moment containing a presenter or unrelated human unless explicitly requested.
2. **Official press/brand assets**: press kits, official product pages, launch videos published for media use. Prefer original sources (company newsroom) over re-uploads. Log origin + license in `source-notes.md`.
2b. **Free license-clear stock — only when GENUINELY contextual**: when no owned/official footage exists, search the web for a free clip that precisely visualizes the spoken claim (Pexels, Pixabay, Coverr, Mixkit video). It must depict the exact subject being discussed; generic mood footage (clouds, corridors, city timelapse, "person at laptop") is NOT contextual and is banned. Log origin + license.
3. **Recorded demos**: when the viewer needs to see the workflow, record it — capture ONLY the relevant app/window or crop tightly. Never include the whole desktop, notifications, private files, API keys, tokens, emails, or unrelated tabs. Pre-flight: clean test account/profile, demo data, hidden bookmarks bar. Use cursor highlight; 60fps for smooth UI motion.
4. **Recreated UI / diagrams**: when real footage doesn't exist or can't be shown — rebuild the screen as a clearly stylized mock (HyperFrames HTML or imagegen still), or draw the mechanism as a diagram (max 4 labeled nodes per mobile screen). Never pass a recreation off as real footage.
5. **Generated proof** (cinematic-3d.md): for invisible concepts only (architectures, data flow, scale comparisons) — never to fabricate events, benchmarks, or product behavior.

## Hard rules

- No random or mood stock b-roll, ever (handshakes, server racks, "hacker in hoodie", generic typing, clouds, corridors, city/sky timelapses). If a viewer can't say "this shows exactly what he just said", it's filler — reject it.
- Build the b-roll plan ON the beat map: every insert is tied to a specific sentence/keyword. An insert with no matching spoken claim does not go in.
- Short transformative excerpts of third-party footage only with clear sourcing (on-screen source card) and only when commentary/critique genuinely needs them; prefer official assets and own recordings. When in doubt about rights — recreate instead.
- Each insert 1.5–4s; b-roll never outlives the sentence it proves.
- Presenter-leak scan: every extracted clip must be frame-checked at its IN and OUT points (and any internal cut) — if the original tech-video's presenter appears even for one frame, trim or re-pick. A momentary speaker leak is a QA fail.
- Maintain a `source-notes.md` per project: `timestamp range | asset file | origin/URL or prompt+model | license note`.
- Match every insert to the reel's LUT/grain; mismatch reads as template paste.

## Placement grammar

- Full-frame insert for strong proof (the demo IS the point); host returns within 4s.
- PiP/split for "watch me + watch it" moments (layout rules in captions-layout.md).
- Picture-in-picture of the host over a full-screen demo for tutorials >20s of screen time — keeps the human anchor.
- Insert lands on or 100–150ms BEFORE the spoken noun it proves (anticipation feels intentional; lag feels broken).
