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
  "それから高圧洗浄して、下塗り中塗り上塗りで3回塗り。シリコンの標準で。" +
  "あとシーリングの打ち替えもお願いします。たぶん80メートルくらい。" +
  "ベランダの防水も気になるって言ってた。" +
  "前の道が狭いから足場の搬入は朝イチで、誘導員を1人つけてほしい。北側の家に養生しっかりで。";

/** 音声/テキスト入力に対するAI解析結果のモック（外壁塗装の例）。 */
export function mockAiResult(source: AiSource = "voice"): AiParseResult {
  return {
    source,
    customerId: "c-001",
    siteAddress: "愛知県岡崎市○○町1-1",
    titleSuggestion: "外壁塗装工事",
    workSummary: "足場・高圧洗浄・外壁3回塗り・シーリング打替え。ベランダ防水は要確認。",
    transcript: SAMPLE_TRANSCRIPT,
    lines: [
      {
        id: "ai-1",
        location: "外壁",
        itemName: "足場設置・解体",
        quantity: 120,
        unit: "m2",
        unitPrice: 900,
        matchItemId: "p-001",
        matchConfidence: 98,
        altMatchIds: [],
      },
      {
        id: "ai-2",
        location: "外壁",
        itemName: "高圧洗浄",
        quantity: 120,
        unit: "m2",
        unitPrice: 250,
        matchItemId: "p-002",
        matchConfidence: 96,
        altMatchIds: [],
        quantityCompleted: true,
      },
      {
        id: "ai-3",
        location: "外壁",
        itemName: "外壁塗装（3回塗り）",
        quantity: 120,
        unit: "m2",
        unitPrice: 1100,
        matchItemId: "p-004",
        matchConfidence: 64,
        altMatchIds: ["p-003", "p-004", "p-005"],
        quantityCompleted: true,
        customerNote: "シリコン塗料（標準グレード）を想定。",
      },
      {
        id: "ai-4",
        location: "外壁",
        itemName: "シーリング打替え",
        quantity: 80,
        unit: "m",
        unitPrice: 1200,
        matchItemId: "p-007",
        matchConfidence: 88,
        altMatchIds: [],
        quantityCompleted: true,
      },
      {
        id: "ai-5",
        location: "ベランダ",
        itemName: "ベランダ防水",
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
      { id: "cf-1", text: "外壁の塗装面積120m2はAI推定値です。実測値の確認が必要です。" },
      { id: "cf-2", text: "ベランダ防水は単価マスター未登録です。施工範囲と単価を確認してください。" },
      { id: "cf-3", text: "屋根塗装の要否について言及がありません。確認してください。" },
    ],
    internalCandidates: [
      { id: "in-1", text: "前面道路が狭いため足場搬入は朝イチ。誘導員1名を手配。" },
      { id: "in-2", text: "北側隣地への養生を徹底する。" },
    ],
  };
}

/* ── 打ち合わせ録音（別オプション）のAI整理結果 ── */

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
      "（営業）本日はお時間ありがとうございます。外壁の件、進めさせていただきます。" +
      "（顧客）色は今より少し明るめにしたいです。あと予算は150万くらいに収めたい。" +
      "（営業）承知しました。屋根は今回見送りで。（顧客）はい。あと着工は来月の落ち着いた頃で。" +
      "（顧客）駐車場は日中使うので、資材は端に寄せてもらえると助かります。",
    points: [
      { id: "mp-1", text: "外壁塗装を進める方向で合意。屋根は今回見送り。" },
      { id: "mp-2", text: "予算の上限は約150万円。" },
      { id: "mp-3", text: "着工は翌月の中旬以降を希望。" },
    ],
    requests: [
      { id: "mr-1", text: "外壁色は現状より明るめのトーンを希望。" },
      { id: "mr-2", text: "日中は駐車場を使用するため資材は端に寄せてほしい。" },
    ],
    confirmItems: [
      { id: "mc-1", text: "予算150万円に対する仕様（塗料グレード）の調整が必要。" },
      { id: "mc-2", text: "希望色の色見本を次回提示する。" },
    ],
    reflectCandidates: [
      { id: "rc-1", label: "件名：外壁塗装工事（屋根を除く）", kind: "line" },
      { id: "rc-2", label: "顧客向け備考：外壁色は明るめトーン。色見本は契約後に確認。", kind: "customerNote" },
      { id: "rc-3", label: "業者指示：日中は駐車場使用。資材は敷地端に集約する。", kind: "internal" },
    ],
  };
}
