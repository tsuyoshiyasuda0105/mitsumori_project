import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/server/db";
import { ApiInputError, listDbCustomers } from "@/lib/server/estimate-repository";

export const dynamic = "force-dynamic";

function unavailable() {
  return NextResponse.json({
    data: null,
    mode: "local",
    error: {
      code: "DATABASE_NOT_CONFIGURED",
      message: "DATABASE_URL is not configured. Falling back to bundled customers.",
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

  console.error("Customers API error", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "顧客情報の取得中にエラーが発生しました。",
      },
    },
    { status: 500 },
  );
}

export async function GET() {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const customers = await listDbCustomers();
    return NextResponse.json({ data: customers, mode: "database" });
  } catch (error) {
    return handleError(error);
  }
}
