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
