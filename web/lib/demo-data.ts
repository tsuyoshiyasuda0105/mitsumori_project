export type DashboardKpiTone = "brand" | "amber" | "sky" | "emerald";

export interface DashboardKpi {
  label: string;
  value: string;
  hint: string;
  tone: DashboardKpiTone;
}

export interface DashboardEstimate {
  id: string;
  estimateNo: string;
  customer: string;
  title: string;
  amount: string;
  status: "下書き" | "確認待ち" | "出力待ち" | "提出済み";
  statusTone: "slate" | "amber" | "sky" | "emerald";
  updatedAt: string;
  nextAction: string;
}

export interface DashboardFlowStep {
  title: string;
  description: string;
  href: string;
  cta: string;
}

export interface DashboardPriceCheck {
  item: string;
  unitPrice: string;
  note: string;
  risk: "更新候補" | "確認済み";
}

export interface DashboardMemoSample {
  estimateNo: string;
  customerMemo: string;
  internalMemo: string;
}

export const dashboardKpis: DashboardKpi[] = [
  { label: "見積件数", value: "42", hint: "今月作成した見積", tone: "brand" },
  { label: "下書き", value: "8", hint: "現場メモから作成中", tone: "amber" },
  { label: "確認待ち", value: "5", hint: "AI明細・単価の確認が必要", tone: "sky" },
  { label: "出力待ち", value: "3", hint: "Excel/PDF生成前の最終確認", tone: "emerald" },
];

export const recentDashboardEstimates: DashboardEstimate[] = [
  {
    id: "demo-001",
    estimateNo: "Q-2026-0042",
    customer: "田中 太郎 様",
    title: "外壁塗装・シーリング打ち替え",
    amount: "1,284,800円",
    status: "確認待ち",
    statusTone: "amber",
    updatedAt: "10分前",
    nextAction: "AI抽出した面積と塗装回数を確認",
  },
  {
    id: "demo-002",
    estimateNo: "Q-2026-0041",
    customer: "鈴木建設 株式会社",
    title: "屋根・外壁改修工事",
    amount: "2,486,000円",
    status: "出力待ち",
    statusTone: "sky",
    updatedAt: "42分前",
    nextAction: "社内メモを除外してPDF出力",
  },
  {
    id: "demo-003",
    estimateNo: "Q-2026-0040",
    customer: "佐藤 花子 様",
    title: "内装クロス張替え",
    amount: "348,700円",
    status: "下書き",
    statusTone: "slate",
    updatedAt: "今日 9:12",
    nextAction: "音声メモから不足項目を追記",
  },
  {
    id: "demo-004",
    estimateNo: "Q-2026-0039",
    customer: "山田工務店",
    title: "ブロック塀積み工事",
    amount: "742,500円",
    status: "提出済み",
    statusTone: "emerald",
    updatedAt: "昨日 16:30",
    nextAction: "顧客回答待ち",
  },
];

export const voiceToEstimateFlow: DashboardFlowStep[] = [
  {
    title: "1. 現場で話す",
    description: "お客様との会話や現地確認をそのまま録音します。",
    href: "/estimates/demo-001/voice",
    cta: "音声入力を開始",
  },
  {
    title: "2. AIが明細化",
    description: "施工箇所、数量、単位、注意点を見積明細候補に整理します。",
    href: "/estimates/demo-001/ai-review",
    cta: "明細候補を確認",
  },
  {
    title: "3. 見積書に出力",
    description: "顧客向けメモと社内メモを分けてExcel/PDFに出力します。",
    href: "/estimates/demo-002/export",
    cta: "出力設定へ",
  },
];

export const priceMasterChecks: DashboardPriceCheck[] = [
  {
    item: "シリコン塗装",
    unitPrice: "4,000円 / ㎡",
    note: "外壁塗装デモの標準単価として利用中",
    risk: "確認済み",
  },
  {
    item: "クロス 貼替",
    unitPrice: "1,300円 / ㎡",
    note: "原状回復案件で利用頻度が高い品目",
    risk: "確認済み",
  },
  {
    item: "諸経費",
    unitPrice: "0円 / 式",
    note: "案件ごとに手入力・調整する想定",
    risk: "更新候補",
  },
];

export const memoSamples: DashboardMemoSample[] = [
  {
    estimateNo: "Q-2026-0042",
    customerMemo: "工期は天候により変更となる場合があります。",
    internalMemo: "隣地が近いため、足場搬入前に近隣挨拶を必ず実施。",
  },
  {
    estimateNo: "Q-2026-0041",
    customerMemo: "既存屋根の状態により補修範囲を協議します。",
    internalMemo: "高所作業が多いため安全帯と追加人員を手配。",
  },
];
