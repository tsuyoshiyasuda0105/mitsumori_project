# Content Agent Program Implementation

ボイス見積のnote/SEOブログドラフトを、コマンドで1本生成するための実装メモです。

## 実行コマンド

```powershell
cd C:\mitsumori_project\web
npm.cmd run content:next
npm.cmd run content:draft:dry
npm.cmd run content:draft
```

## AI生成

`OPENAI_API_KEY` が設定されている場合は OpenAI Responses API を使ってドラフトを生成します。
未設定の場合は、安全なローカルテンプレートでドラフトを作ります。

```powershell
$env:OPENAI_API_KEY="sk-..."
$env:CONTENT_AGENT_MODEL="gpt-5-mini"
npm.cmd run content:draft
```

## 生成先

- SEOブログ: `marketing/content-automation/drafts/blog/YYYY-MM-DD_slug.md`
- note: `marketing/content-automation/drafts/note/YYYY-MM-DD_slug.md`

## 動作

1. `topics.md` から `todo` のテーマを選ぶ
2. 曜日ルールで `blog` / `note` を決める
3. AIまたは安全テンプレートでMarkdownを生成する
4. `topics.md` の該当テーマを `drafted` に更新する
5. 禁止表現、frontmatter、CTA、内部リンクなどを簡易チェックする

## 注意

- 自動公開はしない
- `web/lib/blog.ts` は自動編集しない
- 公開前に人が本文、CTA、内部リンク、事実関係を確認する
- 架空実績、導入社数、削減率の断定は禁止
