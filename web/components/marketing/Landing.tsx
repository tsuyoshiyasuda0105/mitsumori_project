import Link from "next/link";
import type { ReactNode } from "react";
import {
  Building,
  Check,
  ChevronRight,
  EyeOff,
  FileText,
  Lock,
  Mic,
  Search,
  Share,
  Sparkles,
  Spreadsheet,
  Upload,
} from "@/components/icons";

const NAV = [
  { href: "#problem", label: "課題" },
  { href: "#features", label: "機能" },
  { href: "#flow", label: "流れ" },
  { href: "#security", label: "安全設計" },
  { href: "#faq", label: "FAQ" },
];

const PROBLEMS = [
  {
    title: "現場メモが散らばる",
    body: "打ち合わせ内容が手帳、写真、LINE、記憶に分かれ、見積作成時に探し直しが発生します。",
  },
  {
    title: "単価の確認に時間がかかる",
    body: "品目ごとの単位や単価をExcelから探して転記するため、入力漏れや金額のばらつきが起きます。",
  },
  {
    title: "内部メモの出し分けが怖い",
    body: "原価、利益、業者への指示を見積書に載せないよう、出力前の確認に神経を使います。",
  },
];

const FEATURES = [
  {
    icon: <Mic className="text-xl" />,
    title: "音声から明細候補を作成",
    body: "場所、品目、数量、備考、業者指示事項をAIが候補化。顧客や見積日などのヘッダ情報はAIで入力しません。",
  },
  {
    icon: <Spreadsheet className="text-xl" />,
    title: "単価マスターExcel取込",
    body: "既存の単価表を取り込み、品目、単位、単価、外部品目IDを管理。AIは単位を推測せず、マスターの単位を使います。",
  },
  {
    icon: <EyeOff className="text-xl" />,
    title: "業者指示事項を分離",
    body: "明細ごとに内部向け指示を保持。顧客向けPDFには出さず、社内確認用Excelには出力できます。",
  },
  {
    icon: <FileText className="text-xl" />,
    title: "Excel/PDF出力",
    body: "顧客向け見積書PDFと、社内確認・業者指示用Excelを用途別に出力します。",
  },
  {
    icon: <Lock className="text-xl" />,
    title: "会社別データ分離",
    body: "SupabaseのRLSを前提に、自社の顧客、単価、見積、音声ファイルだけを扱う設計です。",
  },
  {
    icon: <Share className="text-xl" />,
    title: "外部連携を見据えたID",
    body: "単価マスターに独自IDを持たせ、原価管理、施工管理、会計ソフトへの将来連携に備えます。",
  },
];

const STEPS = [
  {
    no: "01",
    title: "顧客を選択",
    body: "見積編集画面で顧客と件名を選びます。AIが顧客情報を勝手に入力することはありません。",
  },
  {
    no: "02",
    title: "現場内容を話す",
    body: "スマホで作業内容を録音。テキスト入力からも同じ流れで明細候補を作れます。",
  },
  {
    no: "03",
    title: "単価マスターと照合",
    body: "AIが品目候補を出し、単価マスターの単位と単価を候補として提示します。",
  },
  {
    no: "04",
    title: "確認して出力",
    body: "担当者が明細を確認し、PDFまたはExcelで出力。業者指示事項は出力先ごとに分離します。",
  },
];

