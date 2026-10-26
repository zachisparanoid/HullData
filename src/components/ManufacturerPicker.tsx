"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronsUpDown, Search, Check, Ship } from "lucide-react";
import { useExplorerStore } from "@/store/useExplorerStore";
import { countryFlag } from "@/lib/flags";
import { CURRENT_YEAR } from "@/lib/types";

function spanLabel(min: number | null, max: number | null): string {
  if (min == null || max == null) return "—";
  return `${min}–${max >= CURRENT_YEAR ? "present" : max}`;
}

export default function ManufacturerPicker({
  onSelect,
}: {
  onSelect: (slug: string) => void;
}) {
  const manufacturers = useExplorerStore((s) => s.manufacturers);
  const selectedSlug = useExplorerStore((s) => s.selectedSlug);
  const status = useExplorerStore((s) => s.manufacturersStatus);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = manufacturers.find((m) => m.slug === selectedSlug) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return manufacturers;
    return manufacturers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q),
    );
  }, [manufacturers, query]);

  useEffect(() => {
    if (open) {
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (slug: string) => {
    onSelect(slug);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const m = filtered[active];
      if (m) choose(m.slug);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(filtered.length - 1);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        className="focus-ring flex w-full items-center gap-2 rounded-lg border border-line bg-surface-2/70 px-3 py-2 text-left text-sm transition-colors hover:border-accent/40"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select a manufacturer"
        onClick={() => setOpen((o) => !o)}
      >
        <Ship className="h-4 w-4 shrink-0 text-accent" />
        {selected ? (
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-medium text-ink">
              {selected.name}
            </span>
            <span className="shrink-0 text-sm leading-none">
              {countryFlag(selected.country)}
            </span>
          </span>
        ) : (
          <span className="text-muted">
            {status === "loading"
              ? "Loading builders…"
              : "Select a manufacturer…"}
          </span>
        )}
        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full min-w-[20rem] overflow-hidden rounded-xl border border-line bg-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search builders or countries…"
              className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
              role="combobox"
              aria-expanded={open}
              aria-controls="mfr-listbox"
              aria-autocomplete="list"
            />
            <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] text-muted sm:block">
              esc
            </kbd>
          </div>
          <ul
            ref={listRef}
            id="mfr-listbox"
            role="listbox"
            className="max-h-[22rem] overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-8 text-center text-sm text-muted">
                No builders match “{query}”.
              </li>
            ) : (
              filtered.map((m, i) => (
                <li key={m.slug} role="option" aria-selected={m.slug === selectedSlug}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(m.slug)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                      i === active ? "bg-surface-2" : ""
                    }`}
                  >
                    {m.logoUrl ? (
                      <Image
                        src={m.logoUrl}
                        alt=""
                        width={40}
                        height={28}
                        className="h-7 w-10 shrink-0 rounded border border-line object-cover"
                      />
                    ) : (
                      <span className="grid h-7 w-10 shrink-0 place-items-center rounded border border-line bg-surface-2 text-base leading-none">
                        {countryFlag(m.country)}
                      </span>
                    )}
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-ink">
                        {m.name}
                      </span>
                      <span className="num text-[11px] text-muted">
                        {m.modelCount} models · {spanLabel(m.yearMin, m.yearMax)}
                      </span>
                    </span>
                    {m.slug === selectedSlug && (
                      <Check className="ml-auto h-4 w-4 shrink-0 text-accent" />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
