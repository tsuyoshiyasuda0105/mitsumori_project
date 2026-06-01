import Link from "next/link";
import type { ReactNode } from "react";
import {
  Check,
  ChevronRight,
  EyeOff,
  FileText,
  Mic,
  Share,
  Sparkles,
  Spreadsheet,
} from "@/components/icons";

export function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader />
      <main>
        <Hero />
        <Pain />
        <Features />
        <HowItWorks />
        <Separation />
        <Industries />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ───────────────────────── ヘッダー ───────────────────────── */

const NAV = [
  { href: "#features", label: "特徴" },
  { href: "#how", label: "使い方" },
  { href: "#separation", label: "情報分離" },
  { href: "#industries", label: "対象業種" },
];

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/lp" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Mic className="text-lg" />
          </span>
          <span className="text-base font-bold tracking-tight">ボイス見積</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-brand-700">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="hidden text-sm font-semibold text-slate-600 hover:text-brand-700 sm:inline"
          >
            お問い合わせ
          </Link>
          <Link
            href="/login"
            className="hidden text-sm font-semibold text-slate-600 hover:text-brand-700 sm:inline"
          >
            ログイン
          </Link>
          <Link href="/login" className="btn-primary h-10 min-h-0 px-4 text-sm">
            無料で試す
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ───────────────────────── ヒーロー ───────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-brand-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-40 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
            <Sparkles className="text-sm" />
            外壁塗装・リフォーム業のための音声AI見積
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            現場で「話すだけ」。
            <br />
            <span className="text-brand-600">AIが見積</span>を下書きします。
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            事務所に戻らず、現場のスマホで見積作成。話した内容をAIが文字起こしして、
            品目・数量・単価の明細に自動変換。お手元のExcel単価表もそのまま使えます。
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="btn-primary px-6 text-base">
              無料で試す
              <ChevronRight className="text-base" />
            </Link>
            <a href="#how" className="btn-secondary px-6 text-base">
              使い方を見る
            </a>
          </div>

          <ul className="mt-8 grid gap-2.5 text-sm text-slate-600 sm:grid-cols-2">
            {[
              "登録なしでデモを体験",
              "既存のExcel単価表を取込",
              "顧客に内部情報が漏れない",
              "PDF・Excelで出力",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="shrink-0 text-base text-emerald-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center lg:justify-end">
          <PhoneMock />
        </div>
      </div>
    </section>
  );
}

/* ヒーローのスマホ・モック（録音中の画面イメージ） */
const WAVE = [10, 18, 28, 16, 34, 22, 40, 30, 20, 12, 26, 38, 18, 24, 14];

function PhoneMock() {
  return (
    <div className="relative w-[280px] rounded-[2.2rem] border-[10px] border-slate-900 bg-slate-900 shadow-panel">
      <div className="overflow-hidden rounded-[1.5rem] bg-slate-50">
        {/* ステータスバー風 */}
        <div className="flex items-center justify-between bg-white px-4 py-3">
          <span className="text-xs font-semibold text-slate-400">外壁塗装の見積</span>
          <span className="tag-ai">
            <Sparkles className="text-[11px]" />
            AI
          </span>
        </div>

        {/* 録音エリア */}
        <div className="flex flex-col items-center px-5 py-8">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <span className="absolute inset-0 animate-pulse-rec rounded-full bg-rose-500/15" />
            <span className="absolute inset-3 rounded-full bg-rose-500/20" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg">
              <Mic className="text-2xl" />
            </span>
          </div>

          <p className="num mt-5 text-2xl font-bold tracking-wider text-slate-800">
            00:18
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-rose-500">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            録音中
          </p>

          {/* 波形 */}
          <div className="mt-5 flex h-12 items-center gap-1">
            {WAVE.map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-brand-400"
                style={{ height: `${h + 8}px` }}
              />
            ))}
          </div>
        </div>

        {/* 解析中のヒント */}
        <div className="mx-4 mb-5 flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2.5 text-xs text-violet-700 ring-1 ring-inset ring-violet-100">
          <Sparkles className="shrink-0 text-sm" />
          話し終えると、AIが明細を下書きします
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── 共通見出し ───────────────────────── */

function SectionHeading({
  eyebrow,
  title,
  desc,
  center = false,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
        {eyebrow}
      </span>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {desc && (
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          {desc}
        </p>
      )}
    </div>
  );
}

