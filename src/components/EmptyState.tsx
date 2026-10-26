import type { ReactNode } from "react";

/** Friendly empty / zero-results / error visual with an optional action. */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "muted",
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "muted" | "danger" | "accent";
  className?: string;
}) {
  const ring =
    tone === "danger"
      ? "text-danger"
      : tone === "accent"
        ? "text-accent"
        : "text-muted";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-16 ${className}`}
    >
      {icon ? (
        <div
          className={`mb-5 grid place-items-center h-16 w-16 rounded-2xl border border-line bg-surface-2/60 ${ring}`}
        >
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted text-balance">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
