import type { Metadata } from "next";
import { LegalShell, LegalRow, Ph } from "@/components/marketing/legal";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | ボイス見積",
  robots: { index: false },
};

const company = {
  name: "請求があった場合、遅滞なく開示します。",
  representativeName: "請求があった場合、遅滞なく開示します。",
  postalCode: "",
  address: "請求があった場合、遅滞なく開示します。",
  phone: "0000-0000-0000",
  contact: "お問い合わせ先メールアドレスは現在非公開です。請求があった場合、遅滞なく開示します。",
};

export default function Page() {
  return (
    <LegalShell title="特定商取引法に基づく表記" updated="2026年6月3日">
      <dl>
        <LegalRow label="販売事業者名">{company.name}</LegalRow>
        <LegalRow label="運営統括責任者">{company.representativeName}</LegalRow>
        <LegalRow label="所在地">
          <Ph>{company.postalCode ? `〒${company.postalCode} ` : ""}{company.address}</Ph>
        </LegalRow>
        <LegalRow label="電話番号">
          {company.phone}（受付時間：平日 9:00〜18:00）
        </LegalRow>
        <LegalRow label="お問い合わせ先">
          <Ph>{company.contact}</Ph>
        </LegalRow>
        <LegalRow label="販売価格">
          <Ph>料金プランページに記載、または個別見積にて提示します。</Ph>
        </LegalRow>
        <LegalRow label="商品代金以外の必要料金">
          インターネット接続料金、通信料金はお客様のご負担となります。
        </LegalRow>
        <LegalRow label="お支払い方法">
          <Ph>クレジットカード決済、銀行振込などを予定しています。</Ph>
        </LegalRow>
        <LegalRow label="お支払い時期">
          <Ph>契約内容または請求書に定める期日までにお支払いください。</Ph>
        </LegalRow>
        <LegalRow label="サービス提供時期">
          お申し込み手続きの完了後、利用環境の準備が整い次第ご利用いただけます。
        </LegalRow>
        <LegalRow label="返品・キャンセルについて">
          サービスの性質上、提供開始後の返品は承っておりません。解約条件は契約内容に基づきます。
        </LegalRow>
        <LegalRow label="動作環境">
          最新版の Google Chrome / Safari / Microsoft Edge を推奨します。
        </LegalRow>
      </dl>
    </LegalShell>
  );
}
