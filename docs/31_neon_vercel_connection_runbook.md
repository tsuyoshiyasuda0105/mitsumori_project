# Neon / Vercel 接続 Runbook

| Item | Value |
| --- | --- |
| Scope | Neon 接続 URL 入手後の migration 適用、Vercel 環境変数設定、再デプロイ、API 確認、E2E 確認 |
| Related setup doc | `docs/28_database_save_api_setup.md` |
| Related checklist | `docs/30_neon_production_checklist.md` |
| Related migration | `neon/migrations/202606020001_core_schema.sql` |
| Last updated | 2026-06-03 |

## 0. 重要ルール

- この手順書やコミット、チャット、チケットに Neon 接続 URL やパスワード、トークンなどの秘密値を絶対に書かない。
- 秘密値を扱う場合も、記録に残すのは環境変数名 `DATABASE_URL` と `MITSUMORI_TENANT_ID` のみとする。
- 本番 DB へ適用する前に、可能であれば Neon の staging / preview branch で同じ migration を適用して確認する。
- Vercel の Production 環境変数を変更したら、既存デプロイには自動反映されないため、必ず再デプロイする。
- DB runtime role は、可能であれば owner / migration role と分離する。

## 1. 前提確認

1. Neon project または production branch が作成済みであることを確認する。
2. Neon で `DATABASE_URL` 用の接続 URL を取得できることを確認する。
3. `neon/migrations/202606020001_core_schema.sql` を適用する DB が正しい branch / database であることを確認する。
4. Vercel Project Settings の Environment Variables を編集できる権限があることを確認する。
5. 本番確認に使う Vercel デプロイ先ドメインを確認する。

## 2. 実行順序サマリー

1. Neon 接続確認を行う。
2. staging / preview branch に migration を適用して schema を確認する。
3. production branch に migration を適用する。
4. 必要に応じて固定 tenant の ID を確認する。
5. Vercel Production 環境変数に `DATABASE_URL` を設定する。
6. 固定 tenant を使う場合のみ `MITSUMORI_TENANT_ID` を設定する。
7. Vercel Production を再デプロイする。
8. `/api/estimates` の API 応答を確認する。
9. 画面から見積作成、再読み込み、一覧保持の E2E 確認を行う。
10. 問題があれば環境変数、migration 適用先、API ログを順に切り分ける。

## 3. Neon 接続確認

Neon SQL Editor または安全な DB クライアントで、接続先が想定 DB であることを確認する。

```sql
select
  current_database() as database_name,
  current_user as connected_user,
  now() as checked_at;
```

SSL 接続状態を確認する。

```sql
select ssl, version, cipher
from pg_stat_ssl
where pid = pg_backend_pid();
```

確認観点:

- `current_database()` が本番用または確認対象 branch の DB である。
- `current_user` が想定した role である。
- SSL が有効である。

## 4. Migration 適用

### 4.1 staging / preview branch

1. Neon の staging / preview branch を開く。
2. SQL Editor で `neon/migrations/202606020001_core_schema.sql` の内容を実行する。
3. エラーがないことを確認する。
4. schema 確認 SQL を実行する。

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'tenants',
    'users',
    'customers',
    'price_items',
    'estimates',
    'estimate_lines',
    'files',
    'ai_analysis_runs',
    'import_jobs',
    'export_jobs',
    'audit_logs'
  )
