import Link from "next/link";
import type { ReactNode } from "react";
import {
  Check,
  ChevronRight,
  EyeOff,
  FileText,
  Lock,
  Mic,
  Search,
  Sparkles,
  Spreadsheet,
} from "@/components/icons";

const DEMO_VIDEO_SRC = "/videos/voice-estimate-short.mp4";
const DEMO_VIDEO_POSTER = "/videos/voice-estimate-poster.svg";

const NAV = [
  { href: "#examples", label: "実例" },
  { href: "#problem", label: "課題" },
  { href: "#features", label: "機能" },
  { href: "#movie", label: "動画" },
  { href: "#flow", label: "流れ" },
  { href: "#faq", label: "FAQ" },
];

const INDUSTRIES = ["外壁塗装", "リフォーム", "設備工事", "内装", "外構", "工務店"];

const SAMPLE_ESTIMATES = [
  {
    title: "外壁塗装 A様邸",
    category: "塗装",
    rows: ["外壁シリコン塗装 180㎡", "くさび足場 210㎡", "高圧洗浄 95㎡"],
  },
  {
    title: "内装リフォーム",
    category: "内装",
    rows: ["クロス張替 42㎡", "床撤去 一式", "下地補修 6箇所"],
  },
  {
    title: "設備交換工事",
    category: "設備",
    rows: ["給湯器交換 1台", "配管部材 一式", "試運転・撤去費"],
  },
];

const PROBLEMS = [
  ["現場メモが散らばる", "手帳、写真、LINE、記憶が分かれ、見積作成時に探し直しが発生します。"],
  ["単価確認で止まる", "Excel単価表を開き、品目名・単位・単価を探して転記する時間が残ります。"],
  ["内部メモが怖い", "原価、利益、業者指示を顧客向けPDFへ混ぜない確認が必要です。"],
];

const FEATURES = [
  {
    icon: <Mic className="text-xl" />,
    title: "音声から明細候補",
    body: "現場で話した内容から、場所・品目・数量・備考をAIが候補化します。",
  },
  {
    icon: <Spreadsheet className="text-xl" />,
    title: "Excel単価表を活用",
    body: "既存の単価表をマスターとして使い、候補の品目・単位・単価を照合します。",
  },
  {
    icon: <EyeOff className="text-xl" />,
    title: "業者指示を分離",
    body: "顧客向けPDFには出さず、社内確認用・業者用Excelで扱う設計です。",
  },
  {
    icon: <FileText className="text-xl" />,
    title: "PDF / Excel出力",
    body: "提出用と社内確認用を分けて、出力前のチェック負担を減らします。",
  },
  {
    icon: <Lock className="text-xl" />,
    title: "会社別データ分離",
    body: "顧客・単価・見積・AI履歴を会社単位で分ける設計を前提にしています。",
  },
  {
    icon: <Search className="text-xl" />,
    title: "人が確認して確定",
    body: "AIは確定処理をせず、担当者が採用・修正してから見積へ反映します。",
  },
];

const STEPS = [
  ["01", "現場で話す", "スマホで作業内容、数量、注意点をそのまま話します。"],
  ["02", "AIが整理", "明細候補と確認すべき曖昧点を分けて下書きします。"],
  ["03", "単価と照合", "Excel単価マスターの品目・単位・単価候補を表示します。"],
  ["04", "確認して出力", "担当者が確認し、PDFまたはExcelで出力します。"],
];

const FAQS = [
  ["AIが見積金額を自動で確定しますか？", "いいえ。AIは明細候補の下書き役です。品目、数量、単価、金額は担当者が確認して確定します。"],
  ["今使っているExcel単価表は使えますか？", "はい。列マッピングとプレビューを通して、既存Excelを単価マスターとして使う想定です。"],
  ["業者指示事項は顧客に見えませんか？", "顧客向けPDFには出さず、社内確認用または業者指示用Excelにのみ含める設計です。"],
  ["本番導入前に相談できますか？", "はい。現在は先行公開中プロトタイプとして、実際の見積フローに合うか確認する段階です。"],
];

