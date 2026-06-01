import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/marketing/legal";

export const metadata: Metadata = {
  title: "プライバシーポリシー | ボイス見積",
  robots: { index: false },
};

export default function Page() {
  return (
    <LegalShell title="プライバシーポリシー" updated="2026年6月2日">
      <p>
        本ポリシーは、「ボイス見積」（以下「本サービス」）における利用者情報の取扱い方針を定めるものです。本サービスは現在デモ版であり、入力されたデータはブラウザ内でのみ扱われ、サーバーへ送信・保存されません。有料提供の開始にあたっては、本ポリシーを正式版へ更新します。
      </p>

      <LegalSection title="1. 取得する情報">
        <p>本サービスは、提供にあたり次の情報を取得する場合があります。</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            お問い合わせ時にご入力いただく氏名・会社名・メールアドレス・電話番号等
          </li>
          <li>サービス利用に伴う操作ログ、端末・ブラウザに関する情報</li>
          <li>
            音声入力機能の利用時に、お客様が録音・入力した音声およびテキスト
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. 利用目的">
        <ul className="list-disc space-y-1 pl-5">
          <li>本サービスの提供、本人確認、お問い合わせへの対応のため</li>
          <li>機能改善、品質向上、新機能の開発のため</li>
          <li>不正利用の防止および安全な運営のため</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. 第三者提供">
        <p>
          法令に基づく場合を除き、あらかじめご本人の同意を得ることなく、取得した情報を第三者に提供しません。
        </p>
      </LegalSection>

      <LegalSection title="4. 業務委託">
        <p>
          利用目的の達成に必要な範囲で情報の取扱いを外部へ委託する場合があります。この場合、委託先に対して適切な監督を行います。
        </p>
      </LegalSection>

      <LegalSection title="5. 安全管理措置">
        <p>
          取得した情報の漏えい、滅失またはき損の防止その他の安全管理のため、必要かつ適切な措置を講じます。
        </p>
      </LegalSection>

      <LegalSection title="6. 開示・訂正・削除">
        <p>
          ご本人からの求めに応じて、保有する個人情報の開示・訂正・利用停止・削除に対応します。下記のお問い合わせ窓口までご連絡ください。
        </p>
      </LegalSection>

      <LegalSection title="7. Cookie等の利用">
        <p>
          本サービスは、利便性向上やアクセス状況の把握のため Cookie 等を利用する場合があります。ブラウザ設定により Cookie を無効化できますが、一部機能がご利用いただけない場合があります。
        </p>
      </LegalSection>

      <LegalSection title="8. お問い合わせ窓口">
        <p>
          本ポリシーに関するお問い合わせは、
          <a href="/contact" className="font-medium text-brand-700 underline">
            お問い合わせフォーム
          </a>
          よりご連絡ください。
        </p>
      </LegalSection>

      <LegalSection title="9. 本ポリシーの改定">
        <p>
          本サービスは、必要に応じて本ポリシーを改定することがあります。重要な変更を行う場合は、本サービス上でお知らせします。
        </p>
      </LegalSection>
    </LegalShell>
  );
}
