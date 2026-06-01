import type {
  Company,
  CurrentUser,
  Customer,
  Estimate,
  PriceItem,
} from "./types";

export const company: Company = {
  name: "〇〇株式会社",
  postalCode: "444-0123",
  address: "愛知県額田郡幸田町大字芦谷字○○1-2-3",
  phone: "0564-00-0000",
  email: "info@kouta-tosou.example.jp",
  representativeName: "代表取締役 近藤 健一",
  invoiceRegistrationNo: "T1234567890123",
  bankAccountText: "○○銀行 幸田支店 普通 1234567 コウタトソウコウギョウ（カ",
  defaultNote:
    "・本見積の有効期限は発行日より30日間です。\n・工事金額は現地状況により変動する場合があります。",
};

export const currentUser: CurrentUser = {
  id: "user-001",
  name: "山田 涼",
  role: "admin",
};

export const priceItems: PriceItem[] = [
  { id: "p-001", name: "足場設置・解体", unit: "m2", unitPrice: 900, isActive: true },
  { id: "p-002", name: "高圧洗浄", unit: "m2", unitPrice: 250, isActive: true },
  { id: "p-003", name: "外壁 下塗り", unit: "m2", unitPrice: 800, isActive: true },
  { id: "p-004", name: "外壁 中塗り", unit: "m2", unitPrice: 1100, isActive: true },
  { id: "p-005", name: "外壁 上塗り", unit: "m2", unitPrice: 1100, isActive: true },
  { id: "p-006", name: "屋根塗装", unit: "m2", unitPrice: 2500, isActive: true },
  { id: "p-007", name: "シーリング打替え", unit: "m", unitPrice: 1200, isActive: true },
  { id: "p-008", name: "養生", unit: "式", unitPrice: 15000, isActive: true },
  { id: "p-009", name: "軒天塗装", unit: "m2", unitPrice: 1300, isActive: true },
  { id: "p-010", name: "雨樋塗装", unit: "m", unitPrice: 800, isActive: true },
  { id: "p-011", name: "廃材処分費", unit: "式", unitPrice: 20000, isActive: true },
  { id: "p-012", name: "下地補修", unit: "箇所", unitPrice: 3500, isActive: false },
];

export const customers: Customer[] = [
  {
    id: "c-001",
    name: "田中 太郎",
    nameKana: "タナカ タロウ",
    postalCode: "444-0201",
    address: "愛知県岡崎市○○町1-1",
    phone: "090-0000-0001",
    email: "tanaka@example.com",
    contactName: "田中 太郎",
    note: "築18年戸建。前回は2年前に屋根補修。",
  },
  {
    id: "c-002",
    name: "鈴木建設 株式会社",
    nameKana: "スズキケンセツ",
    postalCode: "445-0001",
    address: "愛知県西尾市○○1-5",
    phone: "0563-00-0002",
    email: "info@suzuki-ken.example.com",
    contactName: "鈴木 一郎",
    note: "協力会社。複数現場あり。",
  },
  {
    id: "c-003",
    name: "佐藤 花子",
    nameKana: "サトウ ハナコ",
    postalCode: "444-0512",
    address: "愛知県額田郡幸田町○○2-3",
    phone: "090-0000-0003",
    email: "sato@example.com",
    contactName: "佐藤 花子",
    note: "内装リフォーム検討中。",
  },
  {
    id: "c-004",
    name: "山田工務店",
    nameKana: "ヤマダコウムテン",
    postalCode: "446-0001",
    address: "愛知県安城市○○3-7",
    phone: "0566-00-0004",
    email: "yamada@example.com",
    contactName: "山田 健",
    note: "",
  },
  {
    id: "c-005",
    name: "高橋商店",
    nameKana: "タカハシショウテン",
    postalCode: "444-0007",
    address: "愛知県岡崎市○○4-2",
    phone: "0564-00-0005",
    email: "takahashi@example.com",
    contactName: "高橋 学",
    note: "店舗併用住宅。",
  },
];