/* ───────────────────────── 課題 ───────────────────────── */

const PAINS = [
  {
    title: "事務所に戻ってから見積作成",
    body: "現場で採寸して、夜に事務所でExcel入力。提出が翌日以降になり、失注につながることも。",
  },
  {
    title: "単価をいちいち探して手入力",
    body: "品目ごとに過去の単価表をめくって入力。転記ミスや単価の付け忘れが起きやすい。",
  },
  {
    title: "業者向けメモの消し忘れ",
    body: "社内・業者向けの指示を消し忘れたまま顧客に提出。価格の根拠や原価が漏れる不安。",
  },
];

function Pain() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="よくある課題"
          title="こんな見積作成、していませんか？"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PAINS.map((p, i) => (
            <div key={p.title} className="card p-6">
              <span className="num flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-sm font-bold text-rose-600 ring-1 ring-inset ring-rose-100">
                {i + 1}
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-800">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 機能 ───────────────────────── */

const FEATURES = [
  {
    icon: <Mic className="text-xl" />,
    tone: "brand",
    title: "音声で入力",
    body: "現場で話すだけ。推奨30秒〜2分の音声で、採寸メモや作業内容をそのまま記録できます。",
  },
  {
    icon: <Sparkles className="text-xl" />,
    tone: "violet",
    title: "AIが明細を下書き",
    body: "文字起こしから品目・数量・単位・単価を自動で構造化。単価マスターと自動で照合します。",
  },
  {
    icon: <Spreadsheet className="text-xl" />,
    tone: "emerald",
    title: "Excel単価表を取込",
    body: "お使いの単価表をアップロードして列をマッピング。プレビューとエラー確認つきで安全に取込。",
  },
  {
    icon: <EyeOff className="text-xl" />,
    tone: "amber",
    title: "顧客 / 社内の情報を分離",
    body: "業者指示事項は「PDF非表示」。顧客提出用の帳票には絶対に出力されない仕組みです。",
    highlight: true,
  },
  {
    icon: <FileText className="text-xl" />,
    tone: "sky",
    title: "PDF・Excelで出力",
    body: "顧客提出用と、社内・業者指示用を1クリックで出し分け。用途を取り違えない設計です。",
  },
  {
    icon: <Share className="text-xl" />,
    tone: "brand",
    title: "スマホで完結",
    body: "録音から確認・共有まで現場のスマホでワンストップ。事務所のPCでも同じデータを編集できます。",
  },
];

const TONES: Record<string, string> = {
  brand: "bg-brand-50 text-brand-600 ring-brand-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-200",
  sky: "bg-sky-50 text-sky-600 ring-sky-100",
};

function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="主な機能"
          title="話すだけで、見積が形になる。"
          desc="現場の作業を止めない、シンプルな機能だけを揃えました。"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`card p-6 ${
                f.highlight ? "ring-2 ring-amber-200" : ""
              }`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset ${TONES[f.tone]}`}
              >
                {f.icon}
              </span>
              <h3 className="mt-4 flex items-center gap-2 text-base font-bold text-slate-800">
                {f.title}
                {f.highlight && (
                  <span className="tag-internal">
                    <EyeOff className="text-[11px]" />
                    重要
                  </span>
                )}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 使い方 ───────────────────────── */

const STEPS = [
  {
    no: "01",
    icon: <Mic className="text-xl" />,
    title: "現場で話す",
    body: "「外壁塗装、足場が約180平米、高圧洗浄して…」と話すだけ。テキスト入力にも対応。",
  },
  {
    no: "02",
    icon: <Sparkles className="text-xl" />,
    title: "AIが下書き",
    body: "音声を文字起こしし、明細候補を生成。単価マスターと照合して金額まで自動計算します。",
  },
  {
    no: "03",
    icon: <FileText className="text-xl" />,
    title: "確認して出力",
    body: "内容を確認・修正して確定。顧客提出用PDF、社内・業者指示用Excelをすぐに出力できます。",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="使い方" title="3ステップで見積完成" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.no} className="relative">
              <div className="card h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                    {s.icon}
                  </span>
                  <span className="num text-3xl font-extrabold text-slate-200">
                    {s.no}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-800">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-2xl text-slate-300 md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 情報分離（最重要の差別化） ─────────────────── */

function Separation() {
  return (
    <section id="separation" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-300">
            <EyeOff className="text-sm" />
            情報漏えいを防ぐ設計
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            業者指示事項は、
            <br />
            顧客向けPDFに
            <span className="text-amber-600">絶対に出ません。</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            「顧客に見せる情報」と「社内・業者だけの情報」を、入力画面・プレビュー・出力ダイアログの
            すべてで色とラベルではっきり区別。原価や利益、業者への指示が、うっかり顧客に渡ることを防ぎます。
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            {[
              "顧客提出用PDF・Excelには内部情報を一切出力しない",
              "社内・業者指示用Excelだけに指示事項を出力",
              "出力前に「含まれる情報」を必ず確認できる",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <Check className="mt-0.5 shrink-0 text-base text-emerald-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* 見積明細の分離イメージ */}
        <div className="card overflow-hidden p-0">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-bold text-slate-700">
            見積明細（編集画面のイメージ）
          </div>
          <div className="space-y-3 p-5">
            <SepRow
              name="外壁塗装 シリコン塗装"
              meta="180㎡ × 2,400円"
              amount="432,000円"
            />
            <div className="rounded-xl bg-sky-50/70 p-3 ring-1 ring-inset ring-sky-100">
              <span className="tag-customer">
                <FileText className="text-[11px]" />
                顧客に表示
              </span>
              <p className="mt-1.5 text-sm text-slate-700">
                高耐久シリコン塗料を使用。色は打合せ時にご確認ください。
              </p>
            </div>
            <div className="internal-surface p-3">
              <span className="tag-internal">
                <EyeOff className="text-[11px]" />
                PDF非表示（社内・業者向け）
              </span>
              <p className="mt-1.5 text-sm text-slate-700">
                原価1,600円/㎡。職人Aへ。北面は下地補修を優先。
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="text-xs font-medium text-slate-500">
                顧客向けPDFに出力されるのは
              </span>
              <span className="tag-customer">青色の項目のみ</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SepRow({
  name,
  meta,
  amount,
}: {
  name: string;
  meta: string;
  amount: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="truncate font-semibold text-slate-800">{name}</div>
        <div className="num mt-0.5 text-xs text-slate-500">{meta}</div>
      </div>
      <div className="num shrink-0 font-bold text-slate-800">{amount}</div>
    </div>
  );
}

/* ───────────────────────── 対象業種 ───────────────────────── */

const INDUSTRIES = [
  "外壁塗装",
  "屋根塗装",
  "防水工事",
  "リフォーム",
  "内装工事",
  "外構・エクステリア",
  "シーリング",
  "足場",
];

function Industries() {
  return (
    <section id="industries" className="scroll-mt-20 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <SectionHeading
          eyebrow="対象業種"
          title="現場で見積をつくる、すべての工事業に。"
          desc="まずは外壁塗装・リフォーム系を中心に、品目テンプレートをご用意しています。"
          center
        />
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {INDUSTRIES.map((t) => (
            <span
              key={t}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── CTA帯 ───────────────────────── */

function CtaBand() {
  return (
    <section className="px-5 py-16 sm:py-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-14 text-center shadow-panel sm:px-12">
        <span className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <span className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <h2 className="relative text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          今すぐ、現場で試してみませんか？
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
          登録不要のデモで、音声入力からAI解析・出力までの流れをそのまま体験できます。
        </p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="btn h-12 bg-white px-7 text-base text-brand-700 hover:bg-brand-50"
          >
            無料で試す
            <ChevronRight className="text-base" />
          </Link>
          <a
            href="#features"
            className="btn h-12 border border-white/40 px-7 text-base text-white hover:bg-white/10"
          >
            機能をもう一度見る
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── フッター ───────────────────────── */

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Mic className="text-base" />
            </span>
            <span className="font-bold tracking-tight">ボイス見積</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            音声AI見積作成システム（デモ版）
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <a href="#features" className="hover:text-brand-700">
            特徴
          </a>
          <a href="#how" className="hover:text-brand-700">
            使い方
          </a>
          <a href="#separation" className="hover:text-brand-700">
            情報分離
          </a>
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
        © 2026 ボイス見積 — このページはデモ用のUIサンプルです。
      </div>
    </footer>
  );
}
