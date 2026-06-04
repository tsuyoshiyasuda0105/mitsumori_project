import type { Metadata } from "next";
import { getContentDrafts, type ContentDraft } from "@/lib/content-drafts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "コンテンツ下書きプレビュー",
  robots: {
    index: false,
    follow: false,
  },
};

function MarkdownPreview({ body }: { body: string }) {
  const lines = body.split(/\r?\n/);

  return (
    <div className="space-y-4 text-[15px] leading-8 text-slate-800">
      {lines.map((line, index) => {
        const key = `${index}-${line.slice(0, 24)}`;
        if (!line.trim()) return <div key={key} className="h-1" />;
        if (line.startsWith("# ")) {
          return (
            <h1 key={key} className="text-2xl font-bold leading-snug text-slate-950">
              {line.replace(/^#\s+/, "")}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={key} className="border-t border-slate-200 pt-5 text-xl font-bold leading-snug text-slate-950">
              {line.replace(/^##\s+/, "")}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={key} className="text-base font-bold leading-snug text-slate-900">
              {line.replace(/^###\s+/, "")}
            </h3>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <p key={key} className="pl-4 text-slate-700 before:mr-2 before:content-['-']">
              {line.replace(/^-\s+/, "")}
            </p>
          );
        }
        return <p key={key}>{line}</p>;
      })}
    </div>
  );
}

function DraftList({ drafts, selected }: { drafts: ContentDraft[]; selected: ContentDraft | undefined }) {
  return (
    <aside className="border-r border-slate-200 bg-white md:min-h-screen">
      <div className="sticky top-0 space-y-4 p-4 md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Drafts</p>
          <h1 className="mt-1 text-xl font-bold text-slate-950">コンテンツ下書き確認</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            note/ブログ用のMarkdownを公開前に確認する社内用ページです。
          </p>
        </div>
        <div className="space-y-2">
          {drafts.map((draft) => {
            const isSelected = draft.id === selected?.id;
            return (
              <a
                key={draft.id}
                href={`/content-drafts?draft=${encodeURIComponent(draft.id)}`}
                className={[
                  "block rounded-lg border p-3 text-sm transition-colors",
                  isSelected
                    ? "border-brand-300 bg-brand-50 text-brand-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                ].join(" ")}
              >
                <span className="mb-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {draft.platform}
                </span>
                <span className="block font-semibold leading-6">{draft.title}</span>
                <span className="mt-1 block truncate text-xs text-slate-500">{draft.relativePath}</span>
              </a>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default async function ContentDraftsPage({
  searchParams,
}: {
  searchParams?: { draft?: string };
}) {
  const drafts = await getContentDrafts();
  const selected = drafts.find((draft) => draft.id === searchParams?.draft) ?? drafts[0];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid md:grid-cols-[360px_minmax(0,1fr)]">
        <DraftList drafts={drafts} selected={selected} />
        <section className="p-4 md:p-8">
          {!selected ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-slate-600">
              表示できるMarkdown下書きがまだありません。
            </div>
          ) : (
            <article className="mx-auto max-w-5xl space-y-6">
              <header className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                    {selected.platform}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    {selected.status}
                  </span>
                  {selected.hasMojibake ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                      文字化けの可能性あり
                    </span>
                  ) : null}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {selected.relativePath}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold leading-snug text-slate-950 md:text-3xl">
                    {selected.title}
                  </h2>
                </div>
                <dl className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                  <div>
                    <dt className="font-semibold text-slate-900">slug</dt>
                    <dd className="mt-1 break-all">{selected.slug}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">publishedAt</dt>
                    <dd className="mt-1">{selected.publishedAt || "-"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">updated</dt>
                    <dd className="mt-1">{new Date(selected.updatedAt).toLocaleString("ja-JP")}</dd>
                  </div>
                </dl>
              </header>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
                  <MarkdownPreview body={selected.body} />
                </section>
                <section className="space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
                    <h3 className="text-sm font-bold text-slate-950">frontmatter</h3>
                    <dl className="mt-3 space-y-2 text-xs text-slate-700">
                      {Object.entries(selected.frontmatter).map(([key, value]) => (
                        <div key={key}>
                          <dt className="font-semibold text-slate-500">{key}</dt>
                          <dd className="mt-0.5 break-words">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
                    <h3 className="text-sm font-bold text-slate-950">Markdown原文</h3>
                    <pre className="mt-3 max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-md bg-slate-950 p-3 text-xs leading-6 text-slate-100">
                      {selected.raw}
                    </pre>
                  </div>
                </section>
              </div>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
