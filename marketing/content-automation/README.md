# Daily Content Automation

ボイス見積のnote/SEOブログ記事を、毎日1本ずつAIでドラフト生成するための運用フォルダです。

## 方針

- 毎日1本、未公開ドラフトを作成する
- 自動公開はしない
- 人が確認してから、note投稿またはWebブログ掲載へ進める
- SEO記事は検索流入、note記事は共感・開発背景・SNS導線を重視する

## 保存先

```text
marketing/content-automation/drafts/blog/
marketing/content-automation/drafts/note/
```

## 毎日の流れ

1. `topics.md` から未消化テーマを選ぶ
2. `daily-draft-prompt.md` のルールで1本作成する
3. Markdownドラフトとして保存する
4. 末尾に品質チェックを入れる
5. 公開前の修正点を残す

## 公開までの流れ

blogの場合:

1. ドラフトを確認する
2. 文章、CTA、内部リンクを調整する
3. `web/lib/blog.ts` の `BLOG_POSTS` に変換して追加する
4. `npm.cmd run build` で確認する
5. Vercelへデプロイする
6. Search ConsoleでURL検査する

noteの場合:

1. ドラフトを確認する
2. 冒頭、見出し、改行、動画挿入位置を調整する
3. noteへ手動で貼り付ける
4. LP、デモ動画、Xへの導線を確認する

## 禁止

- 自動投稿
- 実績、削減率、導入社数の捏造
- 有料提供前に料金や保証を断定する表現
- AIが金額を自動確定する表現
- 顧客データや個人情報の入力を促す表現
## プログラム実行

```powershell
cd C:\mitsumori_project\web
npm.cmd run content:next
npm.cmd run content:draft:dry
npm.cmd run content:draft
```

- `content:next`: 次に選ばれるテーマを確認する
- `content:draft:dry`: ファイルを書かずに生成予定を確認する
- `content:draft`: 1本生成し、`topics.md` を `drafted` に更新する
- `OPENAI_API_KEY` がある場合はAI生成、ない場合は安全テンプレートで生成する