export function Landing() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <SiteHeader />
      <main>
        <Hero />
        <Examples />
        <Problem />
        <Features />
        <Flow />
        <Pricing />
        <FAQ />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="ボイス見積 トップへ">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white shadow-sm">
            <Mic className="text-xl" />
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight">ボイス見積</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">AI Estimate Draft</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 lg:flex" aria-label="主要ナビゲーション">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-slate-950">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/contact" className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:inline-flex">
            相談する
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800">
            デモを試す <ChevronRight className="text-base" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#06111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.28),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.18),transparent_30%),linear-gradient(135deg,#06111f_0%,#0b1730_52%,#0f172a_100%)]" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:py-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <Sparkles className="text-cyan-300" />
            建築・リフォーム向け AI見積下書き
          </div>

          <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.05] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
            話した現場メモを、
            <span className="block bg-gradient-to-r from-cyan-200 via-white to-emerald-200 bg-clip-text text-transparent">
              見積明細の下書きへ。
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-medium leading-9 text-slate-300">
            ボイス見積は、現場で話した内容をAIが明細候補に整理し、Excel単価マスターと照合するための見積支援プロトタイプです。AI任せではなく、人が確認しやすい下書きを作ります。
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-black text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-cyan-50">
              デモを試す <ChevronRight />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">
              導入相談をする
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {INDUSTRIES.map((item) => (
              <span key={item} className="rounded-full border border-white/15 bg-white/8 px-3.5 py-2 text-xs font-bold text-slate-200 backdrop-blur">
                {item}
              </span>
            ))}
          </div>
        </div>

        <HeroVideo />
      </div>
    </section>
  );
}

