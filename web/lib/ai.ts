import { priceItems } from "./mock";
import type { PriceItem } from "./types";

/** AIが解析した明細候補（確定前。ユーザーが採用・編集・除外を選ぶ）。 */
export interface AiLineCandidate {
  id: string;
  location: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  /** 最有力の単価マスター候補ID。null は一致なし（手入力単価扱い）。 */
  matchItemId: string | null;
  /** 一致度 0-100。 */
  matchConfidence: number;
  /** 他の単価マスター候補（ドロップダウンで選択可）。 */
  altMatchIds: string[];
  /** AIが数量を補完した（音声に明示がなかった）。 */
  quantityCompleted?: boolean;
  /** AIが単位を補完した。 */
  unitCompleted?: boolean;
  customerNote?: string;
}

export interface AiConfirmItem {
  id: string;
  text: string;
}

export interface AiInternalCandidate {
  id: string;
  text: string;
}

export type AiSource = "voice" | "text" | "meeting";

export interface AiParseResult {
  source: AiSource;
  customerId?: string;
  siteAddress: string;
  titleSuggestion: string;
  workSummary: string;
  transcript: string;
  lines: AiLineCandidate[];
  confirmItems: AiConfirmItem[];
  internalCandidates: AiInternalCandidate[];
}

export function findPriceItem(id: string | null | undefined): PriceItem | undefined {
  if (!id) return undefined;
  return priceItems.find((p) => p.id === id);
}

export const SAMPLE_TRANSCRIPT =
  "田中さんの外壁塗装です。場所は外壁。まず足場をぐるっと、たぶん120平米くらい。" +
  "それから高圧洗浄して、シリコン塗装でお願いします。" +
  "あと目地まわりのシリコンも少し見てください。" +
  "前の道が狭いから足場の搬入は朝イチで、誘導員を1人つけてほしい。北側の家に養生しっかりで。";

/** 音声/テキスト入力に対するAI解析結果のモック（外壁塗装の例）。 */
export function mockAiResult(source: AiSource = "voice"): AiParseResult {
  return {
    source,
    customerId: "c-001",
    siteAddress: "愛知県岡崎市○○町1-1",
    titleSuggestion: "外壁シリコン塗装工事",
    workSummary: "足場・高圧洗浄・シリコン塗装。目地まわりのシリコン補修と搬入条件は要確認。",
    transcript: SAMPLE_TRANSCRIPT,
    lines: [
      {
        id: "ai-1",
        location: "外壁",
        itemName: "足場",
        quantity: 120,
        unit: "㎡",
        unitPrice: 1000,
        matchItemId: "p-003",
        matchConfidence: 98,
        altMatchIds: [],
      },
      {
        id: "ai-2",
        location: "外壁",
        itemName: "高圧洗浄",
        quantity: 120,
        unit: "㎡",
        unitPrice: 500,
        matchItemId: "p-004",
        matchConfidence: 97,
        altMatchIds: [],
        quantityCompleted: true,
      },
      {
        id: "ai-3",
        location: "外壁",
        itemName: "シリコン塗装",
        quantity: 120,
        unit: "㎡",
        unitPrice: 4000,
        matchItemId: "p-001",
        matchConfidence: 95,
        altMatchIds: ["p-001", "p-002"],
        quantityCompleted: true,
        customerNote: "シリコン塗装の標準単価を適用しています。",
      },
      {
        id: "ai-4",
        location: "目地",
        itemName: "シリコン",
        quantity: 1,
        unit: "式",
        unitPrice: 4000,
        matchItemId: "p-032",
        matchConfidence: 74,
        altMatchIds: ["p-032", "p-014"],
        unitCompleted: true,
      },
      {
        id: "ai-5",
        location: "外部",
        itemName: "養生・誘導員",
        quantity: 1,
        unit: "式",
        unitPrice: 0,
        matchItemId: null,
        matchConfidence: 0,
        altMatchIds: [],
        quantityCompleted: true,
        unitCompleted: true,
      },
    ],
    confirmItems: [
      { id: "cf-1", text: "外壁面積120㎡はAI推定値です。実測値の確認が必要です。" },
      { id: "cf-2", text: "養生・誘導員は単価マスター未登録です。必要なら諸経費または別明細として追加してください。" },
      { id: "cf-3", text: "目地まわりのシリコン補修範囲を現地で確認してください。" },
    ],
    internalCandidates: [
      { id: "in-1", text: "前面道路が狭いため、足場搬入は朝イチ。誘導員1名を手配。" },
      { id: "in-2", text: "北側隣地への養生を徹底する。" },
    ],
  };
}

/* ── 打ち合わせ録音（別オプション）のAI整理結果 ───────────── */

export interface MeetingPoint {
  id: string;
  text: string;
}

export interface MeetingReflectCandidate {
  id: string;
  label: string;
  /** 反映先の種別。customerNote=顧客向け備考（PDF表示）、internal=業者指示（PDF非表示）。 */
  kind: "line" | "customerNote" | "internal";
}

export interface MeetingSummary {
  transcript: string;
  points: MeetingPoint[];
  requests: MeetingPoint[];
  confirmItems: MeetingPoint[];
  reflectCandidates: MeetingReflectCandidate[];
}

export function mockMeetingSummary(): MeetingSummary {
  return {
    transcript:
      "（営業）本日はお時間ありがとうございます。原状回復の件、進めさせていただきます。" +
      "（顧客）クロスは全部ではなく汚れが強い部屋を優先したいです。クリーニングは1LDKでお願いします。" +
      "（営業）承知しました。コンセントプレートとソフト巾木も傷がある箇所だけ交換で見ます。" +
      "（顧客）入居前なので、作業完了写真もほしいです。",
    points: [
      { id: "mp-1", text: "クロス貼替は汚れが強い部屋を優先。" },
      { id: "mp-2", text: "クリーニングは1LDKの単価で作成。" },
      { id: "mp-3", text: "コンセントプレートとソフト巾木は傷がある箇所のみ交換。" },
    ],
    requests: [
      { id: "mr-1", text: "作業完了写真を提出してほしい。" },
      { id: "mr-2", text: "入居前に作業を完了させたい。" },
    ],
    confirmItems: [
      { id: "mc-1", text: "クロス数量は現地採寸後に確定。" },
      { id: "mc-2", text: "交換対象のコンセントプレート数を確認。" },
    ],
    reflectCandidates: [
      { id: "rc-1", label: "件名：1LDK 原状回復工事", kind: "line" },
      { id: "rc-2", label: "顧客向け備考：作業完了写真を提出します。", kind: "customerNote" },
      { id: "rc-3", label: "業者指示：入居前対応。完了写真を必ず残す。", kind: "internal" },
    ],
  };
}