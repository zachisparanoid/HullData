// Data-driven brand-image harvester. Pulls every manufacturer that lacks a real
// brand photo from the live API, then drives the REAL Google Chrome (headful,
// Xvfb, light stealth) over each builder's homepage, auto-picks the best real
// photograph (excluding CGI renders, interiors, logos, and sailboats), and
// downloads it to public/brands/<slug>.<ext>.
//
// Run:  xvfb-run -a node scripts/harvest-brands.mjs
import { writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
const RENDER = /(rendering|\/profile|modelsnav|profileblue|_index|configurator|sketch|line-?drawing|silhouette|\bcad\b)/i;
const BAD = /(logo|favicon|sprite|\bicon|placeholder|thumbnail|interior|salon|\bhelm\b|galley|stateroom|cockpit-seat|spinner|loading|brochure|award|badge|\bmap\b|dealer|header-bg|pattern)/i;
const SAIL = /(oceanis|\bfirst[-\s]?\d|sailboat|\bsail\b|sloop|ketch|\bmonohull\b)/i;

const mans = await fetch("http://localhost:8200/api/manufacturers").then((r) => r.json());
const targets = mans.filter((m) => m.website && !(m.logoUrl && m.logoUrl.startsWith("/brands/")));
console.log(`Harvesting brand photos for ${targets.length} builders...\n`);

const ctx = await chromium.launchPersistentContext("/tmp/hd-brands-profile", {
  channel: "chrome",
  headless: false,
  viewport: { width: 1440, height: 900 },
  userAgent: UA,
  args: ["--disable-blink-features=AutomationControlled", "--no-sandbox", "--disable-dev-shm-usage"],
});
await ctx.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
  // @ts-ignore
  window.chrome = { runtime: {} };
});

async function collect(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 130));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
  return page.evaluate(() => {
    const out = [];
    const seen = new Set();
    const push = (src, w, h) => {
      if (src && /^https?:/.test(src) && !seen.has(src)) {
        seen.add(src);
        out.push({ src, w: Math.round(w) || 0, h: Math.round(h) || 0 });
      }
    };
    document.querySelectorAll("img").forEach((i) => push(i.currentSrc || i.src, i.naturalWidth, i.naturalHeight));
    document.querySelectorAll("*").forEach((el) => {
      const m = getComputedStyle(el).backgroundImage.match(/url\(["']?(https?:[^"')]+)/);
      if (m) {
        const r = el.getBoundingClientRect();
        push(m[1], r.width, r.height);
      }
    });
    document.querySelectorAll("video[poster]").forEach((v) => push(v.poster, v.videoWidth || 1280, v.videoHeight || 720));
    const og = document.querySelector('meta[property="og:image"]')?.content;
    if (og) push(og, 1200, 630);
    return out;
  });
}

const report = [];
for (const m of targets) {
  const page = await ctx.newPage();
  let line = `${m.slug.padEnd(16)}`;
  try {
    await page.goto(m.website, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2200);
    const title = await page.title();
    if (/access denied|forbidden|attention required|just a moment/i.test(title)) {
      line += " ⚠ blocked";
    } else {
      const cands = (await collect(page))
        .filter((c) => c.w >= 900 && c.h >= 500 && c.w / c.h >= 1.35 && c.w / c.h <= 2.4)
        .filter((c) => !RENDER.test(c.src) && !BAD.test(c.src) && !SAIL.test(c.src))
        .sort((a, b) => b.w * b.h - a.w * a.h);
      const pick = cands[0];
      if (pick) {
        const res = await fetch(pick.src, { headers: { "User-Agent": UA } });
        const ext = EXT[(res.headers.get("content-type") || "").split(";")[0]] || "jpg";
        writeFileSync(`public/brands/${m.slug}.${ext}`, Buffer.from(await res.arrayBuffer()));
        line += ` ✓ ${pick.w}x${pick.h} ${ext}`;
      } else {
        line += " — no suitable photo";
      }
    }
  } catch (e) {
    line += ` ✗ ${String(e).slice(0, 40)}`;
  } finally {
    await page.close();
  }
  console.log(line);
  report.push(line);
}
await ctx.close();
writeFileSync("/tmp/harvest-brands-report.txt", report.join("\n"));
console.log("\n✅ done");
