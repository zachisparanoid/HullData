import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  Check,
  AlertTriangle,
  ArrowRight,
  BedDouble,
  Waves,
  Truck,
  Route,
  Zap,
  Droplets,
  Ship,
  ClipboardCheck,
  Download,
  type LucideIcon,
} from "lucide-react";
import { CategoryBadge } from "@/components/SpecBadge";
import { CATEGORY_LABELS } from "@/lib/types";
import { CAPABILITIES, type CapabilityKey } from "@/lib/derived";
import {
  GLOSSARY,
  SPEC_KEY,
  CATEGORY_GUIDES,
} from "@/lib/learn";

export const metadata: Metadata = {
  title: "Learn the boats — HullData",
  description:
    "A newcomer's guide to powerboats: what each category is for, how to read a spec sheet, the capability flags HullData derives, and a plain-language glossary.",
};

const CAP_ICON: Record<CapabilityKey, LucideIcon> = {
  liveaboard: BedDouble,
  shoalDraft: Waves,
  trailerable: Truck,
  longRange: Route,
  fast: Zap,
  efficient: Droplets,
  passagemaker: Ship,
};

const TOC = [
  { href: "#categories", label: "Boat categories" },
  { href: "#capabilities", label: "Capability flags" },
  { href: "#spec-key", label: "Reading the spec sheet" },
  { href: "#glossary", label: "Glossary" },
];

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent ring-1 ring-accent/30">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          Learn the boats
        </h1>
        <p className="mx-auto mt-3 text-balance text-sm leading-relaxed text-muted">
          New to powerboats? Start here. What each kind of boat is actually for,
          how to read the numbers, and the words you&apos;ll keep running into —
          in plain language.
        </p>
      </div>

      {/* Table of contents */}
      <nav className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-2">
        {TOC.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className="focus-ring rounded-full border border-line bg-surface-2/50 px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink"
          >
            {t.label}
          </a>
        ))}
      </nav>

      {/* Categories */}
      <section id="categories" className="mt-14 scroll-mt-20">
        <h2 className="font-display text-2xl font-bold text-ink">
          The kinds of powerboat
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          Six families of powerboat, what each does best, and the trade-offs to
          weigh. HullData is trawler-heavy by design — so that&apos;s where we
          start.
        </p>

        <div className="mt-6 space-y-4">
          {CATEGORY_GUIDES.map((g) => (
            <article key={g.category} className="panel p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <CategoryBadge value={g.category} />
                <h3 className="font-display text-lg font-semibold text-ink">
                  {CATEGORY_LABELS[g.category]}
                </h3>
              </div>
              <p className="mt-1 text-sm font-medium text-accent">
                {g.tagline}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {g.whatItIs}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                    Best for
                  </p>
                  <ul className="space-y-1.5">
                    {g.bestFor.map((b) => (
                      <li key={b} className="flex gap-2 text-sm text-ink">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <span className="text-muted">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                    What to watch for
                  </p>
                  <ul className="space-y-1.5">
                    {g.watchFor.map((w) => (
                      <li key={w} className="flex gap-2 text-sm text-ink">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                        <span className="text-muted">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href={`/explore`}
                className="focus-ring mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
              >
                Browse {CATEGORY_LABELS[g.category].toLowerCase()} models
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Capability flags */}
      <section id="capabilities" className="mt-14 scroll-mt-20">
        <h2 className="font-display text-2xl font-bold text-ink">
          Capability flags
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          HullData reads each boat&apos;s specs and tags what it&apos;s suited
          for. You&apos;ll see these on the detail panel, and you can filter the
          whole catalog by them on the{" "}
          <Link href="/explore" className="text-accent hover:underline">
            Explore
          </Link>{" "}
          page.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {CAPABILITIES.map((c) => {
            const Icon = CAP_ICON[c.key];
            return (
              <div
                key={c.key}
                className="panel flex gap-3 p-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/25">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{c.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    {c.why}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reading the spec sheet */}
      <section id="spec-key" className="mt-14 scroll-mt-20">
        <h2 className="font-display text-2xl font-bold text-ink">
          Reading the spec sheet
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          What every column in the table actually tells you.
        </p>

        <dl className="mt-6 overflow-hidden rounded-xl border border-line">
          {SPEC_KEY.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4 ${
                i % 2 ? "bg-surface" : "bg-surface-2/40"
              }`}
            >
              <dt className="shrink-0 font-display text-sm font-semibold text-ink sm:w-48">
                {s.label}
              </dt>
              <dd className="text-sm leading-relaxed text-muted">{s.def}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Glossary */}
      <section id="glossary" className="mt-14 scroll-mt-20">
        <h2 className="font-display text-2xl font-bold text-ink">Glossary</h2>
        <p className="mt-1.5 text-sm text-muted">
          The vocabulary, decoded.
        </p>

        <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {GLOSSARY.map((g) => (
            <div key={g.term}>
              <dt className="font-display text-sm font-semibold text-ink">
                {g.term}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">
                {g.def}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* HullCheck integration */}
      <section className="mt-14 rounded-xl border border-line bg-surface-2/30 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/25">
            <ClipboardCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-ink">
              Found a boat? Survey it with HullCheck.
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Open any boat and choose{" "}
              <span className="font-medium text-ink">
                Start a survey in HullCheck
              </span>{" "}
              to download a project file — pre-filled make, model, type, length,
              and seed notes, plus the standard 120-point survey checklist —
              ready to import into HullCheck, the 100% offline marine survey app.
            </p>
            <a
              href="/api/hullcheck/boat-picker"
              download="hullcheck-boat-picker.json"
              className="focus-ring mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
            >
              Download the full boat-picker dataset (JSON)
              <Download className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <div className="mt-12 flex flex-col items-center gap-3 border-t border-line pt-10 text-center">
        <p className="text-sm text-muted">
          Ready to put it to use?
        </p>
        <Link
          href="/explore"
          className="focus-ring group inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#06231f] shadow-glow transition-colors hover:bg-accent-strong"
        >
          Explore every builder
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
