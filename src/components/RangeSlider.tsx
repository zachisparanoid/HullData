"use client";

import { useEffect, useState } from "react";

export interface RangeValue {
  min: number;
  max: number;
}

interface RangeSliderProps {
  label: string;
  /** Lower / upper bounds in whatever (already display-converted) unit. */
  min: number;
  max: number;
  step?: number;
  value: RangeValue;
  onChange: (v: RangeValue) => void;
  /** Suffix shown after the numeric inputs (e.g. "ft", "hp"). */
  unit?: string;
  /** Format the readout numbers (defaults to a trimmed number). */
  format?: (n: number) => string;
  disabled?: boolean;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi);
}

export default function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit,
  format,
  disabled = false,
}: RangeSliderProps) {
  // Degrade gracefully when a manufacturer has only one value for this metric.
  const locked = disabled || max <= min;
  const fmt = format ?? ((n: number) => String(Math.round(n * 10) / 10));

  // Local string buffers so typing in the numeric inputs isn't clobbered.
  const [minText, setMinText] = useState(String(value.min));
  const [maxText, setMaxText] = useState(String(value.max));
  useEffect(() => setMinText(fmt(value.min)), [value.min]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setMaxText(fmt(value.max)), [value.max]); // eslint-disable-line react-hooks/exhaustive-deps

  const span = max - min || 1;
  const lowPct = clamp(((value.min - min) / span) * 100, 0, 100);
  const highPct = clamp(((value.max - min) / span) * 100, 0, 100);

  const commitMin = (raw: number) => {
    if (Number.isNaN(raw)) return;
    const next = clamp(raw, min, value.max);
    onChange({ min: next, max: value.max });
  };
  const commitMax = (raw: number) => {
    if (Number.isNaN(raw)) return;
    const next = clamp(raw, value.min, max);
    onChange({ min: value.min, max: next });
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
          {label}
        </span>
        <span className="num text-xs text-ink">
          {fmt(value.min)} – {fmt(value.max)}
          {unit ? <span className="ml-1 text-muted">{unit}</span> : null}
        </span>
      </div>

      {/* Slider track + dual thumbs */}
      <div className="relative h-[18px] px-[1px]">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-surface-2" />
        {!locked && (
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
            style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
          />
        )}
        <input
          type="range"
          className="rs-input"
          aria-label={`${label} minimum`}
          min={min}
          max={max}
          step={step}
          value={value.min}
          disabled={locked}
          onChange={(e) => commitMin(Number(e.target.value))}
          style={{ zIndex: value.min >= max - step ? 5 : 3 }}
        />
        <input
          type="range"
          className="rs-input"
          aria-label={`${label} maximum`}
          min={min}
          max={max}
          step={step}
          value={value.max}
          disabled={locked}
          onChange={(e) => commitMax(Number(e.target.value))}
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Precise numeric entry */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            inputMode="decimal"
            aria-label={`${label} minimum value`}
            className="num focus-ring w-full rounded-md border border-line bg-surface-2/60 px-2 py-1 text-xs text-ink disabled:opacity-50"
            value={minText}
            min={min}
            max={max}
            step={step}
            disabled={locked}
            onChange={(e) => setMinText(e.target.value)}
            onBlur={() => commitMin(Number(minText))}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitMin(Number(minText));
            }}
          />
        </div>
        <span className="text-xs text-muted">to</span>
        <div className="relative flex-1">
          <input
            type="number"
            inputMode="decimal"
            aria-label={`${label} maximum value`}
            className="num focus-ring w-full rounded-md border border-line bg-surface-2/60 px-2 py-1 text-xs text-ink disabled:opacity-50"
            value={maxText}
            min={min}
            max={max}
            step={step}
            disabled={locked}
            onChange={(e) => setMaxText(e.target.value)}
            onBlur={() => commitMax(Number(maxText))}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitMax(Number(maxText));
            }}
          />
        </div>
        {unit ? (
          <span className="w-7 text-right text-[11px] text-muted">{unit}</span>
        ) : null}
      </div>
    </div>
  );
}
