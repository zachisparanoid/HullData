import type { ReactNode } from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_TONE,
  HULL_TYPE_LABELS,
  PROPULSION_LABELS,
  HULL_MATERIAL_LABELS,
  type BoatCategory,
  type HullType,
  type Propulsion,
  type HullMaterial,
  type BadgeTone,
} from "@/lib/types";

const TONE_CLASS: Record<BadgeTone, string> = {
  teal: "badge-teal",
  amber: "badge-amber",
  slate: "badge-slate",
  blue: "badge-blue",
  violet: "badge-violet",
  green: "badge-green",
};

export function SpecBadge({
  tone,
  children,
  icon,
  className = "",
}: {
  tone: BadgeTone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span className={`badge ${TONE_CLASS[tone]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}

// Keep hull-type tones low-saturation and semantically grouped.
const HULL_TYPE_TONE: Record<HullType, BadgeTone> = {
  PLANING: "blue",
  SEMI_DISPLACEMENT: "teal",
  FULL_DISPLACEMENT: "teal",
  MODIFIED_V: "slate",
  DEEP_V: "slate",
  CATAMARAN_POWER: "green",
};

export function CategoryBadge({ value }: { value: BoatCategory }) {
  return <SpecBadge tone={CATEGORY_TONE[value]}>{CATEGORY_LABELS[value]}</SpecBadge>;
}

export function HullTypeBadge({ value }: { value: HullType }) {
  return (
    <SpecBadge tone={HULL_TYPE_TONE[value]}>{HULL_TYPE_LABELS[value]}</SpecBadge>
  );
}

export function PropulsionBadge({ value }: { value: Propulsion }) {
  return <SpecBadge tone="slate">{PROPULSION_LABELS[value]}</SpecBadge>;
}

export function HullMaterialBadge({ value }: { value: HullMaterial }) {
  return <SpecBadge tone="slate">{HULL_MATERIAL_LABELS[value]}</SpecBadge>;
}