function HeroVideo() {
  return (
    <div id="movie" className="relative mx-auto w-full max-w-[720px] scroll-mt-28">
      <div className="absolute -left-8 top-8 hidden rounded-3xl border border-white/15 bg-white/10 p-4 text-sm font-bold text-white shadow-2xl backdrop-blur md:block">
        <p className="text-cyan-200">15秒デモ</p>
        <p className="mt-1 text-slate-200">ページ表示時に自動再生</p>
      </div>
      <div className="absolute -right-5 bottom-12 hidden rounded-3xl border border-emerald-300/30 bg-emerald-300/15 p-4 text-sm font-bold text-emerald-50 shadow-2xl backdrop-blur md:block">
        音声は再生ボタンから確認
      </div>

      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="overflow-hidden rounded-[1.55rem] bg-slate-950 shadow-2xl">
          <div className="border-b border-white/10 bg-white/[0.06] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Voice estimate movie</p>
                <p className="mt-1 text-sm font-bold text-white">音声つき15秒デモ</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-200">Auto play</span>
            </div>
          </div>
          <div className="aspect-video bg-slate-950">
            <video
              className="h-full w-full bg-slate-950 object-contain p-1"
              autoPlay
              muted
              loop
              controls
              preload="auto"
              playsInline
              poster={DEMO_VIDEO_POSTER}
            >
              <source src={DEMO_VIDEO_SRC} type="video/mp4" />
              お使いのブラウザでは動画を再生できません。
            </video>
          </div>
          <div className="border-t border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-medium leading-6 text-slate-300">
            ブラウザ仕様により、ページ表示時は無音で自動再生します。音声付きで確認する場合は動画の音量をオンにしてください。
          </div>
        </div>
      </div>
    </div>
  );
}
function Examples() {
  return (
    <section id="examples" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionTitle eyebrow="Examples" title="現場の話し言葉を、見積らしい粒度に整えます。">
          外壁、内装、設備など、職人さんが普段話している内容を明細候補へ変換するイメージです。
        </SectionTitle>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {SAMPLE_ESTIMATES.map((item) => (
            <article key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-black tracking-tight">{item.title}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{item.category}</span>
              </div>
              <ul className="mt-5 space-y-3">
                {item.rows.map((row) => (
                  <li key={row} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                    <Check className="shrink-0 text-emerald-500" />
                    {row}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section id="problem" className="bg-[#f6f8fb] py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionTitle eyebrow="Problem" title="見積作成で止まりやすい場所を、先に整えます。" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PROBLEMS.map(([title, body], index) => (
            <article key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-sm font-black text-cyan-600">0{index + 1}</span>
              <h3 className="mt-4 text-2xl font-black tracking-tight">{title}</h3>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionTitle eyebrow="Features" title="AIの便利さと、見積業務の慎重さを両立します。" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">{feature.icon}</div>
              <h3 className="mt-5 text-xl font-black tracking-tight">{feature.title}</h3>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Flow() {
  return (
    <section id="flow" className="bg-[#f6f8fb] py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionTitle eyebrow="Flow" title="現場から提出前チェックまで、4ステップで。" />
        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {STEPS.map(([no, title, body]) => (
            <article key={no} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">{no}</span>
              <h3 className="mt-6 text-xl font-black tracking-tight">{title}</h3>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <SectionTitle eyebrow="Pricing" title="まずは先行相談から。" />
          <p className="mt-5 text-base font-medium leading-8 text-slate-600">
            現在はプロトタイプ公開中です。単価表、帳票、社内確認フローを見ながら、最小構成で導入イメージを作ります。
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">Prototype</p>
              <h3 className="mt-2 text-4xl font-black tracking-tight">個別見積</h3>
              <p className="mt-3 text-sm font-medium text-slate-300">業種、単価表、出力帳票に合わせて相談</p>
            </div>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-50">
              相談する
            </Link>
          </div>
          <ul className="mt-6 grid gap-3 text-sm font-bold text-slate-200 sm:grid-cols-2">
            {["単価表Excelの確認", "明細候補の項目設計", "PDF/Excel出力形式", "会社別データ分離", "SEO公開ページ", "AI生成記事の自動化相談"].map((item) => (
              <li key={item} className="flex gap-2"><Check className="mt-0.5 shrink-0 text-emerald-300" />{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="bg-[#f6f8fb] py-20">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <SectionTitle eyebrow="FAQ" title="よくある質問" center />
        <div className="mt-10 space-y-4">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm open:shadow-md">
              <summary className="cursor-pointer list-none text-lg font-black tracking-tight text-slate-950">{q}</summary>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-white px-5 py-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,0.22),transparent_28%),linear-gradient(135deg,#06111f,#0f172a)] p-8 text-center text-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] sm:p-12">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">Next step</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">
          まず1件の見積フローで、使えるか確認しましょう。
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-slate-300">
          単価表、見積書テンプレート、業者指示の出し分けを確認しながら、導入判断できる形に整えます。
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-50">
            デモを試す <ChevronRight />
          </Link>
          <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">
            導入相談をする
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, children, dark, center }: { eyebrow: string; title: string; children?: ReactNode; dark?: boolean; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className={"text-sm font-black uppercase tracking-[0.28em] " + (dark ? "text-cyan-300" : "text-cyan-700")}>{eyebrow}</p>
      <h2 className={"mt-3 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-5xl " + (dark ? "text-white" : "text-slate-950")}>{title}</h2>
      {children ? <div className={"mt-4 text-base font-medium leading-8 " + (dark ? "text-slate-300" : "text-slate-600")}>{children}</div> : null}
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>© 2026 ボイス見積</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/contact" className="hover:text-slate-950">お問い合わせ</Link>
          <Link href="/tokushoho" className="hover:text-slate-950">特定商取引法に基づく表記</Link>
          <Link href="/privacy" className="hover:text-slate-950">プライバシーポリシー</Link>
        </div>
      </div>
    </footer>
  );
}
