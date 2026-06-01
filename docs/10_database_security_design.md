# データベース分離・セキュリティ設計書

## 1. 目的

本ドキュメントは、音声AI見積作成システムにおいて、他会社の情報が見えない・更新できない・削除できないことを保証するためのデータベース設計、API設計、ファイル管理、検証方針を定義する。

本システムは複数会社が利用するマルチテナント型Webアプリケーションである。会社ごとの情報分離を最重要要件として扱う。

## 2. 基本方針

- 会社単位を `tenant` と呼び、すべての業務データは必ず `tenant_id` を持つ。
- クライアントから送られた `tenant_id` は信用しない。
- ログインユーザーのセッションからサーバー側で `tenant_id` を確定する。
- すべての検索、参照、更新、削除は `tenant_id` 条件を必須とする。
- UUIDでIDを推測しにくくしても、UUIDだけに依存しない。
- DBレベルでもRow Level Security相当の制御を入れ、API実装ミスでも他社データを返さない設計にする。
- ファイル、音声、Excel、PDF、AI解析履歴、打ち合わせ録音もすべて会社単位で分離する。
- 認証はSupabase Authを利用し、アプリケーションDBの `users` はSupabase Authユーザーに紐づくプロフィール/権限テーブルとして扱う。
- Supabase Storageのバケットは非公開を基本とし、会社IDを含むパスと署名URLでアクセス制御する。

## 3. テナント構造

### 3.1 tenants

会社を表す親テーブル。

```text
tenants
- id
- name
- status
- created_at
- updated_at
```

### 3.2 users

ユーザーは必ず1つの会社に所属する。認証自体はSupabase Authが担当し、アプリDBの `users` は業務上のプロフィール、会社所属、ロール、権限を管理する。

```text
users
- id
- auth_user_id
- tenant_id
- name
- email
- role
- permissions
- status
- created_at
- updated_at
```

ログイン後の認証情報には、少なくとも以下を含める。

```json
{
  "auth_user_id": "uuid",
  "user_id": "uuid",
  "tenant_id": "uuid",
  "role": "admin"
}
```

## 4. tenant_id 必須テーブル

以下の業務テーブルは必ず `tenant_id` を持つ。

| テーブル | tenant_id | 備考 |
| --- | --- | --- |
| users | 必須 | 所属会社 |
| customers | 必須 | 顧客情報 |
| price_items | 必須 | 単価マスター |
| estimates | 必須 | 見積ヘッダー |
| estimate_lines | 必須 | 見積明細 |
| ai_analysis_runs | 必須 | AI解析履歴 |
| meeting_recordings | 必須 | 打ち合わせ録音。別オプション有効時のみ使用 |
| import_jobs | 必須 | Excel取込ジョブ |
| export_jobs | 必須 | Excel/PDF出力ジョブ |
| files | 必須 | 音声、Excel、PDF、ロゴ |
| audit_logs | 必須 | 監査ログ |

`tenants` 自体は親テーブルのため `tenant_id` を持たない。

## 5. 複合外部キー設計

単に各テーブルに `tenant_id` を持たせるだけでは不十分である。  
子テーブルから親テーブルを参照する場合は、原則として `tenant_id` を含む複合外部キーを使う。

### 5.1 例: estimates と customers

```text
customers
- tenant_id
- id

estimates
- tenant_id
- customer_id
```

外部キー:

```text
estimates(tenant_id, customer_id)
  -> customers(tenant_id, id)
```

これにより、会社Aの見積が会社Bの顧客IDを参照することをDBレベルで防ぐ。

### 5.2 例: estimate_lines と estimates

```text
estimate_lines(tenant_id, estimate_id)
  -> estimates(tenant_id, id)
```

### 5.3 例: estimate_lines と price_items

```text
estimate_lines(tenant_id, price_item_id)
  -> price_items(tenant_id, id)
```

### 5.4 例: meeting_recordings

```text
meeting_recordings(tenant_id, customer_id)
  -> customers(tenant_id, id)

meeting_recordings(tenant_id, estimate_id)
  -> estimates(tenant_id, id)
```

## 6. 推奨インデックス

会社単位の絞り込みを高速かつ強制しやすくするため、主要テーブルには以下のインデックスを設定する。