const FAQS = [
  {
    q: "AIが見積金額を自動で確定しますか？",
    a: "いいえ。AIは明細候補を作る補助役です。最終的な品目、数量、単価、金額は担当者が確認して確定します。",
  },
  {
    q: "今使っているExcelの単価表は使えますか？",
    a: "はい。列マッピングとプレビューを通して、既存の単価表を単価マスターへ取り込む前提です。",
  },
  {
    q: "業者指示事項は顧客に見えませんか？",
    a: "顧客向けPDFには出さず、社内確認用または業者指示用のExcelにのみ含める設計です。",
  },
  {
    q: "他社のデータが見える心配はありませんか？",
    a: "会社IDとRLSを使い、ログイン中の会社に紐づくデータだけを参照・更新する設計にします。",
  },
  {
    q: "打ち合わせ録音機能も含まれますか？",
    a: "打ち合わせ録音は別オプションとして扱います。MVP本体では見積明細作成に必要な音声入力を優先します。",
  },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <Features />
        <Flow />
        <MasterImport />
        <Security />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/lp" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Mic className="text-lg" />
          </span>
          <span className="text-base font-bold">ボイス見積</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-brand-700">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/blog"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
          >
            お役立ち記事
          </Link>
          <Link
            href="/contact"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
          >
            相談する
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            デモを試す
            <ChevronRight className="text-base" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
      <ProductScene />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
            <Sparkles className="text-sm" />
            建設業向け 音声AI見積作成システム
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
            現場で話した内容を、
            <span className="block text-sky-200">見積明細の下書きに。</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
            ボイス見積は、外壁塗装・リフォーム・設備工事などの見積作成を、
            音声入力、単価マスター照合、Excel/PDF出力まで一つの流れで支えるプロトタイプです。
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-white px-6 text-base font-bold text-slate-950 hover:bg-slate-100"
            >
              デモを試す
              <ChevronRight className="text-lg" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-white/30 px-6 text-base font-bold text-white hover:bg-white/10"
            >
              導入相談をする
            </Link>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
            <HeroPoint>単価表Excelを活用</HeroPoint>
            <HeroPoint>業者指示事項を分離</HeroPoint>
            <HeroPoint>会社別データ分離</HeroPoint>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductScene() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-85">
      <div className="absolute inset-y-10 right-[-120px] hidden w-[680px] lg:block">
        <div className="rounded-lg border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <div>
              <div className="text-xs text-slate-300">見積編集</div>
              <div className="mt-1 text-lg font-bold text-white">外壁塗装 A様邸</div>
            </div>
            <span className="rounded-lg bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-100">
              AI候補確認中
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {[
              ["外壁", "シリコン塗装", "180㎡", "432,000円"],
              ["足場", "くさび式足場", "210㎡", "189,000円"],
              ["屋根", "高圧洗浄", "95㎡", "42,750円"],
            ].map((row) => (
              <div
                key={row.join("-")}
                className="grid grid-cols-[1fr_1.4fr_.8fr_1fr] gap-3 rounded-lg border border-white/10 bg-white/12 px-4 py-3 text-sm text-white"
              >
                {row.map((cell) => (
                  <span key={cell}>{cell}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-amber-300/30 bg-amber-200/15 p-3 text-sm text-amber-50">
            業者指示事項: 北面の下地補修を先に確認。顧客向けPDFには非表示。
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 hidden w-56 rounded-[2rem] border-[8px] border-slate-900 bg-slate-900 shadow-2xl md:block">
        <div className="rounded-[1.35rem] bg-white p-4 text-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">録音中</span>
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          </div>
          <div className="my-6 flex justify-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500 text-white">
              <Mic className="text-3xl" />
            </span>
          </div>
          <div className="flex h-10 items-center justify-center gap-1">
            {[12, 24, 18, 32, 16, 28, 36, 20, 14].map((h, i) => (
              <span
                key={`${h}-${i}`}
                className="w-1.5 rounded-full bg-brand-500"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-violet-50 p-2 text-xs font-medium text-violet-700">
            AIが明細候補を作成しています
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroPoint({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Check className="shrink-0 text-emerald-300" />
      <span>{children}</span>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  desc,
  center,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-bold text-brand-700">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {desc && <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{desc}</p>}
    </div>
  );
}

function Problem() {
  return (
    <section id="problem" className="scroll-mt-20 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="見積業務の課題"
          title="見積が遅れる原因は、現場情報と単価情報が分かれていることです。"
          desc="建設業の見積は、現場で聞いた内容、社内の単価表、業者への指示、顧客向けの表現が混ざりやすい業務です。"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PROBLEMS.map((item, index) => (
            <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-sm font-bold text-rose-700">
                {index + 1}
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="主要機能"
          title="音声、単価、出力の流れを見積業務に合わせてつなぎます。"
          desc="AIに任せる部分と、人が確認する部分を分け、現場で使いやすい見積作成フローを目指します。"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-lg border border-slate-200 bg-white p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                {feature.icon}
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Flow() {
  return (
    <section id="flow" className="scroll-mt-20 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="作成フロー"
          title="見積ヘッダは手入力、明細だけをAIで支援します。"
          desc="顧客情報や担当者などの重要なヘッダ情報はAIで埋めず、見積明細の下書き作成にAIを使います。"
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.no} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="text-sm font-bold text-brand-700">{step.no}</div>
              <h3 className="mt-3 text-base font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MasterImport() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <SectionHeading
            eyebrow="Excel単価表を活用"
            title="今ある単価表を、AI見積の判断材料にします。"
            desc="品目、単位、単価、外部品目IDを単価マスターとして整備。AIが音声から品目候補を推測し、単価マスターの候補を表示します。"
          />
          <div className="mt-6 flex flex-col gap-3">
            <PlainCheck>列マッピングで既存Excelを取り込み</PlainCheck>
            <PlainCheck>プレビューで重複や単価不正を確認</PlainCheck>
            <PlainCheck>外部システム連携用の独自IDを保持</PlainCheck>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Upload className="text-brand-700" />
              単価マスター取込
            </div>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              128件確認済み
            </span>
          </div>
          <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 px-5 py-2 text-xs font-bold text-slate-500">
            <span>品目</span>
            <span>単位</span>
            <span>単価</span>
            <span>外部ID</span>
          </div>
          {[
            ["シリコン塗装", "㎡", "2,400", "PAINT-001"],
            ["高圧洗浄", "㎡", "450", "WASH-012"],
            ["くさび式足場", "㎡", "900", "SCAFF-004"],
          ].map((row) => (
            <div
              key={row.join("-")}
              className="grid grid-cols-4 border-b border-slate-100 px-5 py-3 text-sm text-slate-700 last:border-b-0"
            >
              {row.map((cell) => (
                <span key={cell}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  return (
    <section id="security" className="scroll-mt-20 bg-slate-950 py-16 text-white sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold text-sky-200">安全設計</p>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">
            顧客向け情報と社内向け情報を、最初から分けて扱います。
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-200 sm:text-base">
            会社別データ分離、業者指示事項の非表示制御、AI候補の人間確認を前提にした設計です。
            見積業務のスピードだけでなく、情報漏れの不安を減らすことを重視します。
          </p>
        </div>

        <div className="grid gap-3">
          <SecurityRow
            icon={<Building />}
            title="会社別データ分離"
            body="ログイン中の会社に紐づくデータだけを参照します。"
          />
          <SecurityRow
            icon={<EyeOff />}
            title="業者指示事項の出力制御"
            body="PDFには出さず、Excelでは内部確認用として出力します。"
          />
          <SecurityRow
            icon={<Search />}
            title="AI候補は確認後に反映"
            body="AI結果をそのまま確定せず、担当者の確認を通します。"
          />
        </div>
      </div>
    </section>
  );
}

function SecurityRow({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-white/15 bg-white/10 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700">
        {icon}
      </span>
      <div>
        <h3 className="font-bold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-200">{body}</p>
      </div>
    </div>
  );
}

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-5">
        <SectionHeading
          eyebrow="FAQ"
          title="よくある質問"
          desc="導入前に確認されやすいポイントをまとめました。"
          center
        />
        <div className="mt-8 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {FAQS.map((faq) => (
            <div key={faq.q} className="p-5">
              <h3 className="font-bold text-slate-900">{faq.q}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-slate-50 px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-8 text-center sm:p-10">
        <h2 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
          まずは、現場の見積フローに合うか確認しましょう。
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          単価マスター、音声入力、業者指示事項、Excel/PDF出力まで、実際の運用に合わせて確認できます。
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 text-base font-bold text-white hover:bg-brand-700"
          >
            導入相談をする
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-slate-300 px-6 text-base font-bold text-slate-700 hover:bg-slate-50"
          >
            デモを試す
          </Link>
        </div>
      </div>
    </section>
  );
}

function PlainCheck({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm leading-7 text-slate-700">
      <Check className="mt-1 shrink-0 text-emerald-600" />
      <span>{children}</span>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Mic className="text-base" />
            </span>
            <span className="font-bold">ボイス見積</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            建設業向け 音声AI見積作成システム
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
          <Link href="/blog" className="hover:text-brand-700">
            お役立ち記事
          </Link>
          <Link href="/contact" className="hover:text-brand-700">
            お問い合わせ
          </Link>
          <Link href="/tokushoho" className="hover:text-brand-700">
            特定商取引法に基づく表記
          </Link>
          <Link href="/privacy" className="hover:text-brand-700">
            プライバシーポリシー
          </Link>
          <Link href="/terms" className="hover:text-brand-700">
            利用規約
          </Link>
          <Link href="/login" className="hover:text-brand-700">
            ログイン
          </Link>
        </nav>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © 2026 ボイス見積
      </div>
    </footer>
  );
}
