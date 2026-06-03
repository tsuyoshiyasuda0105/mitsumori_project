import { NextResponse } from "next/server";
import type { Customer } from "@/lib/types";
import { isDatabaseConfigured } from "@/lib/server/db";
import {
  ApiInputError,
  deleteDbCustomer,
  listDbCustomers,
  saveDbCustomer,
} from "@/lib/server/estimate-repository";

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
        message: "顧客情報の処理中にエラーが発生しました。",
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

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const body = (await request.json()) as { customer?: Partial<Customer> };
    if (!body.customer) {
      throw new ApiInputError("customer is required", 400);
    }

    const saved = await saveDbCustomer(body.customer);
    return NextResponse.json({ data: saved, mode: "database" }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const body = (await request.json()) as { customer?: Partial<Customer> };
    if (!body.customer?.id) {
      throw new ApiInputError("customer.id is required", 400);
    }

    const saved = await saveDbCustomer(body.customer);
    return NextResponse.json({ data: saved, mode: "database" });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const { searchParams } = new URL(request.url);
    let customerId = searchParams.get("customerId") ?? "";

    if (!customerId) {
      try {
        const body = (await request.json()) as { customerId?: string };
        customerId = body.customerId ?? "";
      } catch {
        customerId = "";
      }
    }

    const deleted = await deleteDbCustomer(customerId);
    return NextResponse.json({ data: deleted, mode: "database" });
  } catch (error) {
    return handleError(error);
  }
}
