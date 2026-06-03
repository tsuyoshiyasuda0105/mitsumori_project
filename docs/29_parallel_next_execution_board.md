# 並列次アクション実行ボード

## 目的

進行中の作業を止めずに、開発、SEO、DB、本番確認、コンテンツ自動化を衝突しにくい単位へ分けるための実行ボードです。

## 現在の進捗

| レーン | 状態 | 参照ファイル | 次の一手 |
| --- | --- | --- | --- |
| LP/動画 | 本番反映済み | `web/components/marketing/Landing.tsx` | 公開URLで動画が枠内に収まることを確認済み |
| SEO | 本番反映済み | `web/lib/blog.ts`, `web/components/marketing/BlogContent.tsx`, `web/app/sitemap.ts` | 比較記事と公開ページのsitemap反映を確認済み |
| 見積アプリ | 進行中 | `web/components/estimate/EstimateEditor.tsx`, `web/lib/mock.ts`, `web/lib/estimate-store.ts` | 保存、単価マスター反映、DB接続後の永続化を本番で確認する |
| DB/Neon | 準備済み | `docs/28_database_save_api_setup.md`, `neon/migrations/202606020001_core_schema.sql` | Neonへmigrationを適用し、Vercelに`DATABASE_URL`を設定する |
| コンテンツ自動化 | 実装済み | `marketing/content-automation/`, `docs/27_content_agent_program_implementation.md` | 8:00自動実行の初回結果を確認し、テーマを追加する |
| QA/本番確認 | 継続 | `docs/06_qa_test_plan.md`, `docs/30_neon_production_checklist.md` | デプロイ後にLP、ブログ、API、保存導線を確認する |

## 今日の並列タスク

| 優先 | タスク | 成果物 | 完了条件 |
| ---: | --- | --- | --- |
| P0 | 動画表示崩れ修正 | LPの動画プレイヤー表示 | 完了: デスクトップ/スマホ幅で動画が枠内に収まり、文字が切れない |
| P0 | 本番ビルド確認 | `npm run build` | `/`, `/blog`, `/api/estimates` がビルド対象として通る |
| P1 | SEO比較記事公開 | 比較記事ページ | タイトル、description、表、CTA、FAQが表示される |
| P1 | Neon本番準備 | DBチェックリスト | migration、環境変数、接続確認SQLがそろう |
| P1 | Search Console補助 | sitemap/robots確認 | 完了: `/sitemap.xml` と `/robots.txt` が200で取得でき、公開ページも含まれる |

## 衝突防止ルール

- LP修正は `web/components/marketing/Landing.tsx` に限定する。
- SEO記事追加は `web/lib/blog.ts` と表示コンポーネントに限定する。
- DB本番準備はdocsと`neon/`配下に限定し、秘密情報は書かない。
- 見積アプリの保存ロジックは既存のローカル保存フォールバックを壊さない。
- デプロイ前は必ず `npm run build` を通す。

## 報告フォーマット

```text
担当:
変更ファイル:
確認結果:
残課題:
次の一手:
```