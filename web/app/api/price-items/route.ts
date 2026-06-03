import { NextResponse } from "next/server";
import type { PriceItem } from "@/lib/types";
import { isDatabaseConfigured } from "@/lib/server/db";
import {
  ApiInputError,
  deleteDbPriceItem,
  listDbPriceItems,
  saveDbPriceItem,
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

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const body = (await request.json()) as { item?: Partial<PriceItem> };
    if (!body.item) throw new ApiInputError("item is required", 400);

    const saved = await saveDbPriceItem(body.item);
    return NextResponse.json({ data: saved, mode: "database" }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const body = (await request.json()) as {
      item?: Partial<PriceItem>;
      itemId?: string;
      isActive?: boolean;
    };

    if (body.item) {
      if (!body.item.id) throw new ApiInputError("item.id is required", 400);
      const saved = await saveDbPriceItem(body.item);
      return NextResponse.json({ data: saved, mode: "database" });
    }

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

export async function DELETE(request: Request) {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const { searchParams } = new URL(request.url);
    let itemId = searchParams.get("itemId") ?? "";

    if (!itemId) {
      try {
        const body = (await request.json()) as { itemId?: string };
        itemId = body.itemId ?? "";
      } catch {
        itemId = "";
      }
    }

    const deleted = await deleteDbPriceItem(itemId);
    return NextResponse.json({ data: deleted, mode: "database" });
  } catch (error) {
    return handleError(error);
  }
}