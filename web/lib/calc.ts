import type { EstimateLine } from "./types";

export const TAX_RATE = 0.1;

export function lineAmount(line: EstimateLine): number {
  return Math.round(line.quantity * line.unitPrice);
}

export interface Totals {
  subtotal: number;
  tax: number;
  total: number;
}

export function computeTotals(lines: EstimateLine[]): Totals {
  const subtotal = lines
    .filter((l) => l.lineType !== "note")
    .reduce((sum, l) => sum + lineAmount(l), 0);
  const tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, tax, total: subtotal + tax };
}
