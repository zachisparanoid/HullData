// Per-model photos via DuckDuckGo image search (plain fetch — no browser).
// DDG returns the full source-image URL + dimensions, so we filter to landscape
// non-interior photos before downloading. Resumable (skips existing). Verify by
// eye + prune afterward.
//
// Run:  node scripts/harvest-models-ddg.mjs   (needs network; run unsandboxed)
import { writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
const SKIP = /(interior|galley|\bhelm\b|kitchen|berth|stateroom|\bengine|sundeck|cabin|oceanis|sloop|ketch|cutter|brochure|drawing|render|\blogo\b|burgee|chart|\bmap\b|diagram|layout|floorplan)/i;
const key = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function vqdFor(q) {
  const html = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(q)}&iax=images&ia=images`, { headers: { "User-Agent": UA } }).then((r) => r.text());
  return (html.match(/vqd=["']?([\d-]+)/) || [])[1] || (html.match(/"vqd":"([^"]+)"/) || [])[1] || null;
}
async function ddgImages(q) {
  const vqd = await vqdFor(q);
  if (!vqd) return null; // null = likely blocked
  const j = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(q)}&vqd=${vqd}&f=,,,,,&p=1`, {
    headers: { "User-Agent": UA, Referer: "https://duckduckgo.com/", Accept: "application/json, text/javascript, */*; q=0.01", "X-Requested-With": "XMLHttpRequest" },
  }).then((r) => r.json()).catch(() => null);
  return j?.results || [];
}

const summaries = await fetch("http://localhost:8200/api/manufacturers").then((r) => r.json());
const builders = [];
for (const s of summaries) {
  const cat = await fetch(`http://localhost:8200/api/manufacturers/${s.slug}`).then((r) => r.json());
  builders.push({ slug: s.slug, make: s.name.replace(/\s*\(.*?\)\s*/g, "").trim(), models: cat.models.map((m) => ({ name: m.name, key: key(m.name) })) });
}

let got = 0, attempted = 0;
for (const b of builders) {
  const dir = `public/boats/${b.slug}`;
  const existing = new Set(existsSync(dir) ? readdirSync(dir).map((f) => f.replace(/\.[^.]+$/, "")) : []);
  let bgot = 0, battempt = 0;
  for (const m of b.models) {
    if (existing.has(m.key)) continue;
    battempt++; attempted++;
    const fw = b.make.toLowerCase().split(/\s+/)[0];
    const q = m.name.toLowerCase().includes(fw) ? `${m.name} boat` : `${b.make} ${m.name} boat`;
    let results = await ddgImages(q);
    if (results === null) { await sleep(12000); results = await ddgImages(q); } // cool down if blocked
    const cands = (results || []).filter((r) => r.image && r.width >= 700 && r.width / r.height >= 1.1 && r.width / r.height <= 2.7 && !SKIP.test(`${r.title} ${r.image}`.toLowerCase()));
    for (const c of cands.slice(0, 6)) {
      try {
        const res = await fetch(c.image, { headers: { "User-Agent": UA, Referer: "https://duckduckgo.com/" }, signal: AbortSignal.timeout(12000) });
        if (!res.ok) continue;
        const ext = EXT[(res.headers.get("content-type") || "").split(";")[0]];
        if (!ext) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 30000) continue;
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        writeFileSync(`${dir}/${m.key}.${ext}`, buf);
        got++; bgot++; break;
      } catch {}
    }
    await sleep(1100); // be polite to DDG
  }
  if (battempt) console.log(`${b.slug.padEnd(16)} ${bgot}/${battempt} new   (total ${got})`);
}
console.log(`\n✅ done — ${got}/${attempted} fetched this run`);
