export type Role = "admin" | "member";

export type EstimateStatus =
  | "draft"
  | "submitted"
  | "won"
  | "lost"
  | "cancelled";

export type LineType = "normal" | "discount" | "expense" | "note";

export interface Company {
  name: string;
  postalCode: string;
  address: string;
  phone: string;
  email: string;
  representativeName: string;
  invoiceRegistrationNo: string;
  bankAccountText: string;
  defaultNote: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  role: Role;
}

export interface PriceItem {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  nameKana: string;
  postalCode: string;
  address: string;
  phone: string;
  email: string;
  contactName: string;
  note: string;
}

export interface EstimateLine {
  id: string;
  lineNo: number;
  priceItemId?: string;
  location: string;
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  /** 顧客向け備考（PDF表示） */
  customerNote?: string;
  /** 業者指示事項（内部用・PDF非表示） */
  internalInstruction?: string;
  lineType: LineType;
}

export interface Estimate {
  id: string;
  estimateNo: string;
  customerId?: string;
  title: string;
  estimateDate: string; // ISO yyyy-mm-dd
  expiresOn: string;
  status: EstimateStatus;
  assignee: string;
  lines: EstimateLine[];
  /** 顧客向け備考（PDF表示） */
  customerNote: string;
  /** 見積全体の業者指示事項（内部用・PDF非表示） */
  internalInstruction: string;
  updatedAt: string;
  /** AI解析からの未確認候補が残っているか */
  hasUnconfirmedAi?: boolean;
}

export const STATUS_LABEL: Record<EstimateStatus, string> = {
  draft: "下書き",
  submitted: "提出済み",
  won: "受注",
  lost: "失注",
  cancelled: "取消",
};

export const LINE_TYPE_LABEL: Record<LineType, string> = {
  normal: "明細",
  discount: "値引き",
  expense: "諸経費",
  note: "備考行",
};
