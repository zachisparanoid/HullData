"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import { useExplorerStore } from "@/store/useExplorerStore";
import { TOGGLEABLE_COLUMNS } from "@/lib/columns";

export default function ColumnVisibilityMenu() {
  const visibility = useExplorerStore((s) => s.columnVisibility);
  const toggle = useExplorerStore((s) => s.toggleColumn);
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

  const shownCount = TOGGLEABLE_COLUMNS.filter(
    (c) => visibility[c.id] ?? true,
  ).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-ink"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Columns
        <span className="num text-[10px] text-muted/70">{shownCount}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-line bg-surface p-1.5 shadow-xl">
          <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted">
            Visible columns
          </p>
          <div className="max-h-72 overflow-y-auto">
            {TOGGLEABLE_COLUMNS.map((c) => {
              const on = visibility[c.id] ?? true;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  role="menuitemcheckbox"
                  aria-checked={on}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-ink transition-colors hover:bg-surface-2"
                >
                  <span
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors ${
                      on
                        ? "border-accent bg-accent/20 text-accent"
                        : "border-line text-transparent"
                    }`}
                  >
                    {on && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  {c.menuLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
