function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded bg-surface-2 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}

/** Shimmering placeholder rows shown while a catalog loads. */
export default function SkeletonTable({ rows = 9 }: { rows?: number }) {
  return (
    <div className="panel overflow-hidden" aria-hidden="true">
      {/* Stat strip skeleton */}
      <div className="flex flex-wrap gap-3 border-b border-line p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} className="h-12 w-32" />
        ))}
      </div>
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-line bg-surface-2/50 px-4 py-3">
        <Shimmer className="h-3 w-28" />
        <Shimmer className="h-3 w-16" />
        <div className="ml-auto flex gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-3 w-14" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Shimmer className="h-4 w-36" />
            <Shimmer className="h-10 w-24 rounded-thumb" />
            <div className="ml-auto flex gap-6">
              {Array.from({ length: 6 }).map((_, j) => (
                <Shimmer key={j} className="h-3 w-14" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
