# Neon データベース設計メモ

## 1. 採用方針

Supabaseは使わず、Neon Postgresを利用する。

構成は以下とする。

| 項目 | 採用 |
| --- | --- |
| Web | Vercel / Next.js |
| DB | Neon Postgres |
| ファイル保存 | Vercel Blob |
| 認証 | Auth.js / Clerk / Neon Auth のいずれか |
| 決済 | Stripe |
| AI | OpenAI API |

## 2. セキュリティ方針

Neonの接続情報はブラウザに出さない。

すべてのDB操作はNext.js API RouteまたはServer Actionから実行する。
クライアントから送られた `tenant_id` は信用しない。
ログインユーザーの認証情報からサーバー側で `tenant_id` を決定する。

## 3. 会社別データ分離

MVPでは、1つのNeon Postgres内で `tenant_id` により会社別データを分離する。

防御は3層にする。

| 層 | 内容 |
| --- | --- |
| API層 | すべての検索・更新条件にサーバー決定の `tenant_id` を付与 |
| DB制約 | `tenant_id` を含む複合外部キーで他会社データ参照を防止 |
| 運用 | DB接続文字列はサーバー環境変数のみ。ブラウザへ公開しない |

PostgresのRLSも利用可能だが、NeonではSupabase Authの `auth.uid()` は使えない。
本番でRLSを追加する場合は、DBロールまたはセッション変数 `app.tenant_id` を使う方式にする。
MVPではまずAPI層と複合外部キーで確実に守る。

## 4. ファイル保存

音声ファイル、Excel取込ファイル、Excel/PDF出力ファイルはDBに保存しない。

DBには以下だけを保存する。

- ファイル種別
- 保存先プロバイダ
- オブジェクトキー
- ファイル名
- MIME type
- サイズ
- `tenant_id`

実体はVercel Blobに保存する。

## 5. 主要テーブル

| テーブル | 用途 |
| --- | --- |
| `tenants` | 会社 |
| `users` | ユーザー、認証連携、ロール |
| `customers` | 顧客 |
| `price_items` | 単価マスター |
| `estimates` | 見積ヘッダ |
| `estimate_lines` | 見積明細 |
| `files` | ファイルメタ情報 |
| `ai_analysis_runs` | 音声/テキスト解析履歴 |
| `import_jobs` | Excel取込ジョブ |
| `export_jobs` | Excel/PDF/連携データ出力ジョブ |
| `audit_logs` | 監査ログ |

## 6. 見積明細のルール

見積明細は以下を持つ。

- 場所
- 品目
- 数量
- 単位
- 単価
- 金額
- 備考
- 業者指示事項
- 並び順
- 単価マスター参照ID
- 外部連携用ID

AIはヘッダ情報を入力しない。
AIが作成するのは明細候補のみ。
単位と単価は単価マスターから取得し、AIには判断させない。

## 7. Neon Freeでの開始

初期MVPはNeon Freeで開始する。

| 項目 | 方針 |
| --- | --- |
| DB容量 | 顧客・見積・明細のみなら当面小さい |
| 音声/Excel/PDF | Vercel Blobへ分離 |
| DB接続 | Serverless接続またはPooling接続 |
| 有料移行 | 利用頻度が増えたらLaunchへ移行 |

## 8. 実行順

1. Neonプロジェクトを作成する。
2. 接続文字列を取得する。
3. `neon/migrations/202606020001_core_schema.sql` をSQL Editorで実行する。
4. Vercel環境変数に `DATABASE_URL` を設定する。
5. Next.js APIから接続する。