export const estimates: Estimate[] = [
  {
    id: "est-001",
    estimateNo: "Q-2026-0042",
    customerId: "c-001",
    title: "外壁塗装工事",
    estimateDate: "2026-06-01",
    expiresOn: "2026-06-30",
    status: "draft",
    assignee: "山田 涼",
    customerNote:
      "工事期間は天候により変更となる場合があります。色見本は契約後にご確認いただきます。",
    internalInstruction:
      "搬入経路注意。北側隣地への養生を徹底する。近隣あいさつは着工3日前までに実施。",
    updatedAt: "2026-06-01T10:20:00",
    lines: [
      {
        id: "l-1",
        lineNo: 1,
        priceItemId: "p-001",
        location: "外壁",
        itemName: "足場設置・解体",
        quantity: 120,
        unit: "m2",
        unitPrice: 900,
        lineType: "normal",
        internalInstruction: "足場は朝8時搬入。前面道路の幅員が狭いため誘導員1名手配。",
      },
      {
        id: "l-2",
        lineNo: 2,
        priceItemId: "p-002",
        location: "外壁",
        itemName: "高圧洗浄",
        quantity: 120,
        unit: "m2",
        unitPrice: 250,
        lineType: "normal",
        internalInstruction: "近隣車両への飛散養生を確認する。",
      },
      {
        id: "l-3",
        lineNo: 3,
        priceItemId: "p-003",
        location: "外壁",
        itemName: "外壁 下塗り",
        quantity: 120,
        unit: "m2",
        unitPrice: 800,
        lineType: "normal",
      },
      {
        id: "l-4",
        lineNo: 4,
        priceItemId: "p-004",
        location: "外壁",
        itemName: "外壁 中塗り",
        quantity: 120,
        unit: "m2",
        unitPrice: 1100,
        lineType: "normal",
        customerNote: "シリコン塗料（標準グレード）を想定。",
      },
      {
        id: "l-5",
        lineNo: 5,
        priceItemId: "p-005",
        location: "外壁",
        itemName: "外壁 上塗り",
        quantity: 120,
        unit: "m2",
        unitPrice: 1100,
        lineType: "normal",
      },
    ],
  },
  {
    id: "est-002",
    estimateNo: "Q-2026-0041",
    customerId: "c-002",
    title: "屋根・外壁塗装工事",
    estimateDate: "2026-05-28",
    expiresOn: "2026-06-27",
    status: "submitted",
    assignee: "山田 涼",
    customerNote: "",
    internalInstruction: "高所作業多め。安全帯必須。",
    updatedAt: "2026-05-28T16:05:00",
    lines: [
      {
        id: "l2-1",
        lineNo: 1,
        priceItemId: "p-006",
        location: "屋根",
        itemName: "屋根塗装",
        quantity: 80,
        unit: "m2",
        unitPrice: 2500,
        lineType: "normal",
      },
      {
        id: "l2-2",
        lineNo: 2,
        priceItemId: "p-005",
        location: "外壁",
        itemName: "外壁 上塗り",
        quantity: 150,
        unit: "m2",
        unitPrice: 1100,
        lineType: "normal",
      },
    ],
  },
  {
    id: "est-003",
    estimateNo: "Q-2026-0040",
    customerId: "c-003",
    title: "内装リフォーム（クロス張替）",
    estimateDate: "2026-05-30",
    expiresOn: "2026-06-29",
    status: "draft",
    assignee: "佐藤 美咲",
    customerNote: "",
    internalInstruction: "",
    updatedAt: "2026-05-31T09:00:00",
    hasUnconfirmedAi: true,
    lines: [],
  },
  {
    id: "est-004",
    estimateNo: "Q-2026-0039",
    customerId: "c-004",
    title: "外構ブロック積み工事",
    estimateDate: "2026-05-20",
    expiresOn: "2026-06-19",
    status: "won",
    assignee: "山田 涼",
    customerNote: "",
    internalInstruction: "",
    updatedAt: "2026-05-22T11:30:00",
    lines: [
      {
        id: "l4-1",
        lineNo: 1,
        location: "境界",
        itemName: "ブロック積み",
        quantity: 25,
        unit: "m2",
        unitPrice: 12000,
        lineType: "normal",
      },
    ],
  },
  {
    id: "est-005",
    estimateNo: "Q-2026-0038",
    customerId: "c-005",
    title: "店舗外装改装",
    estimateDate: "2026-05-10",
    expiresOn: "2026-06-09",
    status: "lost",
    assignee: "佐藤 美咲",
    customerNote: "",
    internalInstruction: "",
    updatedAt: "2026-05-12T14:00:00",
    lines: [
      {
        id: "l5-1",
        lineNo: 1,
        location: "正面",
        itemName: "外壁 上塗り",
        quantity: 60,
        unit: "m2",
        unitPrice: 1100,
        lineType: "normal",
      },
    ],
  },
  {
    id: "est-006",
    estimateNo: "Q-2026-0037",
    customerId: "c-001",
    title: "ベランダ防水工事",
    estimateDate: "2026-06-01",
    expiresOn: "2026-07-01",
    status: "draft",
    assignee: "山田 涼",
    customerNote: "",
    internalInstruction: "",
    updatedAt: "2026-06-01T08:15:00",
    lines: [],
  },
];

export function blankEstimate(id: string): Estimate {
  return {
    id,
    estimateNo: "（保存時に自動採番）",
    customerId: undefined,
    title: "",
    estimateDate: "2026-06-02",
    expiresOn: "2026-07-02",
    status: "draft",
    assignee: currentUser.name,
    customerNote: company.defaultNote,
    internalInstruction: "",
    updatedAt: "2026-06-02T09:00:00",
    lines: [],
  };
}

/** 既存見積を取得。見つからない（"new" 等）場合は新規ドラフトを返す。 */
export function getEstimateOrBlank(id: string): {
  estimate: Estimate;
  isNew: boolean;
} {
  const found = getEstimate(id);
  if (found) return { estimate: found, isNew: false };
  return { estimate: blankEstimate(id), isNew: true };
}

export function getCustomer(id?: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}

export function getEstimate(id: string): Estimate | undefined {
  return estimates.find((e) => e.id === id);
}

export function customerName(id?: string): string {
  return getCustomer(id)?.name ?? "（顧客未選択）";
}
