# 見積DB保存API セットアップメモ

## 実装済みのこと

- `GET /api/estimates`
  - `DATABASE_URL` がある場合: Neon Postgresから見積一覧を取得する。
  - `DATABASE_URL` がない場合: `mode: "local"` を返し、画面側はブラウザ保存へフォールバックする。

- `POST /api/estimates`
  - `DATABASE_URL` がある場合: 見積ヘッダと見積明細をNeon Postgresへ保存する。
  - `DATABASE_URL` がない場合: 画面側はブラウザ保存へフォールバックする。

- 初回DB接続時に、デモ用の会社・ユーザー・顧客・単価マスターを自動同期する。
- 単価マスターは `external_item_code` に `p-001` などの画面側IDを保持する。
- 顧客は `external_customer_code` に `c-001` などの画面側IDを保持する。

## Neonで必要な作業

1. Neonプロジェクトを作成する。
2. SQL Editorで以下を実行する。

```text
neon/migrations/202606020001_core_schema.sql
```

3. Neonの接続文字列を取得する。

```text
DATABASE_URL=postgresql://...
```

4. Vercel Project Settings の Environment Variables に `DATABASE_URL` を追加する。

任意で固定tenantを使う場合のみ、以下も追加する。

```text
MITSUMORI_TENANT_ID=<tenants.idのUUID>
```

未設定の場合は、API初回実行時に `〇〇株式会社` のtenantを自動作成または再利用する。

## 動作確認

DB未設定時:

```bash
curl https://<domain>/api/estimates
```

期待値:

```json
{
  "data": null,
  "mode": "local",
  "error": {
    "code": "DATABASE_NOT_CONFIGURED"
  }
}
```

DB設定後:

```bash
curl https://<domain>/api/estimates
```

期待値:

```json
{
  "data": [],
  "mode": "database"
}
```

画面では `/estimates` の保存機能欄が `Neon DBに n 件保存済み` に変わる。

## 注意

- 認証はまだ本実装ではないため、現在はデモユーザー `山田 涼` とデモtenantで保存する。
- 本番の複数会社運用に入る前に、Auth.js / Clerk / Neon Auth のいずれかでログインセッションから `tenant_id` を決定する実装へ差し替える。
- 音声ファイル、Excel、PDFの実体保存はDBではなくVercel Blob想定。