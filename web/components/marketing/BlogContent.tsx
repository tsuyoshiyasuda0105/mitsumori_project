import Link from "next/link";
import type { ReactNode } from "react";
import { Check, EyeOff, Sparkles } from "@/components/icons";
import type { ContentBlock } from "@/lib/blog";

function Inline({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold text-slate-900">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

const CALLOUT_STYLES: Record<
  "sky" | "amber" | "brand",
  { wrap: string; title: string; body: string; icon: ReactNode }
> = {
  sky: {
    wrap: "border-sky-200 bg-sky-50",
    title: "text-sky-900",
    body: "text-sky-800",
    icon: <Check className="text-base text-sky-600" />,
  },
  amber: {
    wrap: "border-amber-300 bg-amber-50",
    title: "text-amber-900",
    body: "text-amber-800",
    icon: <EyeOff className="text-base text-amber-600" />,
  },
  brand: {
    wrap: "border-brand-200 bg-brand-50",
    title: "text-brand-900",
    body: "text-brand-800",
    icon: <Sparkles className="text-base text-brand-600" />,
  },
};

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "lead":
      return (
        <p className="text-base leading-8 text-slate-700 sm:text-lg">
          <Inline text={block.text} />
        </p>
      );
    case "p":
      return (
        <p className="text-[15px] leading-8 text-slate-700">
          <Inline text={block.text} />
        </p>
      );
    case "h2":
      return (
        <h2 className="mt-10 border-l-4 border-brand-600 pl-3 text-xl font-extrabold text-slate-900 sm:text-2xl">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-6 text-lg font-bold text-slate-900">{block.text}</h3>
      );
    case "ul":
      return (
        <ul className="space-y-2">
          {block.items.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 text-[15px] leading-7 text-slate-700"
            >
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              <span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="space-y-2.5">
          {block.items.map((item, i) => (
            <li
              key={item}
              className="flex gap-3 text-[15px] leading-7 text-slate-700"
            >
              <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {i + 1}
              </span>
              <span className="pt-0.5">
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                <tr>
                  {block.headers.map((header) => (
                    <th key={header} className="whitespace-nowrap px-4 py-3">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`} className="min-w-[160px] px-4 py-3 leading-7 text-slate-700">
                        <Inline text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "cta":
      return (
        <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-sky-50 p-5 sm:p-6">
          <p className="text-base font-extrabold text-slate-900">{block.title}</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            <Inline text={block.text} />
          </p>
          <Link
            href={block.href}
            className="mt-4 inline-flex min-h-[42px] items-center justify-center rounded-lg bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"
          >
            {block.label}
          </Link>
        </div>
      );
    case "callout": {
      const s = CALLOUT_STYLES[block.tone];
      return (
        <div className={`rounded-xl border p-4 ${s.wrap}`}>
          {block.title && (
            <p
              className={`flex items-center gap-1.5 text-sm font-bold ${s.title}`}
            >
              {s.icon}
              {block.title}
            </p>
          )}
          <p className={`mt-1.5 text-sm leading-7 ${s.body}`}>
            <Inline text={block.text} />
          </p>
        </div>
      );
    }
  }
}

export function BlogContent({ body }: { body: ContentBlock[] }) {
  return (
    <div className="space-y-4">
      {body.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
