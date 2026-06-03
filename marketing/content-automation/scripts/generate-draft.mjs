#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const automationRoot = path.join(repoRoot, "marketing", "content-automation");
const topicsPath = path.join(automationRoot, "topics.md");
const promptPath = path.join(automationRoot, "daily-draft-prompt.md");
const ctaUrl = "https://web-beryl-one-79.vercel.app/lp";

const blogSlugMap = new Map([
  ["建設業 見積 AI", "kensetsu-mitsumori-ai"],
  ["音声入力 見積 作成", "voice-input-mitsumori"],
  ["単価マスター Excel 取り込み", "excel-price-master"],
  ["建設業 見積 データ連携", "kensetsu-mitsumori-data-renkei"],
  ["見積作成 時間短縮", "mitsumori-standardization"],
  ["リフォーム 見積 DX", "reform-mitsumori-dx"],
  ["外壁塗装 見積 AI", "gaiheki-mitsumori-ai"],
  ["見積ミス 防止", "mitsumori-miss-check"],
  ["見積書 Excel 出力", "excel-pdf-mitsumori-output"],
  ["外壁塗装 単価表", "gaiheki-price-list"],
  ["リフォーム 見積 属人化", "reform-mitsumori-standard"],
  ["建設業 見積 システム", "small-construction-estimate-system"],
]);

const noteSlugMap = new Map([
  ["開発背景", "why-voice-estimate"],
  ["生産性", "construction-productivity"],
  ["AIとの距離感", "ai-and-human-check"],
  ["Excel", "excel-friendly-ai-tool"],
  ["見積のしんどさ", "estimate-work-after-hours"],
  ["プロトタイプ公開", "why-release-prototype"],
  ["小規模会社", "small-team-estimate-tool"],
  ["動画紹介", "short-video-message"],
  ["情報分離", "customer-internal-info-split"],
  ["外部連携", "estimate-data-not-paper"],
]);

const bannedPhrases = [
  "必ず売上が上がる",
  "何時間削減",
  "導入社数",
  "顧客の声",
  "AIが見積金額を自動で確定",
  "完成済みSaaS",
  "いかがでしたでしょうか",
  "することができます",
];

