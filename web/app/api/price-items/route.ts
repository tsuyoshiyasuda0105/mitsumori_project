import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/server/db";
import {
  ApiInputError,
  listDbPriceItems,
  updateDbPriceItemActive,
} from "@/lib/server/estimate-repository";

export const dynamic = "force-dynamic";

function unavailable() {
  return NextResponse.json({
    data: null,
    mode: "local",
    error: {
      code: "DATABASE_NOT_CONFIGURED",
      message: "DATABASE_URL is not configured. Falling back to bundled price items.",
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

  console.error("Price items API error", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "単価マスターの処理中にエラーが発生しました。",
      },
    },
    { status: 500 },
  );
}

export async function GET() {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const items = await listDbPriceItems();
    return NextResponse.json({ data: items, mode: "database" });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const body = (await request.json()) as {
      itemId?: string;
      isActive?: boolean;
    };

    if (!body.itemId) throw new ApiInputError("itemId is required", 400);
    if (typeof body.isActive !== "boolean") {
      throw new ApiInputError("isActive must be boolean", 400);
    }

    const saved = await updateDbPriceItemActive(body.itemId, body.isActive);
    return NextResponse.json({ data: saved, mode: "database" });
  } catch (error) {
    return handleError(error);
  }
}
