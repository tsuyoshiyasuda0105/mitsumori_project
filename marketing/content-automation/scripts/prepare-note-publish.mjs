#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const defaultSource = path.join(repoRoot, "marketing", "note", "02_reform_construction_estimate_ai_note.md");
const defaultOutRoot = path.join(repoRoot, "marketing", "note", "publish-ready");

function parseArgs(argv) {
  const args = { source: defaultSource, outRoot: defaultOutRoot, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--source") args.source = path.resolve(argv[++i]);
    else if (value === "--out-root") args.outRoot = path.resolve(argv[++i]);
    else if (value === "--dry-run") args.dryRun = true;
    else if (value === "--help" || value === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${value}`);
    }
  }
  return args;
}

function printHelp() {
  console.log(`Prepare note publish package

Usage:
  node marketing/content-automation/scripts/prepare-note-publish.mjs [options]

Options:
  --source PATH     Source note markdown. Default: marketing/note/02_reform_construction_estimate_ai_note.md
  --out-root PATH   Output root. Default: marketing/note/publish-ready
  --dry-run         Print summary without writing files
`);
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return {};
  const end = markdown.indexOf("\n---", 3);
  if (end < 0) return {};
  const block = markdown.slice(3, end).trim();
  const result = {};
  let currentKey = null;
  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (pair) {
      currentKey = pair[1];
      const value = pair[2].trim();
      if (value === "") result[currentKey] = [];
      else result[currentKey] = stripQuotes(value);
      continue;
    }
    const listItem = line.match(/^\s*-\s*(.*)$/);
    if (currentKey && listItem && Array.isArray(result[currentKey])) {
      result[currentKey].push(stripQuotes(listItem[1].trim()));
    }
  }
  return result;
}

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/g, "");
}

function extractSection(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start < 0) return "";
  const chunk = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith("# ")) break;
    chunk.push(line);
  }
  return chunk.join("\n").trim();
}

function firstMeaningfulLine(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && line !== "---") ?? "";
}

function normalizeBody(body) {
  return body
    .replace(/【ここにYouTubeの限定公開URLを貼り付け】\s*/g, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function slugFromMeta(meta, sourcePath) {
  if (meta.source_blog) {
    const matched = String(meta.source_blog).match(/\/blog\/([^/?#]+)/);
    if (matched) return matched[1];
  }
  return path.basename(sourcePath, path.extname(sourcePath)).replace(/^\d+_/, "");
}

function todayTokyo() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const pick = (type) => parts.find((part) => part.type === type)?.value;
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const markdown = (await fs.readFile(args.source, "utf8")).replace(/^\uFEFF/, "");
  const meta = parseFrontmatter(markdown);
  const title = meta.title || firstMeaningfulLine(extractSection(markdown, "# noteタイトル"));
  const body = normalizeBody(extractSection(markdown, "# 貼り付け本文"));
  const hashtags = extractSection(markdown, "# ハッシュタグ")
    .split(/\s+/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.startsWith("#"));
  const slug = slugFromMeta(meta, args.source);
  const packageName = `${todayTokyo()}_${slug}`;
  const outDir = path.join(args.outRoot, packageName);
  const thumbnailSource = meta.thumbnail_image ? path.join(repoRoot, meta.thumbnail_image) : null;
  const thumbnailName = thumbnailSource ? path.basename(thumbnailSource) : null;

  const manifest = {
    title,
    source: path.relative(repoRoot, args.source).replaceAll("\\", "/"),
    output: path.relative(repoRoot, outDir).replaceAll("\\", "/"),
    platform: "note",
    status: "ready-for-manual-review",
    sourceBlog: meta.source_blog ?? null,
    ctaUrl: meta.cta_url ?? null,
    thumbnail: thumbnailName ? path.relative(repoRoot, path.join(outDir, thumbnailName)).replaceAll("\\", "/") : null,
    thumbnailSource: thumbnailSource ? path.relative(repoRoot, thumbnailSource).replaceAll("\\", "/") : null,
    hashtags,
    warnings: [
      "noteログインと公開ボタンは人が確認する",
      "動画URLをYouTube限定公開に差し替える場合は本文内のサンプル動画セクションを確認する",
    ],
  };

  if (!title) throw new Error("Could not extract note title");
  if (!body) throw new Error("Could not extract note body");
  if (hashtags.length === 0) throw new Error("Could not extract hashtags");

  if (args.dryRun) {
    console.log(JSON.stringify({ ...manifest, bodyLength: body.length }, null, 2));
    return;
  }

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "title.txt"), `${title}\n`, "utf8");
  await fs.writeFile(path.join(outDir, "body.md"), `${body}\n`, "utf8");
  await fs.writeFile(path.join(outDir, "hashtags.txt"), `${hashtags.join(" ")}\n`, "utf8");
  await fs.writeFile(path.join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(outDir, "README.md"), buildReadme(manifest), "utf8");
  if (thumbnailSource && existsSync(thumbnailSource)) {
    await fs.copyFile(thumbnailSource, path.join(outDir, thumbnailName));
  }

  console.log(`Prepared note publish package: ${outDir}`);
  console.log(`Title: ${title}`);
  console.log(`Body chars: ${body.length}`);
  console.log(`Tags: ${hashtags.join(" ")}`);
}

function buildReadme(manifest) {
  return `# note自動入力パッケージ

## 使うファイル

- タイトル: \`title.txt\`
- 本文: \`body.md\`
- ハッシュタグ: \`hashtags.txt\`
- サムネイル: \`${manifest.thumbnail ? path.basename(manifest.thumbnail) : "なし"}\`
- メタ情報: \`manifest.json\`

## エージェント入力ルール

1. noteのログインはユーザーが行う。
2. エージェントはnoteの新規投稿画面に、タイトル、本文、タグ、見出し画像を入力する。
3. エージェントは公開ボタン、予約投稿ボタン、削除ボタンを押さない。
4. 入力後、ユーザーが本文、表、リンク、動画URL、タグを確認して公開する。

## 投稿URL候補

- 元記事: ${manifest.sourceBlog ?? "未設定"}
- CTA: ${manifest.ctaUrl ?? "未設定"}
`;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
