/** 1234567 -> "1,234,567" */
export function groupNum(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

/** 金額表示: "1,234,567円" */
export function yen(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}${groupNum(Math.abs(n))}円`;
}

/** "2026-06-01" -> "2026/06/01" */
export function fmtDate(iso: string): string {
  if (!iso) return "";
  return iso.replaceAll("-", "/");
}

const WD = ["日", "月", "火", "水", "木", "金", "土"];

/** "2026-06-01" -> "6/1(月)" */
export function fmtDateShort(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}(${WD[d.getDay()]})`;
}

/** 秒 -> "mm:ss" */
export function fmtClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
