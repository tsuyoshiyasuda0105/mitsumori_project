import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/marketing/legal";

export const metadata: Metadata = {
  title: "利用規約 | ボイス見積",
  robots: { index: false },
};

export default function Page() {
  return (
    <LegalShell title="利用規約" updated="2026年6月2日">
      <p>
        本規約は、「ボイス見積」（以下「本サービス」）の利用条件を定めるものです。利用者は、本規約に同意のうえ本サービスを利用するものとします。なお、本サービスは現在デモ版として提供されています。
      </p>

      <LegalSection title="第1条（適用）">
        <p>
          本規約は、本サービスの提供条件および当方と利用者との間の権利義務関係に適用されます。
        </p>
      </LegalSection>

      <LegalSection title="第2条（利用登録）">
        <p>
          利用者は、当方の定める方法により利用登録を申請し、当方がこれを承認することで本サービスを利用できます。当方は、登録が適当でないと判断した場合、承認しないことがあります。
        </p>
      </LegalSection>

      <LegalSection title="第3条（アカウントの管理）">
        <p>
          利用者は、自己の責任においてアカウント情報を管理するものとし、第三者への貸与・共有・譲渡を行ってはなりません。
        </p>
      </LegalSection>

      <LegalSection title="第4条（禁止事項）">
        <p>利用者は、次の行為をしてはなりません。</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>法令または公序良俗に違反する行為</li>
          <li>当方または第三者の権利・利益を侵害する行為</li>
          <li>本サービスの運営を妨害する行為、不正アクセス等</li>
          <li>本サービスを通じて取得した情報の不正な利用</li>
        </ul>
      </LegalSection>

      <LegalSection title="第5条（本サービスの提供の停止等）">
        <p>
          当方は、保守、システム障害、不可抗力等やむを得ない事由がある場合、利用者に事前に通知することなく本サービスの全部または一部の提供を停止することがあります。
        </p>
      </LegalSection>

      <LegalSection title="第6条（免責事項）">
        <p>
          本サービスは現在デモ版であり、特定の目的への適合性、正確性、有用性等について、明示・黙示を問わずいかなる保証も行いません。AIによる見積の下書きは参考情報であり、最終的な内容は利用者の責任で確認・確定してください。本サービスの利用により生じた損害について、当方は法令上許容される範囲で責任を負いません。
        </p>
      </LegalSection>

      <LegalSection title="第7条（サービス内容の変更・終了）">
        <p>
          当方は、利用者に通知することなく本サービスの内容を変更し、または提供を終了することができます。
        </p>
      </LegalSection>

      <LegalSection title="第8条（規約の変更）">
        <p>
          当方は、必要と判断した場合、本規約を変更することがあります。変更後の規約は、本サービス上に表示した時点から効力を生じます。
        </p>
      </LegalSection>

      <LegalSection title="第9条（準拠法・裁判管轄）">
        <p>
          本規約の解釈には日本法を準拠法とし、本サービスに関して紛争が生じた場合には、当方所在地を管轄する裁判所を専属的合意管轄とします。
        </p>
      </LegalSection>
    </LegalShell>
  );
}
