"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ExternalLink,
  ArrowRight,
  BedDouble,
  Waves,
  Truck,
  Route,
  Zap,
  Droplets,
  Ship,
  Fuel,
  Timer,
  Gauge,
  Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { primaryVariant } from "@/lib/facets";
import { listingLinks } from "@/lib/listings";
import {
  computeDerivedFromVariant,
  capabilitiesFor,
  type CapabilityKey,
} from "@/lib/derived";
import { gallonsToLiters } from "@/lib/units";
import {
  CategoryBadge,
  HullTypeBadge,
  PropulsionBadge,
  HullMaterialBadge,
} from "@/components/SpecBadge";
import Thumbnail from "@/components/Thumbnail";
import FavoriteButton from "@/components/FavoriteButton";
import HullCheckButton from "@/components/HullCheckButton";
import {
  formatLength,
  formatWeight,
  formatHp,
  formatSpeed,
  formatCapacity,
  formatRange,
  formatYears,
  formatEngines,
  EM_DASH,
} from "@/lib/format";
import type { BoatModelData, UnitSystem, Variant } from "@/lib/types";

const CAPABILITY_ICON: Record<CapabilityKey, LucideIcon> = {
  liveaboard: BedDouble,
  shoalDraft: Waves,
  trailerable: Truck,
  longRange: Route,
  fast: Zap,
  efficient: Droplets,
  passagemaker: Ship,
};

const GAL_TO_L = 3.785411784;

function fmtBurn(gph: number | null, metric: boolean): string {
  if (gph == null) return EM_DASH;
  return metric ? `${Math.round(gallonsToLiters(gph))} L/h` : `${gph} gph`;
}
function fmtEfficiency(nmpg: number | null, metric: boolean): string {
  if (nmpg == null) return EM_DASH;
  return metric ? `${(nmpg / GAL_TO_L).toFixed(2)} nm/L` : `${nmpg} nmpg`;
}

function DerivedChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-line bg-surface-2/40 p-2.5">
      <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted">
        {icon}
        {label}
      </span>
      <span className="num text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

interface SpecRow {
  label: string;
  value: string;
}

/**
 * Presentational boat-detail drawer. Fully driven by props so it can be wired
 * to either the per-builder store (BoatDetailDrawer) or the cross-builder store
 * (GlobalDetailDrawer). Renders nothing when `model` is null.
 */