order by table_name;
```

期待値:

- 上記 11 テーブルが返る。
- `pgcrypto` extension が有効で、`gen_random_uuid()` を使うテーブル作成に失敗していない。

### 4.2 production branch

staging / preview branch で問題がなければ、同じ migration を production branch に適用する。

1. Neon の production branch を開く。
2. SQL Editor で `neon/migrations/202606020001_core_schema.sql` の内容を実行する。
3. schema 確認 SQL を再実行する。
4. `tenants`, `users`, `customers`, `price_items`, `estimates`, `estimate_lines` が存在することを重点確認する。

注意:

- この migration は core schema 作成用であり、同名 table が既に存在する DB へ再実行すると失敗する可能性がある。
- 既存データがある本番 DB では、実行前に Neon branch / backup / restore 方針を確認する。

## 5. Vercel 環境変数設定

Vercel Project Settings の Environment Variables で Production に以下を設定する。

| Name | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Neon の Postgres 接続 URL。値は記録しない。 |
| `MITSUMORI_TENANT_ID` | Optional | 固定 tenant を使う場合のみ設定する。値は記録しない。 |

手順:

1. Vercel Dashboard で対象 Project を開く。
2. Settings > Environment Variables を開く。
3. Production に `DATABASE_URL` を追加または更新する。
4. 固定 tenant 運用が必要な場合のみ、Production に `MITSUMORI_TENANT_ID` を追加または更新する。
5. Preview / Development にも必要な場合は、本番値を流用せず、それぞれの branch / DB 用の値を設定する。

## 6. Vercel 再デプロイ

環境変数を設定したら Production を再デプロイする。

推奨手順:

1. Vercel Dashboard の Deployments を開く。
2. 最新 Production deployment を選ぶ。
3. Redeploy を実行する。
4. Build が成功することを確認する。
5. 新しい Production deployment の URL を確認する。

確認観点:

- 再デプロイ後の serverless runtime が `DATABASE_URL` を参照できる。
- Build / Runtime logs に接続 URL や秘密値が出力されていない。
- 失敗した場合は、環境変数名の typo、Production scope の設定漏れ、migration 未適用を確認する。

## 7. API 確認

再デプロイ後、API を確認する。

```powershell
Invoke-WebRequest https://<production-domain>/api/estimates -UseBasicParsing
```

期待値:

```json
{
  "mode": "database"
}
```

DB 未設定時の期待値は local fallback である。

```json
{
  "mode": "local"
}
```

確認観点:

- `mode` が `database` になっている。
- レスポンスやログに `DATABASE_URL` の値が含まれていない。
- DB 接続失敗時も秘密値を含まない安全な error になっている。
- 文字化けや `????` が含まれていない。

## 8. E2E 確認

画面から本番デプロイを開き、見積保存が DB に永続化されることを確認する。

1. `/estimates` を開く。
2. 新規見積を 1 件作成する。
3. 保存後、画面上に DB 保存済みであることを示す表示が出ることを確認する。
4. ブラウザを再読み込みする。
5. 作成した見積が一覧に残っていることを確認する。
6. 別ブラウザまたはシークレットウィンドウで同じ本番 URL を開き、localStorage 依存ではなく DB から取得できていることを確認する。
7. Neon 側で `estimates` と `estimate_lines` に対象データが保存されていることを確認する。

確認 SQL 例:

```sql
select id, tenant_id, estimate_no, title, total_amount, created_at
from estimates
order by created_at desc
limit 5;
```

```sql
select estimate_id, line_no, item_name, quantity, unit_price, amount
from estimate_lines
order by created_at desc, line_no asc
limit 20;
```

## 9. トラブルシュート

| Symptom | First checks |
| --- | --- |
| `/api/estimates` が `mode: local` のまま | Vercel Production に `DATABASE_URL` が設定されているか、再デプロイ済みかを確認する。 |
| API が DB 接続エラー | Neon branch / database / role / SSL / IP 制限 / 接続 URL の形式を確認する。 |
| table not found | migration を適用した branch と `DATABASE_URL` の接続先が一致しているか確認する。 |
| tenant 関連のエラー | `MITSUMORI_TENANT_ID` の設定有無と、対象 tenant が DB に存在するか確認する。 |
| 保存後に再読み込みで消える | API が database mode か、POST が成功しているか、ブラウザ保存 fallback になっていないか確認する。 |
| 文字化けがある | API response、DB の text 値、フロント表示、ログを確認する。 |

## 10. 完了条件

- production branch に migration が適用済みである。
- Vercel Production に `DATABASE_URL` が設定済みである。
- 固定 tenant が必要な場合、Vercel Production に `MITSUMORI_TENANT_ID` が設定済みである。
- Production が再デプロイ済みである。
- `/api/estimates` が `mode: database` を返す。
- 画面から作成した見積が再読み込み後も残る。
- 秘密値がドキュメント、ログ、チャット、コミットに残っていない。
