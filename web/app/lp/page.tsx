import type { Metadata } from "next";
import { Landing } from "@/components/marketing/Landing";

export const metadata: Metadata = {
  title: "ボイス見積 | 現場で話すだけ、AIが見積を下書き",
  description:
    "外壁塗装・リフォーム業のための音声AI見積作成システム。現場のスマホで話すだけでAIが明細を下書き。Excel単価表の取込、顧客/社内の情報分離、PDF・Excel出力に対応。",
};

export default function Page() {
  return <Landing />;
}