export default function BoatDetailView({
  model,
  manufacturerName,
  website,
  manufacturerHref,
  unit,
  speedMph,
  onClose,
}: {
  model: BoatModelData | null;
  manufacturerName?: string;
  website?: string | null;
  /** Optional in-app link to the builder's full catalog. */
  manufacturerHref?: string;
  unit: UnitSystem;
  speedMph: boolean;
  onClose: () => void;
}) {
  const [variantId, setVariantId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (model) setVariantId(model.variants[0]?.id ?? null);
  }, [model]);

  const open = Boolean(model);

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement;
    const t = setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        "button, a[href], input",
      );
      first?.focus();
    }, 60);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "Tab") {
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'button, a[href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const list = Array.from(focusables);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    onClose();
    setTimeout(() => prevFocus.current?.focus(), 0);
  };

  const variant: Variant | null = model
    ? (model.variants.find((v) => v.id === variantId) ?? primaryVariant(model))
    : null;

  const specs: SpecRow[] = useMemo(() => {
    if (!model || !variant) return [];
    const rows: SpecRow[] = [];
    const push = (label: string, value: string | null | undefined) => {
      if (value != null && value !== EM_DASH && value !== "") {
        rows.push({ label, value });
      }
    };
    push(
      "Model years",
      formatYears(model.productionStartYear, model.productionEndYear),
    );
    if (variant.modelYear != null) push("Spec year", String(variant.modelYear));
    push("Length overall", formatLength(variant.loaFt, unit));
    push("Beam", formatLength(variant.beamFt, unit));
    push("Draft", formatLength(variant.draftFt, unit));
    push(
      "Displacement",
      variant.displacementLbs != null
        ? formatWeight(variant.displacementLbs, unit)
        : null,
    );
    push(
      "Engines",
      variant.engineMake || variant.engineModel
        ? formatEngines(
            variant.engineCount,
            variant.engineMake,
            variant.engineModel,
          )
        : `${variant.engineCount}× engine${variant.engineCount > 1 ? "s" : ""}`,
    );
    push(
      "HP per engine",
      variant.horsepowerEach != null ? formatHp(variant.horsepowerEach) : null,
    );
    push(
      "Total horsepower",
      variant.totalHorsepower != null ? formatHp(variant.totalHorsepower) : null,
    );
    push(
      "Cruise speed",
      variant.cruiseSpeedKts != null
        ? formatSpeed(variant.cruiseSpeedKts, speedMph)
        : null,
    );
    push(
      "Top speed",
      variant.topSpeedKts != null
        ? formatSpeed(variant.topSpeedKts, speedMph)
        : null,
    );
    push(
      "Range",
      variant.rangeNm != null ? formatRange(variant.rangeNm) : null,
    );
    push(
      "Fuel capacity",
      variant.fuelCapacityGal != null
        ? formatCapacity(variant.fuelCapacityGal, unit)
        : null,
    );
    push(
      "Water capacity",
      variant.waterCapacityGal != null
        ? formatCapacity(variant.waterCapacityGal, unit)
        : null,
    );
    push(
      "Staterooms",
      variant.staterooms != null ? String(variant.staterooms) : null,
    );
    push("Heads", variant.heads != null ? String(variant.heads) : null);
    return rows;
  }, [model, variant, unit, speedMph]);

  const capabilities = useMemo(
    () => (model ? capabilitiesFor(model) : []),
    [model],
  );
  const derived = useMemo(
    () => (variant ? computeDerivedFromVariant(variant) : null),
    [variant],
  );
  const hasDerived =
    derived != null &&
    (derived.gphAtCruise != null ||
      derived.nmpg != null ||
      derived.hoursAtCruise != null);

  return (
    <AnimatePresence>
      {open && model && variant && (
        <motion.div
          className="fixed inset-0 z-[60]"
          initial="hidden"
          animate="visible"
          exit="hidden"
          aria-hidden={false}
        >
          <motion.div
            className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-[2px]"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: 0.18 }}
            onClick={handleClose}
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${model.name} specifications`}
            className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col border-l border-line bg-surface shadow-drawer"
            variants={{ hidden: { x: "100%" }, visible: { x: 0 } }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <FavoriteButton
              id={model.id}
              withLabel
              className="absolute left-3 top-3 z-10"
            />
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close details"
              className="focus-ring absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg bg-surface-2/80 text-muted backdrop-blur transition-colors hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line bg-surface-2">
                <Thumbnail
                  src={model.imageUrl}
                  alt={model.name}
                  category={model.category}
                  fill
                  sizes="460px"
                  className="object-cover"
                  priority
                />
              </div>

              <div className="space-y-5 p-6">
                <div>
                  {manufacturerName ? (
                    <p className="text-xs uppercase tracking-wider text-muted">
                      {manufacturerName}
                    </p>
                  ) : null}
                  <h2 className="mt-0.5 font-display text-2xl font-bold text-ink">
                    {model.name}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <CategoryBadge value={model.category} />
                    <HullTypeBadge value={model.hullType} />
                    <PropulsionBadge value={model.propulsion} />
                    <HullMaterialBadge value={model.hullMaterial} />
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-muted">
                  {model.blurb}
                </p>

                {capabilities.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                      At a glance
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {capabilities.map((c) => {
                        const Icon = CAPABILITY_ICON[c.key];
                        return (
                          <span
                            key={c.key}
                            title={c.why}
                            className="inline-flex cursor-help items-center gap-1.5 rounded-chip border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-ink"
                          >
                            <Icon className="h-3.5 w-3.5 text-accent" />
                            {c.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {model.variants.length > 1 && (
                  <div>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                      Variants
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {model.variants.map((v) => {
                        const active = v.id === variant.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setVariantId(v.id)}
                            className={`focus-ring num rounded-chip border px-2.5 py-1 text-xs transition-colors ${
                              active
                                ? "border-accent/50 bg-accent/15 text-ink"
                                : "border-line bg-surface-2/40 text-muted hover:text-ink"
                            }`}
                          >
                            {v.modelYear ?? "Base"}
                            {v.totalHorsepower ? ` · ${v.totalHorsepower} hp` : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                    Specifications
                  </p>
                  <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
                    {specs.map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center justify-between gap-3 bg-surface px-3 py-2"
                      >
                        <dt className="text-xs text-muted">{s.label}</dt>
                        <dd className="num text-right text-[13px] font-medium text-ink">
                          {s.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {hasDerived && derived && (
                  <div>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                      At cruise
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <DerivedChip
                        icon={<Fuel className="h-3 w-3" />}
                        label="Fuel burn"
                        value={fmtBurn(derived.gphAtCruise, unit === "metric")}
                      />
                      <DerivedChip
                        icon={<Timer className="h-3 w-3" />}
                        label="Run time"
                        value={
                          derived.hoursAtCruise != null
                            ? `${derived.hoursAtCruise} hrs`
                            : EM_DASH
                        }
                      />
                      <DerivedChip
                        icon={<Gauge className="h-3 w-3" />}
                        label="Efficiency"
                        value={fmtEfficiency(derived.nmpg, unit === "metric")}
                      />
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-muted">
                      Estimated from range, fuel capacity, and cruise speed —
                      real-world burn varies with load, sea state, and throttle.
                    </p>
                  </div>
                )}

                {variant.notes && (
                  <div>
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                      Notes
                    </p>
                    <p className="text-sm leading-relaxed text-muted">
                      {variant.notes}
                    </p>
                  </div>
                )}

                {manufacturerName ? (
                  <div>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                      Find one for sale
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {listingLinks(manufacturerName, model.name).map((l) => (
                        <a
                          key={l.label}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="focus-ring inline-flex items-center gap-1.5 rounded-chip border border-line bg-surface-2/40 px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink"
                        >
                          <Tag className="h-3 w-3" />
                          {l.label}
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </a>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-muted">
                      HullData is a reference library — these open third-party
                      brokerage searches in a new tab.
                    </p>
                  </div>
                ) : null}

                {manufacturerName ? (
                  <div className="rounded-lg border border-line bg-surface-2/30 p-3">
                    <HullCheckButton model={model} make={manufacturerName} />
                    <p className="mt-2 text-[11px] leading-relaxed text-muted">
                      Hand this boat off to{" "}
                      <span className="font-medium text-ink">HullCheck</span>,
                      the offline survey app — downloads a project pre-filled
                      with these specs and the standard 120-point checklist. In
                      HullCheck, choose New Project → Import.
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {manufacturerHref ? (
                    <a
                      href={manufacturerHref}
                      className="focus-ring inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                    >
                      All {manufacturerName ?? "builder"} models
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                  {website ? (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                    >
                      Visit {manufacturerName ?? "website"}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
