import fs from "node:fs";
import path from "node:path";

export type ContentBlock =
  | { type: "lead"; text: string }
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; tone: "sky" | "amber" | "brand"; title?: string; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "cta"; title: string; text: string; href: string; label: string };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  body: ContentBlock[];
}

function stripQuotes(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function parseFrontmatter(markdown: string): Record<string, string> {
  if (!markdown.startsWith("---")) return {};
  const end = markdown.indexOf("\n---", 3);
  if (end < 0) return {};
  const frontmatter = markdown.slice(3, end).trim();
  const meta: Record<string, string> = {};
  for (const line of frontmatter.split(/\r?\n/)) {
    const matched = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (matched) meta[matched[1]] = stripQuotes(matched[2]);
  }
  return meta;
}

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith("---")) return markdown.trim();
  const end = markdown.indexOf("\n---", 3);
  if (end < 0) return markdown.trim();
  return markdown.slice(end + "\n---".length).trim();
}

function markdownToBlocks(markdown: string): ContentBlock[] {
  const lines = stripFrontmatter(markdown)
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("!["));
  const blocks: ContentBlock[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) blocks.push(blocks.length === 0 ? { type: "lead", text } : { type: "p", text });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) {
      flushParagraph();
      continue;
    }
    if (line.startsWith("# ")) continue;
    if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push({ type: "h2", text: line.replace(/^##\s+/, "") });
      continue;
    }
    if (line.startsWith("### ")) {
      flushParagraph();
      blocks.push({ type: "h3", text: line.replace(/^###\s+/, "") });
      continue;
    }
    if (line.startsWith("|")) {
      flushParagraph();
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i += 1;
      }
      i -= 1;
      const rows = tableLines
        .filter((tableLine) => !/^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(tableLine))
        .map((tableLine) =>
          tableLine
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((cell) => cell.trim()),
        );
      const [headers, ...bodyRows] = rows;
      if (headers && bodyRows.length > 0) blocks.push({ type: "table", headers, rows: bodyRows });
      continue;
    }
    if (/^-\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^-\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^-\s+/, ""));
        i += 1;
      }
      i -= 1;
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      i -= 1;
      blocks.push({ type: "ol", items });
      continue;
    }
    paragraph.push(line);
  }

  flushParagraph();
  return blocks;
}

function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((filename) => filename.endsWith(".md"))
    .sort()
    .reverse();
}

function unique(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

function parseMetaTags(meta: Record<string, string>): string[] {
  return unique([
    meta.main_keyword,
    ...String(meta.tags ?? "").split(/[\s,]+/),
    "AI\u898b\u7a4d",
  ]).slice(0, 5);
}

function readMarkdownBlogPosts(): BlogPost[] {
  const contentDir = path.resolve(process.cwd(), "content", "blog");
  const draftDir = path.resolve(process.cwd(), "..", "marketing", "content-automation", "drafts", "blog");
  const filenames = Array.from(
    new Set([...listMarkdownFiles(contentDir), ...listMarkdownFiles(draftDir)]),
  );

  return filenames.flatMap((filename) => {
    const localPath = path.join(contentDir, filename);
    const draftPath = path.join(draftDir, filename);
    const filePath = fs.existsSync(localPath) ? localPath : draftPath;
    if (!fs.existsSync(filePath)) return [];
    const markdown = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
    const meta = parseFrontmatter(markdown);
    if (!meta.slug || !meta.title || !meta.description) return [];
    return [
      {
        slug: meta.slug,
        title: meta.title,
        description: meta.description,
        date: meta.publishedAt ?? filename.slice(0, 10),
        tags: parseMetaTags(meta),
        body: markdownToBlocks(markdown),
      },
    ];
  });
}

export const BLOG_POSTS: BlogPost[] = readMarkdownBlogPosts();

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, count = 2): BlogPost[] {
  const current = getPostBySlug(slug);
  if (!current) return [];
  const others = getAllPosts().filter((p) => p.slug !== slug);
  const byShared = others
    .map((p) => ({
      post: p,
      shared: p.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .sort((a, b) => b.shared - a.shared);
  return byShared.slice(0, count).map((x) => x.post);
}

export function readingMinutes(post: BlogPost): number {
  const chars = post.body.reduce((sum, block) => {
    if (block.type === "ul" || block.type === "ol") {
      return sum + block.items.join("").length;
    }
    if (block.type === "callout") {
      return sum + (block.title?.length ?? 0) + block.text.length;
    }
    if (block.type === "table") {
      return sum + block.headers.join("").length + block.rows.flat().join("").length;
    }
    if (block.type === "cta") {
      return sum + block.title.length + block.text.length + block.label.length;
    }
    return sum + block.text.length;
  }, 0);
  return Math.max(2, Math.round(chars / 450));
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}\u5e74${Number(m)}\u6708${Number(d)}\u65e5`;
}