function parseArgs(argv) {
  const args = {
    platform: "auto",
    date: todayTokyo(),
    dryRun: false,
    checkOnly: false,
    noAi: false,
    requireAi: false,
    noTopicUpdate: false,
    model: process.env.CONTENT_AGENT_MODEL || "gpt-5-mini",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--platform") args.platform = argv[++i];
    else if (value === "--date") args.date = argv[++i];
    else if (value === "--model") args.model = argv[++i];
    else if (value === "--dry-run") args.dryRun = true;
    else if (value === "--check-only") args.checkOnly = true;
    else if (value === "--no-ai") args.noAi = true;
    else if (value === "--require-ai") args.requireAi = true;
    else if (value === "--no-topic-update") args.noTopicUpdate = true;
    else if (value === "--help" || value === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${value}`);
    }
  }

  if (!["auto", "blog", "note"].includes(args.platform)) {
    throw new Error("--platform must be auto, blog, or note");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
    throw new Error("--date must be YYYY-MM-DD");
  }
  return args;
}

function printHelp() {
  console.log(`Daily content draft generator

Usage:
  node marketing/content-automation/scripts/generate-draft.mjs [options]

Options:
  --platform auto|blog|note  Choose medium. Default: auto by weekday
  --date YYYY-MM-DD          Draft date. Default: today in Asia/Tokyo
  --model MODEL              OpenAI model. Default: CONTENT_AGENT_MODEL or gpt-5-mini
  --dry-run                  Generate summary without writing files
  --check-only               Show next selected topic only
  --no-ai                    Skip OpenAI and use local safe template
  --require-ai               Fail if OPENAI_API_KEY is missing or OpenAI call fails
  --no-topic-update          Write the draft but do not mark topics.md as drafted
`);
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

function weekday(date) {
  return new Date(`${date}T00:00:00.000Z`).getUTCDay();
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseTopicTable(markdown, platform) {
  const lines = markdown.split(/\r?\n/);
  const heading = platform === "blog" ? "## SEOブログ候補" : "## note候補";
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start < 0) throw new Error(`Missing topic section: ${heading}`);

  const headerIndex = lines.findIndex((line, index) => index > start && line.trim().startsWith("| status |"));
  if (headerIndex < 0) throw new Error(`Missing table header under ${heading}`);

  const columns = splitRow(lines[headerIndex]);
  const rows = [];
  for (let i = headerIndex + 2; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith("## ")) break;
    if (!line.trim().startsWith("|")) continue;
    const cells = splitRow(line);
    if (cells.length !== columns.length) continue;
    const item = Object.fromEntries(columns.map((column, index) => [column, cells[index] ?? ""]));
    rows.push({ platform, lineIndex: i, columns, cells, item });
  }

  return rows;
}

function countTodo(markdown, platform) {
  return parseTopicTable(markdown, platform).filter((row) => row.item.status === "todo").length;
}

function selectPlatform(markdown, requested, date) {
  if (requested !== "auto") return requested;
  const day = weekday(date);
  if ([1, 3, 5].includes(day)) return "blog";
  if ([2, 4, 6].includes(day)) return "note";
  return countTodo(markdown, "blog") >= countTodo(markdown, "note") ? "blog" : "note";
}

function selectTopic(markdown, platform) {
  const rows = parseTopicTable(markdown, platform);
  return rows.find((row) => row.item.status === "todo") ?? null;
}

function topicTitle(topic) {
  return topic.title_seed || topic.theme || topic.main_keyword || "content draft";
}

function topicKey(topic, platform) {
  return platform === "blog" ? topic.main_keyword : topic.theme;
}

function getSlug(topic, platform) {
  const key = topicKey(topic, platform);
  const mapped = platform === "blog" ? blogSlugMap.get(key) : noteSlugMap.get(key);
  if (mapped) return mapped;
  const hash = createHash("sha1").update(topicTitle(topic)).digest("hex").slice(0, 8);
  return `${platform}-${hash}`;
}

function outputPathFor(platform, date, slug) {
  return path.join(automationRoot, "drafts", platform, `${date}_${slug}.md`);
}

async function nextAvailablePath(basePath) {
  if (!existsSync(basePath)) return basePath;
  const parsed = path.parse(basePath);
  for (let index = 2; index < 100; index += 1) {
    const candidate = path.join(parsed.dir, `${parsed.name}-${index}${parsed.ext}`);
    if (!existsSync(candidate)) return candidate;
  }
  throw new Error(`Could not find available filename for ${basePath}`);
}

async function buildPrompt({ platform, topic, date, slug, topicsMarkdown, promptMarkdown }) {
  const existingDrafts = await listExistingDrafts(platform);
  return `以下のルールに従って、未公開の${platform === "blog" ? "SEOブログ" : "note"}ドラフトをMarkdownで1本だけ作成してください。

日付: ${date}
slug: ${slug}
CTA URL: ${ctaUrl}

選択テーマ:
${JSON.stringify(topic, null, 2)}

既存ドラフト:
${existingDrafts.join("\n") || "なし"}

運用ルール:
${promptMarkdown}

トピック一覧:
${topicsMarkdown}

必須:
- 出力はMarkdown本文のみ。
- frontmatterを必ず含める。
- statusはdraft。
- 自動公開、外部投稿、架空実績の記述は禁止。
- AIは下書きであり、最後は人が確認する表現にする。
- ボイス見積はプロトタイプとして表現する。`;
}

async function listExistingDrafts(platform) {
  const dir = path.join(automationRoot, "drafts", platform);
  try {
    const files = await fs.readdir(dir);
    return files.filter((file) => file.endsWith(".md")).sort();
  } catch {
    return [];
  }
}

async function generateWithOpenAI({ prompt, model, requireAi }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    if (requireAi) throw new Error("OPENAI_API_KEY is missing");
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions:
        "You are a careful Japanese content marketer. Create accurate draft content for a prototype service. Do not invent metrics, customers, case studies, or guarantees.",
      input: prompt,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI Responses API failed: ${response.status} ${text}`);
  }

  const json = await response.json();
  const text = extractOutputText(json);
  if (!text) throw new Error("OpenAI response did not include output text");
  return text.trim();
}

