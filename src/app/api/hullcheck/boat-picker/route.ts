import { NextResponse } from "next/server";
import { getAllModels } from "@/lib/queries";
import { primaryVariant } from "@/lib/facets";
import { mapBoatType } from "@/lib/hullcheck";
import { effectiveEndYear, stripMakePrefix } from "@/lib/format";
import type { ApiError } from "@/lib/types";

// A compact, bundle-ready boat-picker dataset for HullCheck's New Project
// screen: every model with its make, HullCheck BoatType, length, and year span,
// so a surveyor can pick a known boat and have make/model/type/length pre-filled
// offline. HullData stays the source of truth; HullCheck ships a snapshot.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const models = await getAllModels();
    const boats = models
      .map((m) => {
        const v = primaryVariant(m);
        return {
          make: m.manufacturerName,
          model: stripMakePrefix(m.manufacturerName, m.name),
          boatType: mapBoatType(m.category, m.propulsion),
          category: m.category,
          lengthFeet: Math.round(v.loaFt * 10) / 10,
          yearStart: m.productionStartYear,
          yearEnd: effectiveEndYear(m.productionEndYear),
        };
      })
      .sort(
        (a, b) =>
          a.make.localeCompare(b.make) || a.model.localeCompare(b.model),
      );

    return NextResponse.json({
      source: "hulldata",
      schema: "hullcheck-boat-picker",
      version: 1,
      count: boats.length,
      boats,
    });
  } catch (e) {
    const body: ApiError = {
      error: {
        code: "INTERNAL",
        message:
          e instanceof Error ? e.message : "Failed to build boat-picker dataset.",
      },
    };
    return NextResponse.json(body, { status: 500 });
  }
}
