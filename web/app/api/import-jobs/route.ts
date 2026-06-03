import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/server/db";
import {
  ApiInputError,
  listDbImportJobs,
  recordDbImportJob,
} from "@/lib/server/estimate-repository";

export const dynamic = "force-dynamic";

function unavailable() {
  return NextResponse.json({
    data: null,
    mode: "local",
    error: {
      code: "DATABASE_NOT_CONFIGURED",
      message: "DATABASE_URL is not configured. Import history will remain local-only.",
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

  console.error("Import jobs API error", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "インポート履歴の処理中にエラーが発生しました。",
      },
    },
    { status: 500 },
  );
}

export async function GET() {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const jobs = await listDbImportJobs();
    return NextResponse.json({ data: jobs, mode: "database" });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const body = (await request.json()) as {
      status?: "uploaded" | "mapped" | "validated" | "imported" | "failed";
      mapping?: unknown;
      result?: unknown;
      errorMessage?: string;
    };
    const saved = await recordDbImportJob(body);
    return NextResponse.json({ data: saved, mode: "database" }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