function extractOutputText(responseJson) {
  if (typeof responseJson.output_text === "string") return responseJson.output_text;
  const chunks = [];
  for (const item of responseJson.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n");
}

function generateTemplateDraft({ platform, topic, date, slug }) {
  return platform === "blog"
    ? generateBlogTemplate({ topic, date, slug })
    : generateNoteTemplate({ topic, date, slug });
}

function generateBlogTemplate({ topic, date, slug }) {
  const title = topic.title_seed;
  const keyword = topic.main_keyword;
  const target = topic.target_reader;
  const angle = topic.angle;
  return `---
title: "${title}"
slug: "${slug}"
description: "${keyword}を検討する前に、現場で使える範囲、注意点、導入前に整えるべき情報を整理します。ボイス見積の考え方に沿って、AIを下書きとして安全に使う視点をまとめます。"
publishedAt: "${date}"
platform: "blog"
status: "draft"
main_keyword: "${keyword}"
target_reader: "${target}"
cta_url: "${ctaUrl}"
---

# ${title}

${keyword}に関心が高まっています。ただし、建設業やリフォームの見積は、金額を機械的に出せば終わる仕事ではありません。現場条件、顧客への説明、社内原価、協力業者への指示を分けて扱う必要があります。

この記事では、${target}に向けて、${angle}という視点から、AIを安全に見積業務へ取り入れる考え方を整理します。

## まず整理したい前提

AIは見積を「確定」するものではなく、現場で話した内容やメモをもとに明細候補を作る下書き役として使うのが現実的です。最終判断は人が行い、提出前に単価、数量、条件、除外事項を確認します。

| 観点 | AIに任せやすいこと | 人が確認すべきこと |
| --- | --- | --- |
| 現場メモ | 話した内容の整理 | 聞き漏れ、現場条件 |
| 明細候補 | 品目候補の下書き | 数量、単価、仕様 |
| 書類作成 | 文章のたたき台 | 顧客に出す表現 |
| 社内管理 | 情報の分類 | 原価、値引き判断 |

## ${keyword}で期待できること

期待できるのは、見積作成の前半にある「探す」「転記する」「整理する」を軽くすることです。特に、単価マスターや過去の品目が整理されている会社ほど、下書きの精度を上げやすくなります。

- 現場で話した内容をすぐ文字に残せる
- 単価表や品目候補と照らし合わせやすい
- 顧客向け説明と社内メモを分けやすい
- 帰社後の清書作業を短くしやすい

関連する考え方は、[現場で見積の下書きまで進める記事](/blog/genba-de-mitsumori)でも整理しています。

## できないことを先に決める

AI活用で失敗しやすいのは、任せる範囲を広げすぎることです。金額確定、値引き判断、契約条件の判断まで自動化しようとすると、責任の所在が曖昧になります。

| やらないこと | 理由 | 代わりにやること |
| --- | --- | --- |
| 金額の自動確定 | 現場条件で変わるため | 明細候補までにする |
| 原価判断の自動化 | 会社ごとの基準があるため | 社内確認欄を残す |
| 顧客説明の自動送信 | 誤表現のリスクがあるため | 人が確認して送る |
| 実績の自動作成 | 事実と違う表現になるため | 事実だけを書く |

## 導入前に整えたいデータ

最初に整えるべきなのは、AIそのものではなく単価表と品目名です。Excelで管理している単価表があるなら、それを否定せず、単価マスターとして使える形に整理するのが近道です。

- 品目名を揺れにくくする
- 単位を統一する
- よく使う備考を残す
- 顧客向けと社内向けの情報を分ける

単価表の考え方は、[見積作成時間を短くする工夫](/blog/mitsumori-jikan-tanshuku)とも相性があります。

## 小さく試す進め方

最初から全社導入を決める必要はありません。1人、1現場、1種類の見積から試す方が、現場の負担を抑えられます。

1. よく使う単価表を1つ選ぶ
2. 現場で話す順番を決める
3. 明細候補を下書きとして残す
4. 提出前に人が確認する
5. 使えた点、直したい点を記録する

ボイス見積のデモでは、音声入力から明細候補を作り、単価マスター、社内情報分離、Excel/PDF出力までの流れを確認できます。まずは[デモページ](${ctaUrl})で流れだけ見てください。

## よくある質問

### Q. AIに見積金額まで任せても大丈夫ですか？

A. 金額確定までは任せない方が安全です。AIは明細候補や説明文の下書きに使い、単価、数量、条件は人が確認します。

### Q. Excelの単価表は使えますか？

A. 既存Excelを単価マスターとして活用する考え方が現実的です。最初からExcelを捨てる必要はありません。

### Q. 小規模な会社でも使えますか？

A. むしろ小規模な会社ほど、入力や転記の負担を減らす効果を感じやすい可能性があります。ただし、まずは小さく試すのがおすすめです。

### Q. 顧客にそのまま送れますか？

A. 自動送信は避け、人が確認してから送る運用にします。顧客向け説明と社内メモを分けることも大切です。

### Q. 何から始めるべきですか？

A. 単価表、品目名、よく使う見積パターンの整理から始めると、AIの下書きも扱いやすくなります。

## まとめ

${keyword}は、見積業務のすべてを自動化するものではありません。現場で話した内容を整理し、明細候補を作り、提出前の確認をしやすくするための補助として使うのが安全です。

ボイス見積はまだプロトタイプですが、音声入力、単価マスター、情報分離、Excel/PDF出力の流れを試せます。興味があれば、[デモページ](${ctaUrl})から確認してください。

## 品質チェック

- H2数: 7
- テーブル数: 2
- FAQ数: 5
- 内部リンク: 2
- CTA: 中盤と終盤に2箇所
- 禁止表現: 断定的な削減率、架空実績、架空の社数表現なし
- 公開前確認: 具体例、内部リンク、CTA文言を人が確認する
`;
}

function generateNoteTemplate({ topic, date, slug }) {
  const title = topic.title_seed;
  const theme = topic.theme;
  const target = topic.target_reader;
  const angle = topic.angle;
  return `---
title: "${title}"
slug: "${slug}"
publishedAt: "${date}"
platform: "note"
status: "draft"
main_theme: "${theme}"
target_reader: "${target}"
cta_url: "${ctaUrl}"
x_account: "https://x.com/kabu_network"
video_file: "C:\\mitsumori_project\\web\\public\\videos\\voice-estimate-short.mp4"
---

# ${title}

見積の仕事は、現場が終わったあとに静かに残ります。

現場で話したこと、写真に残したこと、頭の中で覚えていること。そこから品目を選び、数量を確認し、Excelや見積ソフトに入力して、顧客向けの説明と社内向けのメモを分ける。慣れている人ほど当たり前にこなしていますが、冷静に見るとかなり負担の大きい仕事です。

今回のテーマは「${theme}」です。${angle}という視点から、ボイス見積を作っている理由を少し整理します。

## 現場を急がせたいわけではない

業務効率化という言葉は、時々きつく聞こえます。もっと早く、もっと多く、もっと詰めて働く。そういう方向に聞こえてしまうことがあります。

でも、ボイス見積でやりたいのはそこではありません。

現場の作業を急がせるのではなく、現場のあとに残る事務作業を少し軽くしたい。特に、帰ってから「あの内容なんだっけ」と思い出しながら入力する時間を減らしたい。そこが出発点です。

## 話した内容を、消える前に残す

現場では、見積に必要な情報が会話の中にたくさん出てきます。

「ここは既存撤去が必要」
「この面は別単価で見た方がいい」
「お客様にはこの説明をしておく」
「業者さんにはここを注意して伝える」

こういう情報は、時間が経つほど薄れていきます。だから、まずは話した内容をその場で下書きにしておく。最終的な見積は人が確認するとしても、素材だけ先に残しておく。それだけで、後工程はかなり進めやすくなります。

## AIに任せたいところ、任せないところ

AIに全部任せたいわけではありません。

むしろ、見積金額の確定や値引き判断、契約条件の判断は人が見るべきです。会社ごとの基準がありますし、現場条件によっても変わります。

一方で、話した内容を整理する、明細候補を出す、社内向けメモと顧客向け説明を分ける。このあたりは、AIが下書き役として手伝える余地があります。

## Excelを否定しない

小さな会社ほど、Excelに大事な情報が詰まっています。

単価表、過去の見積、よく使う品目、社内だけの備考。これをいきなり捨てて新しい仕組みに移るのは、現実的ではありません。

だから、ボイス見積では既存のExcel単価表を活かす方向で考えています。今ある運用を否定するのではなく、現場で使いやすい形に少しずつつなげる。重い業務管理システムではなく、まず見積の下書きから軽くするイメージです。

## まだプロトタイプです

正直に言うと、ボイス見積はまだ完成したSaaSではありません。

今は、音声入力、単価マスター、情報分離、Excel/PDF出力の流れを見てもらうためのプロトタイプです。だからこそ、早めに見てもらって「ここは違う」「これは使えそう」「現場だとこうなる」という声を集めたいと思っています。

デモの流れは、こちらから確認できます。

${ctaUrl}

## 15秒動画で伝えたいこと

短い動画では、現場で話した内容が見積明細の下書きになる流れを見せています。

動画だけで全部は伝わりませんが、キーボードが苦手でも、まず話すところから始められる。その入口を感じてもらえれば十分です。

## 公開前メモ

- note冒頭に入れる画像/動画: voice-estimate-short.mp4 を冒頭または本文前半に配置
- X投稿文候補: 「現場を急がせるためではなく、帰ってから残る見積作業を軽くするために作っています。」
- CTA: ${ctaUrl}
- 禁止表現: 架空実績、削減率の断定、完成済みサービス表現なし
`;
}

function validateDraft(markdown, platform) {
  const issues = [];
  if (!markdown.startsWith("---\n")) issues.push("frontmatter is missing");
  if (!/status:\s*[\"']?draft[\"']?/.test(markdown)) issues.push("frontmatter status=draft is missing");
  if (!/slug:\s*[\"'][a-z0-9-]+[\"']/.test(markdown)) issues.push("slug is missing or not ascii kebab-case");

  for (const phrase of bannedPhrases) {
    if (markdown.includes(phrase)) issues.push(`banned phrase: ${phrase}`);
  }

  if (platform === "blog") {
    const h2Count = (markdown.match(/^## /gm) ?? []).filter((line) => !line.includes("品質チェック")).length;
    const tableCount = (markdown.match(/^\|.*---.*\|$/gm) ?? []).length;
    const faqCount = (markdown.match(/^### Q\./gm) ?? []).length;
    const ctaCount = (markdown.match(new RegExp(escapeRegExp(ctaUrl), "g")) ?? []).length;
    const internalLinkCount = (markdown.match(/\]\(\/blog\//g) ?? []).length;
    if (h2Count < 5) issues.push(`blog H2 count is low: ${h2Count}`);
    if (tableCount < 2) issues.push(`blog table count is low: ${tableCount}`);
    if (faqCount < 4) issues.push(`blog FAQ count is low: ${faqCount}`);
    if (ctaCount < 2) issues.push(`blog CTA count is low: ${ctaCount}`);
    if (internalLinkCount < 2) issues.push(`blog internal link count is low: ${internalLinkCount}`);
  }

  if (platform === "note") {
    const bodyLength = markdown.replace(/^---[\s\S]*?---/, "").length;
    if (bodyLength < 1200) issues.push(`note body may be short: ${bodyLength} chars`);
  }

  return issues;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateTopics(markdown, selected, outputRelPath, date) {
  const lines = markdown.split(/\r?\n/);
  const statusIndex = selected.columns.indexOf("status");
  const noteIndex = selected.columns.indexOf("angle");
  const cells = [...selected.cells];
  cells[statusIndex] = "drafted";
  if (noteIndex >= 0) {
    cells[noteIndex] = `${cells[noteIndex]}（${date} draft: ${outputRelPath}）`;
  }
  lines[selected.lineIndex] = `| ${cells.join(" | ")} |`;
  return lines.join("\n");
}

function markdownSummary({ platform, topic, date, slug, outputPath, source, dryRun, issues }) {
  const relPath = path.relative(repoRoot, outputPath).replace(/\\/g, "/");
  return [
    "## Daily content draft result",
    `- platform: ${platform}`,
    `- date: ${date}`,
    `- title: ${topicTitle(topic)}`,
    `- slug: ${slug}`,
    `- path: ${relPath}`,
    `- source: ${source}`,
    `- dryRun: ${dryRun ? "yes" : "no"}`,
    `- validation: ${issues.length === 0 ? "ok" : "needs review"}`,
    ...issues.map((issue) => `  - ${issue}`),
  ].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [topicsMarkdown, promptMarkdown] = await Promise.all([
    fs.readFile(topicsPath, "utf8"),
    fs.readFile(promptPath, "utf8"),
  ]);

  let platform = selectPlatform(topicsMarkdown, args.platform, args.date);
  let selected = selectTopic(topicsMarkdown, platform);
  if (!selected && args.platform === "auto") {
    const other = platform === "blog" ? "note" : "blog";
    selected = selectTopic(topicsMarkdown, other);
    if (selected) platform = other;
  }
  if (!selected) throw new Error(`No todo topics left for platform: ${platform}`);

  const topic = selected.item;
  const slug = getSlug(topic, platform);
  const outputPath = await nextAvailablePath(outputPathFor(platform, args.date, slug));
  const outputRelPath = path.relative(repoRoot, outputPath).replace(/\\/g, "/");

  if (args.checkOnly) {
    console.log(
      markdownSummary({
        platform,
        topic,
        date: args.date,
        slug,
        outputPath,
        source: "check-only",
        dryRun: true,
        issues: [],
      }),
    );
    return;
  }

  const generationPrompt = await buildPrompt({
    platform,
    topic,
    date: args.date,
    slug,
    topicsMarkdown,
    promptMarkdown,
  });

  let markdown = null;
  let source = "template";
  if (!args.noAi) {
    try {
      markdown = await generateWithOpenAI({ prompt: generationPrompt, model: args.model, requireAi: args.requireAi });
      if (markdown) source = `openai:${args.model}`;
    } catch (error) {
      if (args.requireAi) throw error;
      source = `template (AI skipped: ${error.message.replace(/\s+/g, " ").slice(0, 140)})`;
    }
  } else {
    source = "template (--no-ai)";
  }

  if (!markdown) {
    markdown = generateTemplateDraft({ platform, topic, date: args.date, slug });
  }

  const issues = validateDraft(markdown, platform);
  if (!args.dryRun) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${markdown.trim()}\n`, "utf8");

    if (!args.noTopicUpdate) {
      const updatedTopics = updateTopics(topicsMarkdown, selected, outputRelPath, args.date);
      await fs.writeFile(topicsPath, `${updatedTopics.trimEnd()}\n`, "utf8");
    }
  }

  console.log(
    markdownSummary({
      platform,
      topic,
      date: args.date,
      slug,
      outputPath,
      source,
      dryRun: args.dryRun,
      issues,
    }),
  );
}

main().catch((error) => {
  console.error(`content-agent error: ${error.message}`);
  process.exit(1);
});
