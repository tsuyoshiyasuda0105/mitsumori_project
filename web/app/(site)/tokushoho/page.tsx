import type { Metadata } from "next";
import { LegalShell, LegalRow, Ph } from "@/components/marketing/legal";
import { company } from "@/lib/mock";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | ボイス見積",
  robots: { index: false },
};

export default function Page() {
  return (
    <LegalShell title="特定商取引法に基づく表記" updated="2026年6月2日">
      <dl>
        <LegalRow label="販売事業者名">{company.name}</LegalRow>
        <LegalRow label="運営統括責任者">{company.representativeName}</LegalRow>
        <LegalRow label="所在地">
          〒{company.postalCode}　{company.address}
        </LegalRow>
        <LegalRow label="電話番号">
          {company.phone}（受付時間: 平日 9:00〜18:00）
        </LegalRow>
        <LegalRow label="メールアドレス">
          <Ph>{company.email}</Ph>
        </LegalRow>
        <LegalRow label="販売価格">
          <Ph>〔料金プランページに記載／確定前〕</Ph>
        </LegalRow>
        <LegalRow label="商品代金以外の必要料金">
          インターネット接続料金・通信料金はお客様のご負担となります。
        </LegalRow>
        <LegalRow label="お支払い方法">
          <Ph>〔クレジットカード決済等／確定前〕</Ph>
        </LegalRow>
        <LegalRow label="お支払い時期">
          <Ph>〔毎月の課金日／確定前〕</Ph>
        </LegalRow>
        <LegalRow label="サービスの提供時期">
          お申し込み手続きの完了後、直ちにご利用いただけます。
        </LegalRow>
        <LegalRow label="返品・解約について">
          サービスの性質上、購入後の返金は承っておりません。解約は次回更新日の前日までにお手続きください。
          <Ph>〔確定前〕</Ph>
        </LegalRow>
        <LegalRow label="動作環境">
          最新版の Google Chrome / Safari / Microsoft Edge を推奨します。
        </LegalRow>
      </dl>
    </LegalShell>
  );
}
