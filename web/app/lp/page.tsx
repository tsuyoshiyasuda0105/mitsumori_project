import type { Metadata } from "next";
import { Landing } from "@/components/marketing/Landing";

const LP_TITLE =
  "建設業向け音声AI見積作成システム";

const LP_DESC =
  "現場で話した内容から見積明細の下書きを作成。単価マスターExcel取込、業者指示事項の分離、Excel/PDF出力に対応する建設業向け音声AI見積作成システムです。";

const FAQ_JSON_LD = [
  {
    "@type": "Question",
    name: "AIが見積金額を自動で確定しますか？",
    acceptedAnswer: {
      "@type": "Answer",
      text: "いいえ。AIは明細候補を作る補助役です。最終的な品目、数量、単価、金額は担当者が確認して確定します。",
    },
  },
  {
    "@type": "Question",
    name: "今使っているExcelの単価表は使えますか？",
    acceptedAnswer: {
      "@type": "Answer",
      text: "はい。列マッピングとプレビューを通して、既存の単価表を単価マスターへ取り込む前提です。",
    },
  },
  {
    "@type": "Question",
    name: "業者指示事項は顧客に見えませんか？",
    acceptedAnswer: {
      "@type": "Answer",
      text: "顧客向けPDFには出さず、社内確認用または業者指示用のExcelにのみ含める設計です。",
    },
  },
  {
    "@type": "Question",
    name: "他社のデータが見える心配はありませんか？",
    acceptedAnswer: {
      "@type": "Answer",
      text: "会社IDとRLSを使い、ログイン中の会社に紐づくデータだけを参照・更新する設計にします。",
    },
  },
];

const STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ボイス見積",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: LP_DESC,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/PreOrder",
      price: "0",
      priceCurrency: "JPY",
    },
    featureList: [
      "音声入力による見積明細候補作成",
      "単価マスターExcel取込",
      "業者指示事項の出力分離",
      "見積書PDF出力",
      "見積Excel出力",
      "会社別データ分離",
    ],
    audience: {
      "@type": "BusinessAudience",
      audienceType: "建設業、外壁塗装、リフォーム、設備工事",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_JSON_LD,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ボイス見積",
        item: "/lp",
      },
    ],
  },
];

export const metadata: Metadata = {
  title: LP_TITLE,
  description: LP_DESC,
  keywords: [
    "建設業 見積",
    "音声入力 見積",
    "AI 見積",
    "単価マスター",
    "Excel 見積",
    "リフォーム 見積",
    "外壁塗装 見積",
  ],
  alternates: { canonical: "/lp" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "ボイス見積",
    url: "/lp",
    title: LP_TITLE,
    description: LP_DESC,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "ボイス見積 建設業向け音声AI見積作成システム",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: LP_TITLE,
    description: LP_DESC,
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <Landing />
    </>
  );
}
