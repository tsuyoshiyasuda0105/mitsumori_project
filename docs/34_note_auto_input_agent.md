# note自動入力エージェント設計

## 目的

noteの記事公開作業のうち、AIで安全に任せられる範囲を自動化する。

- 自動化する: タイトル、本文、タグ、見出し画像の投入
- 自動化しない: noteログイン、公開ボタン、予約投稿ボタン、課金設定、アカウント設定

## 基本フロー

1. 記事ドラフトを `marketing/note/*.md` に作る。
2. `npm.cmd run note:prepare` を実行する。
3. `marketing/note/publish-ready/YYYY-MM-DD_slug/` に投稿用ファイルを出す。
4. ユーザーがnoteへログインする。
5. エージェントがPlaywrightで `https://note.com/notes/new` を開く。
6. エージェントが `title.txt`、`body.md`、`hashtags.txt`、サムネイルを入力する。
7. ユーザーがプレビュー確認後、手動で公開する。

## なぜ完全自動公開にしないか

noteはログイン状態、画像アップロード、埋め込み、規約変更、公開確認画面など外部要素がある。誤公開を避けるため、公開ボタンだけは人が押す。

この設計なら、毎日の下書き生成と入力作業は自動化しつつ、公開責任と最終確認は人が持てる。

## コマンド

```powershell
cd C:\mitsumori_project\web
npm.cmd run note:prepare
```

出力例:

```text
marketing/note/publish-ready/2026-06-04_reform-construction-estimate-ai/
  title.txt
  body.md
  hashtags.txt
  manifest.json
  README.md
  note-thumbnail-reform-construction-ai.png
```

## エージェントへの指示例

```text
noteにログイン済みです。
C:\mitsumori_project\marketing\note\publish-ready\YYYY-MM-DD_slug の内容を使って、note新規投稿画面にタイトル、本文、タグ、見出し画像を自動入力してください。公開ボタンは押さないでください。
```

## 確認項目

- タイトルが `title.txt` と一致している
- 本文に作業用見出しやfrontmatterが入っていない
- 表が崩れていない
- サンプル動画のURLが意図したものになっている
- デモURLと元記事URLが開ける
- ハッシュタグが入っている
- サムネイルがホームページと同じ方向性になっている

## 今後の拡張

- YouTube限定公開URLをmanifestに追加して、本文中の動画URLを自動差し替えする
- 投稿前チェック結果を `publish-check.json` に保存する
- note投稿後のURLを `marketing/content-automation/topics.md` に記録する
