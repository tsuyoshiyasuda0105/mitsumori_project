import type { Metadata } from "next";
import { Landing } from "@/components/marketing/Landing";

const LP_TITLE = "ボイス見積 | 現場で話すだけ、AIが見積を下書き";
const LP_DESC =
  "外壁塗装・リフォーム業のための音声AI見積作成システム。現場のスマホで話すだけでAIが明細を下書き。Excel単価表の取込、顧客/社内の情報分離、PDF・Excel出力に対応。";

export const metadata: Metadata = {
  title: LP_TITLE,
  description: LP_DESC,
  keywords: [
    "見積作成",
    "音声入力",
    "AI見積",
    "外壁塗装",
    "リフォーム",
    "建設業",
    "見積書",
    "Excel",
    "PDF",
  ],
  alternates: { canonical: "/lp" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "ボイス見積",
    url: "/lp",
    title: LP_TITLE,
    description: LP_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: LP_TITLE,
    description: LP_DESC,
  },
};

export default function Page() {
  return <Landing />;
}
