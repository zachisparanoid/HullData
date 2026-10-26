import { NextResponse } from "next/server";
import { z } from "zod";
import { getCatalog } from "@/lib/queries";
import { computeFacets } from "@/lib/facets";
import type { ApiError } from "@/lib/types";

export const dynamic = "force-dynamic";

const idSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/i);

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const parsed = idSchema.safeParse(params.id);
  if (!parsed.success) {
    const body: ApiError = {
      error: { code: "BAD_REQUEST", message: "Invalid manufacturer id." },
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const catalog = await getCatalog(parsed.data);
    if (!catalog) {
      const body: ApiError = {
        error: {
          code: "NOT_FOUND",
          message: `No manufacturer matches "${parsed.data}".`,
        },
      };
      return NextResponse.json(body, { status: 404 });
    }
    return NextResponse.json(computeFacets(catalog.models));
  } catch (e) {
    const body: ApiError = {
      error: {
        code: "INTERNAL",
        message: e instanceof Error ? e.message : "Failed to compute facets.",
      },
    };
    return NextResponse.json(body, { status: 500 });
  }
}
