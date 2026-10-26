"use client";

import {
  formatHp,
  formatCruiseTop,
  formatRange,
  formatEngines,
  lengthValue,
} from "@/lib/format";
import type { UnitSystem, Variant } from "@/lib/types";

const HEADS = [
  "Year",
  "LOA",
  "Beam",
  "Draft",
  "Engines",
  "Total HP",
  "Cruise / Top",
  "Range",
];

/** The expanded per-variant spec grid shown beneath a multi-variant row. */
export default function VariantSubTable({
  variants,
  unit,
  speedMph,
}: {
  variants: Variant[];
  unit: UnitSystem;
  speedMph: boolean;
}) {
  return (
    <div className="px-4 py-3 pl-[60px]">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
        {variants.length} variants
      </p>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-surface-2/60 text-left text-muted">
              {HEADS.map((h, i) => (
                <th
                  key={h}
                  className={`px-3 py-1.5 font-medium uppercase tracking-wide ${
                    i >= 1 ? "text-right" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="border-t border-line">
                <td className="px-3 py-1.5 text-ink">{v.modelYear ?? "Base"}</td>
                <td className="num px-3 py-1.5 text-right text-ink">
                  {lengthValue(v.loaFt, unit)}
                </td>
                <td className="num px-3 py-1.5 text-right text-ink">
                  {lengthValue(v.beamFt, unit)}
                </td>
                <td className="num px-3 py-1.5 text-right text-ink">
                  {lengthValue(v.draftFt, unit)}
                </td>
                <td className="px-3 py-1.5 text-right text-ink">
                  {formatEngines(v.engineCount, v.engineMake, v.engineModel)}
                </td>
                <td className="num px-3 py-1.5 text-right text-ink">
                  {formatHp(v.totalHorsepower)}
                </td>
                <td className="num px-3 py-1.5 text-right text-ink">
                  {formatCruiseTop(v.cruiseSpeedKts, v.topSpeedKts, speedMph)}
                </td>
                <td className="num px-3 py-1.5 text-right text-ink">
                  {formatRange(v.rangeNm)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
