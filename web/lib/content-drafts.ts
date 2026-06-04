import { promises as fs } from "fs";
import path from "path";

export type ContentDraft = {
  id: string;
  fileName: string;
  relativePath: string;
  platform: "blog" | "note";
  title: string;
  slug: string;
  status: string;
  publishedAt: string;
  updatedAt: string;
  frontmatter: Record<string, string>;
  body: string;
  raw: string;
  hasMojibake: boolean;
};

const repoRoot = path.resolve(process.cwd(), "..");
const draftsRoot = path.join(repoRoot, "marketing", "content-automation", "drafts");
const draftPlatforms = ["blog", "note"] as const;

function stripQuotes(value: string) {
  return value.trim().replace(/^["']/, "").replace(/["']$/, "");
}

function parseFrontmatter(raw: string) {
  if (!raw.startsWith("---")) {
    return { frontmatter: {}, body: raw.trim() };
  }

  const lines = raw.split(/\r?\n/);
  const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (endIndex < 0) {
    return { frontmatter: {}, body: raw.trim() };
  }

  const frontmatter: Record<string, string> = {};
  for (const line of lines.slice(1, endIndex)) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex < 0) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key) frontmatter[key] = stripQuotes(value);
  }

  return {
    frontmatter,
    body: lines.slice(endIndex + 1).join("\n").trim(),
  };
}

function titleFromBody(body: string) {
  const heading = body.split(/\r?\n/).find((line) => line.startsWith("# "));
  return heading ? heading.replace(/^#\s+/, "").trim() : "";
}

function looksMojibake(text: string) {
  const markers = [
    "縺",
    "繧",
    "譁",
    "隕",
    "荳",
    "蜊",
    "鬘",
    "郢",
    "邵",
    "闕",
    "驍",
    "髫",
  ];
  return markers.some((marker) => text.includes(marker));
}

export async function getContentDrafts(): Promise<ContentDraft[]> {
  const drafts = await Promise.all(
    draftPlatforms.map(async (platform) => {
      const dir = path.join(draftsRoot, platform);
      let fileNames: string[] = [];
      try {
        fileNames = await fs.readdir(dir);
      } catch {
        return [];
      }

      const markdownFiles = fileNames.filter((fileName) => fileName.endsWith(".md"));
      return Promise.all(
        markdownFiles.map(async (fileName) => {
          const fullPath = path.join(dir, fileName);
          const raw = await fs.readFile(fullPath, "utf8");
          const stat = await fs.stat(fullPath);
          const { frontmatter, body } = parseFrontmatter(raw);
          const relativePath = path.relative(repoRoot, fullPath).replace(/\\/g, "/");

          return {
            id: `${platform}/${fileName}`,
            fileName,
            relativePath,
            platform,
            title: frontmatter.title || titleFromBody(body) || fileName,
            slug: frontmatter.slug || fileName.replace(/\.md$/, ""),
            status: frontmatter.status || "unknown",
            publishedAt: frontmatter.publishedAt || "",
            updatedAt: stat.mtime.toISOString(),
            frontmatter,
            body,
            raw,
            hasMojibake: looksMojibake(raw),
          } satisfies ContentDraft;
        }),
      );
    }),
  );

  return drafts
    .flat()
    .sort((a, b) => b.fileName.localeCompare(a.fileName) || a.platform.localeCompare(b.platform));
}
