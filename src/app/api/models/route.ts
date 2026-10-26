import { NextResponse } from "next/server";
import { getAllModels } from "@/lib/queries";
import type { ApiError } from "@/lib/types";

// Every model across every builder, flattened — loaded once for the
// cross-manufacturer explorer, then filtered entirely client-side.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getAllModels());
  } catch (e) {
    const body: ApiError = {
      error: {
        code: "INTERNAL",
        message: e instanceof Error ? e.message : "Failed to load models.",
      },
    };
    return NextResponse.json(body, { status: 500 });
  }
}
