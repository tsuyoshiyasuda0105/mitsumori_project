# 並列ワークストリーム状況

Last updated: 2026-06-03 21:57 JST

## 方針

ユーザー指示「途中で止めずに、並列で動かす」に対応し、外部ログイン・秘密情報が不要な作業は先行して進める。

## 現在のレーン状況

| レーン | 状態 | ブロッカー | 成果物 |
| --- | --- | --- | --- |
| note投稿準備 | 投稿前準備完了 | noteログイン/投稿はユーザー操作が必要 | `marketing/note/02_reform_construction_estimate_ai_note.md`, `marketing/note/README.md`, `marketing/note/assets/note-thumbnail-reform-construction-ai.png` |
| 見積アプリDB連携 | 見積保存APIは実装済み。音声以外はDB連携を本線にする | Neon `DATABASE_URL` 待ち。一部機能はDB接続前に実装可能 | `web/app/(main)/estimates/[id]/export/page.tsx`, `web/lib/export-utils.ts` |
| お問い合わせページ | 実装・本番デプロイ済み | 通知先Webhook未設定。メールアドレスは非表示 | `web/app/(site)/contact/page.tsx`, `web/components/marketing/ContactForm.tsx`, `web/app/api/contact/route.ts` |
| Neon/Vercel接続準備 | 手順書作成済み | Neon `DATABASE_URL` はユーザー待ち | `docs/31_neon_vercel_connection_runbook.md` |
| SEO/マーケ素材 | 記事・note・サムネ準備済み | note公開はユーザー操作待ち | `marketing/note/` |

## 自動フォローアップ

- 30分ごとにこのスレッドで未完了レーンを確認するHeartbeatを設定済み。
- 外部投稿、Googleログイン、noteログイン、秘密情報入力はユーザー操作待ちとして扱う。
- 進められるものは、ビルド・確認・GitHub反映まで続ける。

## 現時点の待ち

| 項目 | 待ち理由 | 次に必要なもの |
| --- | --- | --- |
| Search Console sitemap送信 | Googleログインが必要 | ユーザー操作でログイン |
| note投稿 | noteログインと最終確認が必要 | ユーザー操作で投稿画面確認 |
| Neon DB本番化 | 接続URLが必要 | `DATABASE_URL` |
| 問い合わせ通知の実配送 | 通知先未設定 | `CONTACT_WEBHOOK_URL` など通知先Webhook |
| 音声録音/文字起こし本番化 | ユーザー側で検証後にデモ化。費用発生があるため保留 | 検証方針・利用API・費用感の決定 |


