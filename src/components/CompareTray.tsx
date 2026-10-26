"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GitCompareArrows, X } from "lucide-react";
import { useGlobalStore, MAX_COMPARE } from "@/store/useGlobalStore";
import Thumbnail from "@/components/Thumbnail";
import type { GlobalBoat } from "@/lib/types";

export default function CompareTray({ onOpen }: { onOpen: () => void }) {
  const ids = useGlobalStore((s) => s.compareIds);
  const allBoats = useGlobalStore((s) => s.boats);
  const toggleCompare = useGlobalStore((s) => s.toggleCompare);
  const clearCompare = useGlobalStore((s) => s.clearCompare);

  const boats = ids
    .map((id) => allBoats.find((b) => b.id === id))
    .filter((b): b is GlobalBoat => Boolean(b));

  const canCompare = boats.length >= 2;

  return (
    <AnimatePresence>
      {boats.length > 0 && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-4"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-auto flex w-full max-w-[900px] items-center gap-3 rounded-2xl border border-line bg-surface/95 p-2.5 shadow-drawer backdrop-blur-md">
            <span className="hidden shrink-0 pl-2 text-[11px] font-medium uppercase tracking-wider text-muted sm:block">
              Compare
            </span>

            {/* Selected chips + empty slots */}
            <div className="flex flex-1 items-center gap-2 overflow-x-auto">
              {boats.map((b) => (
                <div
                  key={b.id}
                  className="group relative flex shrink-0 items-center gap-2 rounded-lg border border-line bg-surface-2/60 py-1 pl-1 pr-2"
                >
                  <span className="overflow-hidden rounded-md border border-line">
                    <Thumbnail
                      src={b.imageUrl}
                      alt={b.name}
                      category={b.category}
                      width={40}
                      height={28}
                      className="h-7 w-10 object-cover"
                    />
                  </span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="max-w-[120px] truncate text-xs font-medium text-ink">
                      {b.name}
                    </span>
                    <span className="max-w-[120px] truncate text-[10px] text-muted">
                      {b.manufacturerName}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(b.id)}
                    aria-label={`Remove ${b.name} from compare`}
                    className="focus-ring grid h-5 w-5 shrink-0 place-items-center rounded text-muted hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {Array.from({ length: MAX_COMPARE - boats.length }).map((_, i) => (
                <div
                  key={`slot-${i}`}
                  className="hidden h-[38px] w-[120px] shrink-0 items-center justify-center rounded-lg border border-dashed border-line text-[10px] text-muted sm:flex"
                >
                  Add a boat
                </div>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={clearCompare}
                className="focus-ring rounded-lg px-2.5 py-2 text-xs text-muted transition-colors hover:text-ink"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={onOpen}
                disabled={!canCompare}
                className="focus-ring flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-[#06231f] transition-colors enabled:hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                <GitCompareArrows className="h-3.5 w-3.5" />
                Compare{canCompare ? ` ${boats.length}` : ""}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
