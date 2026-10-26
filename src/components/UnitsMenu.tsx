"use client";

import { useEffect, useRef, useState } from "react";
import { Ruler } from "lucide-react";
import { useExplorerStore } from "@/store/useExplorerStore";
import type { UnitSystem } from "@/lib/types";

function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex rounded-lg border border-line bg-surface-2/60 p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`focus-ring flex-1 rounded-md px-2.5 py-1 text-xs transition-colors ${
            value === o.value
              ? "bg-accent/20 text-accent"
              : "text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function UnitsMenu() {
  const unit = useExplorerStore((s) => s.unit);
  const setUnit = useExplorerStore((s) => s.setUnit);
  const speedMph = useExplorerStore((s) => s.speedMph);
  const toggleSpeedMph = useExplorerStore((s) => s.toggleSpeedMph);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Unit settings"
        className="focus-ring flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-ink"
      >
        <Ruler className="h-3.5 w-3.5" />
        <span className="num">
          {unit === "imperial" ? "ft" : "m"} · {speedMph ? "mph" : "kts"}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 space-y-3 rounded-xl border border-line bg-surface p-3 shadow-xl">
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
              Measurement
            </p>
            <Segmented<UnitSystem>
              ariaLabel="Measurement system"
              value={unit}
              options={[
                { value: "imperial", label: "Imperial" },
                { value: "metric", label: "Metric" },
              ]}
              onChange={setUnit}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
              Speed
            </p>
            <Segmented
              ariaLabel="Speed unit"
              value={speedMph ? "mph" : "kts"}
              options={[
                { value: "kts", label: "Knots" },
                { value: "mph", label: "MPH" },
              ]}
              onChange={(v) => {
                if ((v === "mph") !== speedMph) toggleSpeedMph();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
