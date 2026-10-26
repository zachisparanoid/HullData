import { NextResponse } from "next/server";
import { getManufacturerSummaries } from "@/lib/queries";
import type { ApiError } from "@/lib/types";

// Reads the SQLite DB at request time — never statically cached.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getManufacturerSummaries();
    return NextResponse.json(data);
  } catch (e) {
    const body: ApiError = {
      error: {
        code: "INTERNAL",
        message:
          e instanceof Error ? e.message : "Failed to load manufacturers",
      },
    };
    return NextResponse.json(body, { status: 500 });
  }
}
