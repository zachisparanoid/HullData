"use client";

import Link from "next/link";
import { Anchor, AlertTriangle, ArrowRight, Layers } from "lucide-react";
import { useExplorerStore } from "@/store/useExplorerStore";
import { countryFlag } from "@/lib/flags";
import { CURRENT_YEAR } from "@/lib/types";
import Thumbnail from "@/components/Thumbnail";
import EmptyState from "@/components/EmptyState";

function spanLabel(min: number | null, max: number | null): string {
  if (min == null || max == null) return "—";
  return `${min}–${max >= CURRENT_YEAR ? "present" : max}`;
}

function CardSkeleton() {
  return (
    <div className="panel overflow-hidden">
      <div className="aspect-[16/9] animate-pulse bg-surface-2" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}

export default function WelcomeScreen({
  onSelect,
}: {
  onSelect: (slug: string) => void;
}) {
  const manufacturers = useExplorerStore((s) => s.manufacturers);
  const status = useExplorerStore((s) => s.manufacturersStatus);
  const error = useExplorerStore((s) => s.manufacturersError);
  const reload = useExplorerStore((s) => s.loadManufacturers);

  const totalModels = manufacturers.reduce((a, m) => a + m.modelCount, 0);
  const countries = new Set(manufacturers.map((m) => m.country)).size;

  return (
    <div className="mx-auto max-w-[1700px] px-4 py-10">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent ring-1 ring-accent/30">
          <Anchor className="h-7 w-7" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          The powerboat reference library
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-balance text-sm leading-relaxed text-muted">
          Pick a builder and read every model it made — motor yachts, trawlers,
          sportfishers, express cruisers, and center consoles — with full,
          scannable specifications. Filter by length, power, year, and hull, all
          instantly.
        </p>
        {status === "ready" && manufacturers.length > 0 && (
          <div className="num mt-5 flex items-center justify-center gap-5 text-xs text-muted">
            <span>
              <span className="font-semibold text-ink">
                {manufacturers.length}
              </span>{" "}
              builders
            </span>
            <span className="text-line">·</span>
            <span>
              <span className="font-semibold text-ink">{totalModels}</span>{" "}
              models
            </span>
            <span className="text-line">·</span>
            <span>
              <span className="font-semibold text-ink">{countries}</span>{" "}
              countries
            </span>
          </div>
        )}

        {/* Cross-builder entry point */}
        <div className="mt-7 flex flex-col items-center gap-2">
          <Link
            href="/explore"
            className="focus-ring group inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#06231f] shadow-glow transition-colors hover:bg-accent-strong"
          >
            <Layers className="h-4 w-4" />
            Search across all {manufacturers.length || 57} builders
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="text-xs text-muted">
            Filter the whole catalog at once · compare up to four boats side by
            side
          </p>
        </div>
      </div>

      {/* Card grid */}
      <div className="mx-auto mt-10 max-w-[1500px]">
        {status === "error" ? (
          <EmptyState
            tone="danger"
            icon={<AlertTriangle className="h-7 w-7" />}
            title="Couldn't load the library"
            description={error ?? "Something went wrong fetching manufacturers."}
            action={
              <button
                type="button"
                onClick={() => void reload()}
                className="focus-ring rounded-lg bg-accent px-4 py-2 text-sm font-medium text-[#06231f] transition-colors hover:bg-accent-strong"
              >
                Try again
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {status !== "ready"
              ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
              : manufacturers.map((m) => (
                  <button
                    key={m.slug}
                    type="button"
                    onClick={() => onSelect(m.slug)}
                    className="group panel overflow-hidden text-left transition-all hover:border-accent/40 hover:shadow-glow focus-ring"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden border-b border-line bg-surface-2">
                      <Thumbnail
                        src={m.sampleImageUrl}
                        alt={m.name}
                        category="MOTOR_YACHT"
                        fill
                        sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-display font-semibold text-ink transition-colors group-hover:text-accent">
                          {m.name}
                        </h3>
                        <span className="shrink-0 text-base leading-none">
                          {countryFlag(m.country)}
                        </span>
                      </div>
                      <p className="num mt-1 text-xs text-muted">
                        {m.modelCount} models · {spanLabel(m.yearMin, m.yearMax)}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted/80">
                        {m.description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                        Explore catalog
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </button>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}