```text
customers(tenant_id, id)
customers(tenant_id, name)

price_items(tenant_id, id)
price_items(tenant_id, name)
price_items(tenant_id, name, unit)

estimates(tenant_id, id)
estimates(tenant_id, customer_id)
estimates(tenant_id, estimate_no)
estimates(tenant_id, status)

estimate_lines(tenant_id, estimate_id, line_no)

ai_analysis_runs(tenant_id, id)
meeting_recordings(tenant_id, id)
meeting_recordings(tenant_id, customer_id)
meeting_recordings(tenant_id, estimate_id)

files(tenant_id, id)
import_jobs(tenant_id, id)
export_jobs(tenant_id, id)
audit_logs(tenant_id, created_at)
```

## 7. Row Level Security

Supabase Postgresでは、MVPでもRow Level Securityを導入することを推奨する。

### 7.1 基本方針

- tenant対象テーブルでRLSを有効化する。
- ブラウザからSupabaseを直接利用する場合は、Supabase Authの `auth.uid()` をもとに `users.auth_user_id` から `tenant_id` を判定する。
- Vercel APIからService Role Keyを使う処理ではRLSをバイパスできるため、API層で必ず `tenant_id` 条件を付ける。Service RoleはWebhook、ジョブ、管理系処理など最小範囲に限定する。
- 将来、アプリ独自のDB接続を使う場合は、トランザクションごとに `app.tenant_id` を設定し、`tenant_id = current_setting('app.tenant_id')::uuid` を強制する方式も併用できる。

### 7.2 RLS例

```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_customers
ON customers
USING (
  tenant_id in (
    select tenant_id
    from users
    where auth_user_id = auth.uid()
      and status = 'active'
  )
)
WITH CHECK (
  tenant_id in (
    select tenant_id
    from users
    where auth_user_id = auth.uid()
      and status = 'active'
  )
);
```

同様のポリシーを以下にも設定する。

- customers
- price_items
- estimates
- estimate_lines
- ai_analysis_runs
- meeting_recordings
- import_jobs
- export_jobs
- files
- audit_logs

## 8. API設計ルール

### 8.1 tenant_idをクライアントから受け取らない

APIリクエストで `tenant_id` を指定させない。  
サーバー側でログインユーザーのセッションから取得する。

悪い例:

```json
{
  "tenant_id": "client-provided-tenant-id",
  "name": "田中太郎"
}
```

良い例:

```json
{
  "name": "田中太郎"
}
```

サーバー側で以下のように補完する。

```text
tenant_id = session.tenant_id
```

### 8.2 すべてのID参照にtenant条件を付ける

悪い例:

```sql
SELECT * FROM estimates WHERE id = :estimate_id;
```

良い例:

```sql
SELECT * FROM estimates
WHERE tenant_id = :tenant_id
  AND id = :estimate_id;
```

### 8.3 更新・削除もtenant条件を必須にする

```sql
UPDATE estimates
SET title = :title
WHERE tenant_id = :tenant_id
  AND id = :estimate_id;
```

```sql
DELETE FROM estimate_lines
WHERE tenant_id = :tenant_id
  AND id = :line_id;
```

## 9. ORM利用ルール

ORMを使う場合、全クエリで `tenant_id` 条件を手書きするだけでは漏れが起きやすい。  
以下のどちらかを必須とする。

- tenantスコープ付きRepositoryを作る
- DBのRLSを有効化する

### 9.1 Repository例

```ts
findEstimateById(session, estimateId) {
  return db.estimate.findFirst({
    where: {
      tenantId: session.tenantId,
      id: estimateId,
    },
  });
}
```

`findUnique({ id })` のようなtenant条件なしの取得は禁止する。

## 10. ファイル分離

音声、打ち合わせ録音、アップロードExcel、生成Excel、生成PDF、ロゴは `files` テーブルで管理し、必ず `tenant_id` を持つ。

ファイル本体はSupabase Storageに保存する。バケットは非公開を基本とし、ブラウザから直接公開URLで参照させない。アップロード、ダウンロード、削除はVercel APIで会社IDと権限を検証し、必要に応じて短時間の署名URLを発行する。

### 10.1 storage_key

ストレージキーには会社IDを含める。

