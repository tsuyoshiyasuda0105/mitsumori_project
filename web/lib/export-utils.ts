import { computeTotals, lineAmount } from "./calc";
import { fmtDate, yen } from "./format";
import type { Estimate, EstimateLine } from "./types";

export type ExportAudience = "customer" | "internal";

export interface ExportLineRow {
  no: number;
  location: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  customerNote: string;
  internalInstruction?: string;
}

export interface ExportSummary {
  subtotal: number;
  tax: number;
  total: number;
}

export function buildExportRows(
  estimate: Estimate,
  audience: ExportAudience,
): ExportLineRow[] {
  return estimate.lines.map((line, index) => ({
    no: line.lineNo || index + 1,
    location: line.location,
    itemName: line.itemName,
    description: line.description ?? "",
    quantity: line.quantity,
    unit: line.unit,
    unitPrice: line.unitPrice,
    amount: lineAmount(line),
    customerNote: line.customerNote ?? "",
    internalInstruction:
      audience === "internal" ? line.internalInstruction ?? "" : undefined,
  }));
}

export function buildExportSummary(estimate: Estimate): ExportSummary {
  return computeTotals(estimate.lines);
}

export function buildCustomerPrintTitle(estimate: Estimate): string {
  return `${estimate.estimateNo || estimate.id} ${estimate.title || "Estimate"}`;
}

export function buildCustomerNote(estimate: Estimate): string {
  return estimate.customerNote?.trim() || "特記事項はありません。";
}

export function buildInternalInstruction(estimate: Estimate): string {
  return estimate.internalInstruction?.trim() || "業者指示事項はありません。";
}

export function buildTsvText(
  estimate: Estimate,
  audience: ExportAudience,
  customerName: string,
): string {
  const baseHeaders = [
    "見積番号",
    "顧客名",
    "件名",
    "見積日",
    "有効期限",
    "No",
    "場所",
    "品目",
    "説明",
    "数量",
    "単位",
    "単価",
    "金額",
    "顧客向け備考",
  ];
  const headers =
    audience === "internal" ? [...baseHeaders, "業者指示事項"] : baseHeaders;

  const rows = buildExportRows(estimate, audience).map((row) => {
    const values = [
      estimate.estimateNo,
      customerName,
      estimate.title,
      fmtDate(estimate.estimateDate),
      fmtDate(estimate.expiresOn),
      String(row.no),
      row.location,
      row.itemName,
      row.description,
      String(row.quantity),
      row.unit,
      String(row.unitPrice),
      String(row.amount),
      row.customerNote,
    ];
    if (audience === "internal") values.push(row.internalInstruction ?? "");
    return values.map(toCellText).join("\t");
  });

  const summary = buildExportSummary(estimate);
  const summaryRows = [
    ["", "", "", "", "", "", "", "", "", "", "", "小計", String(summary.subtotal)],
    ["", "", "", "", "", "", "", "", "", "", "", "消費税", String(summary.tax)],
    ["", "", "", "", "", "", "", "", "", "", "", "合計", String(summary.total)],
  ].map((row) => row.map(toCellText).join("\t"));

  return [headers.join("\t"), ...rows, ...summaryRows].join("\n");
}

export function buildCsvText(
  estimate: Estimate,
  audience: ExportAudience,
  customerName: string,
): string {
  return buildTsvText(estimate, audience, customerName)
    .split("\n")
    .map((line) => line.split("\t").map(toCsvCell).join(","))
    .join("\r\n");
}

export function buildCopySummary(
  estimate: Estimate,
  customerName: string,
): string {
  const summary = buildExportSummary(estimate);
  return [
    `見積番号: ${estimate.estimateNo}`,
    `顧客名: ${customerName}`,
    `件名: ${estimate.title}`,
    `見積日: ${fmtDate(estimate.estimateDate)}`,
    `有効期限: ${fmtDate(estimate.expiresOn)}`,
    `小計: ${yen(summary.subtotal)}`,
    `消費税: ${yen(summary.tax)}`,
    `合計: ${yen(summary.total)}`,
  ].join("\n");
}

function toCellText(value: string): string {
  return value.replace(/[\t\r\n]+/g, " ").trim();
}

function toCsvCell(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}
