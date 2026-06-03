import { NextResponse } from "next/server";
import type { Estimate } from "@/lib/types";
import { isDatabaseConfigured } from "@/lib/server/db";
import { ApiInputError, listDbEstimates, saveDbEstimate } from "@/lib/server/estimate-repository";

export const dynamic = "force-dynamic";

function unavailable() {
  return NextResponse.json({
    data: null,
    mode: "local",
    error: {
      code: "DATABASE_NOT_CONFIGURED",
      message: "DATABASE_URL is not configured. Falling back to browser storage.",
    },
  });
}

function handleError(error: unknown) {
  if (error instanceof ApiInputError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null,
        },
      },
      { status: error.status },
    );
  }

  console.error("Estimate API error", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "見積データの保存中にエラーが発生しました。",
      },
    },
    { status: 500 },
  );
}

export async function GET() {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const estimates = await listDbEstimates();
    return NextResponse.json({ data: estimates, mode: "database" });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const body = (await request.json()) as { estimate?: Estimate };
    if (!body.estimate) {
      throw new ApiInputError("estimate is required", 400);
    }

    const saved = await saveDbEstimate(body.estimate);
    return NextResponse.json({ data: saved, mode: "database" }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}