```text
tenants/{tenant_id}/audio/{file_id}.webm
tenants/{tenant_id}/meeting-audio/{file_id}.webm
tenants/{tenant_id}/exports/{file_id}.xlsx
tenants/{tenant_id}/exports/{file_id}.pdf
tenants/{tenant_id}/logos/{file_id}.png
```

Supabase StorageのRLSまたは署名URL発行処理でも、上記パスの `{tenant_id}` と `files.tenant_id` が一致することを検証する。

### 10.2 署名URL発行

署名URLを発行する前に、必ず以下を検証する。

```text
files.tenant_id == session.tenant_id
```

検証できないファイルには署名URLを発行しない。

## 11. Worker・非同期ジョブの分離

AI解析、文字起こし、Excel取込、Excel/PDF出力は非同期Workerで実行される。  
Workerジョブにも必ず `tenant_id` を含める。

```json
{
  "tenant_id": "uuid",
  "job_type": "estimate_pdf_export",
  "estimate_id": "uuid"
}
```

Workerは処理開始時に以下を行う。

- job.tenant_id を取得する。
- Supabase Service Roleを使う場合でも、対象データを `tenant_id` 付きで再取得する。
- job内のIDだけを信用しない。

## 12. AI連携時の分離

AIへ送るデータも会社単位で分離する。

- 単価マスター候補は `tenant_id` で絞ったものだけを渡す。
- 他社の品目、見積、顧客情報、録音内容はAI入力に混ぜない。
- AI解析結果JSONにも `tenant_id` を持たせる。
- AI解析結果を見積へ反映する際も、同一 `tenant_id` の見積にしか反映できない。

## 13. 監査ログ

他社情報参照の疑いを追跡できるように、重要操作は監査ログに記録する。

対象操作:

- ログイン
- 顧客参照、作成、更新、削除
- 見積参照、作成、更新、削除
- 見積出力
- 単価マスター取込
- 音声アップロード
- 打ち合わせ録音
- ファイルダウンロードURL発行
- 権限変更

監査ログ項目:

```text
audit_logs
- id
- tenant_id
- user_id
- action
- target_table
- target_id
- ip_address
- user_agent
- result
- created_at
```

## 14. 禁止事項

- tenant_idなしの業務テーブルを作らない。
- tenant_idなしでID検索しない。
- クライアントから送られたtenant_idを信用しない。
- ファイルURLをDB検証なしに発行しない。
- AIやWorkerにtenant_idなしのジョブを渡さない。
- 管理者ユーザーであっても、他会社データを参照できる設計にしない。
- サポート用の横断管理者機能はMVPでは作らない。

## 15. 受入基準

- 会社Aのユーザーは会社Bの顧客を参照できない。
- 会社Aのユーザーは会社Bの見積IDをURLに直接入力しても参照できない。
- 会社Aのユーザーは会社Bの見積明細を更新・削除できない。
- 会社Aの見積に会社Bの顧客IDを紐づけられない。
- 会社Aの見積明細に会社Bの単価マスター品目を紐づけられない。
- 会社Aのユーザーは会社Bの音声、打ち合わせ録音、Excel、PDF、ロゴをダウンロードできない。
- Worker処理でも会社をまたいだデータ参照が発生しない。
- AI解析に他社の単価マスターや顧客情報が混入しない。

## 16. QA観点

テストでは、少なくとも会社Aと会社Bのデータを用意する。

### 16.1 参照テスト

- 会社Aユーザーでログインする。
- 会社Bの顧客IDをURLに直接指定する。
- 404または権限エラーになることを確認する。

### 16.2 更新テスト

- 会社Aユーザーで、会社Bの見積IDに対して更新APIを実行する。
- 更新されないことを確認する。

### 16.3 紐づけテスト

- 会社Aの見積作成時に、会社Bの顧客IDを指定する。
- DB制約またはAPIバリデーションで拒否されることを確認する。

### 16.4 ファイルテスト

- 会社Aユーザーで、会社BのPDFファイルIDに対して署名URL発行APIを実行する。
- 署名URLが発行されないことを確認する。

### 16.5 Workerテスト

- 会社Aの出力ジョブに会社Bの見積IDを混入させる。
- Workerが対象データを取得できず、ジョブ失敗または権限エラーになることを確認する。
