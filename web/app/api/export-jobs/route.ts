import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/server/db";
import {
  ApiInputError,
  listDbExportJobs,
  recordDbExportJob,
} from "@/lib/server/estimate-repository";

export const dynamic = "force-dynamic";

function unavailable() {
  return NextResponse.json({
    data: null,
    mode: "local",
    error: {
      code: "DATABASE_NOT_CONFIGURED",
      message: "DATABASE_URL is not configured. Export history will remain local-only.",
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

  console.error("Export jobs API error", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "出力履歴の処理中にエラーが発生しました。",
      },
    },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const { searchParams } = new URL(request.url);
    const estimateId = searchParams.get("estimateId");
    if (!estimateId) throw new ApiInputError("estimateId is required", 400);

    const jobs = await listDbExportJobs(estimateId);
    return NextResponse.json({ data: jobs, mode: "database" });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return unavailable();

  try {
    const body = (await request.json()) as {
      estimateId?: string;
      exportType?: "excel" | "pdf" | "csv";
      exportMode?: "customer" | "internal" | "integration";
      result?: unknown;
      errorMessage?: string;
    };

    if (!body.estimateId) throw new ApiInputError("estimateId is required", 400);
    if (!body.exportType) throw new ApiInputError("exportType is required", 400);
    if (!body.exportMode) throw new ApiInputError("exportMode is required", 400);

    const saved = await recordDbExportJob({
      estimateId: body.estimateId,
      exportType: body.exportType,
      exportMode: body.exportMode,
      result: body.result,
      errorMessage: body.errorMessage,
    });

    return NextResponse.json({ data: saved, mode: saved ? "database" : "local" }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
