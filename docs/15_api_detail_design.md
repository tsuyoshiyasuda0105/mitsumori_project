# 音声AI見積作成システム API詳細仕様書

## 1. 文書情報

| 項目 | 内容 |
| --- | --- |
| 文書名 | 音声AI見積作成システム API詳細仕様書 |
| 版数 | v0.1 |
| 作成日 | 2026-06-02 |
| 対象フェーズ | MVP詳細設計 |
| 関連資料 | `requirements.md`, `docs/14_database_detail_design.md`, `docs/11_api_selection_design.md` |

## 2. 目的

本書は、音声AI見積作成システムのMVPで使用する自社アプリケーションAPIの詳細仕様を定義する。

対象は以下とする。

- 認証、ユーザー、会社設定
- 顧客マスター
- 単価マスター
- 単価マスターExcel取り込み
- 見積、見積明細、明細並び替え
- 音声入力、AI文字起こし、AI見積解析
- Excel/PDF出力
- ファイルダウンロードURL発行
- 打ち合わせ録音オプション

外部AI API、Google Sheets API、Microsoft Graph APIはブラウザから直接呼ばず、必ず本APIを経由する。

## 3. 共通仕様

### 3.1 ベースURL

```text
/api
```

MVPでは同一Webアプリ内のAPIとして提供する。将来的にAPIサーバーを分離しても、パス設計は維持する。

### 3.2 通信形式

| 項目 | 仕様 |
| --- | --- |
| 通信 | HTTPS |
| 通常リクエスト | `application/json` |
| ファイルアップロード | `multipart/form-data` |
| 通常レスポンス | `application/json` |
| 日時 | ISO 8601文字列 |
| ID | UUID文字列 |
| 金額 | 数値。小数2桁想定 |
| 数量 | 数値。小数3桁想定 |

### 3.3 認証

MVPではCookieベースのセッション認証を基本とする。

Cookie設定:

| 属性 | 値 |
| --- | --- |
| `HttpOnly` | true |
| `Secure` | 本番true |
| `SameSite` | `Lax` 以上 |

認証済みAPIは、サーバー側でセッションから以下を取得する。

```json
{
  "user_id": "uuid",
  "tenant_id": "uuid",
  "role": "admin",
  "permissions": {}
}
```

### 3.4 tenant_idの扱い

APIリクエストでは `tenant_id` を受け取らない。

禁止例:

```json
{
  "tenant_id": "client-provided-tenant-id",
  "name": "田中太郎"
}
```

サーバー側で必ずセッションから `tenant_id` を決定する。

```text
tenant_id = session.tenant_id
```

他会社のIDが指定された場合は、存在を悟らせないため原則 `404 Not Found` を返す。明確な権限不足の場合のみ `403 Forbidden` を返す。

### 3.5 共通レスポンス

成功時:

```json
{
  "data": {},
  "meta": {
    "request_id": "req_xxx"
  }
}
```

一覧取得時:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 120
  },
  "meta": {
    "request_id": "req_xxx"
  }
}
```

エラー時:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容を確認してください。",
    "details": [
      {
        "field": "name",
        "message": "顧客名は必須です。"
      }
    ]
  },
  "meta": {
    "request_id": "req_xxx"
  }
}
```

### 3.6 HTTPステータス

| ステータス | 用途 |
| --- | --- |
| 200 | 取得、更新成功 |
| 201 | 作成成功 |
| 202 | 非同期ジョブ受付 |
| 204 | 削除成功、レスポンス本文なし |
| 400 | 不正リクエスト |
| 401 | 未認証 |
| 403 | 権限不足、オプション未契約 |
| 404 | 対象なし、または他会社データ |
| 409 | 競合、重複 |
| 422 | バリデーションエラー |
| 500 | サーバーエラー |

### 3.7 共通エラーコード

| コード | 意味 |
| --- | --- |
| `UNAUTHENTICATED` | ログインが必要 |
| `FORBIDDEN` | 権限がない |
| `NOT_FOUND` | 対象が存在しない |
| `VALIDATION_ERROR` | 入力エラー |
| `CONFLICT` | 重複、状態競合 |
| `OPTION_NOT_ENABLED` | 別オプションが無効 |
| `FILE_TOO_LARGE` | ファイルサイズ超過 |
| `UNSUPPORTED_FILE_TYPE` | 未対応ファイル形式 |
| `JOB_FAILED` | 非同期ジョブ失敗 |
| `INTERNAL_ERROR` | 予期しないエラー |

### 3.8 ページング

一覧APIは原則以下のクエリを受け取る。

| パラメータ | 型 | 初期値 | 説明 |
| --- | --- | --- | --- |
| `page` | number | 1 | ページ番号 |
| `per_page` | number | 50 | 1ページ件数。最大100 |

### 3.9 監査ログ

以下の操作は監査ログに記録する。

- ログイン
- 顧客作成、更新、削除
- 単価マスター作成、更新、削除、Excel取り込み
- 見積作成、更新、削除
- AI解析実行、AI結果反映
- Excel/PDF出力
- ファイルダウンロードURL発行
- 打ち合わせ録音オプション操作
- ユーザー、権限変更

## 4. 認証API

### 4.1 ログイン

```text
POST /api/auth/login
```

権限: 未認証

リクエスト:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

レスポンス:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "山田太郎",
      "email": "user@example.com",
      "role": "admin",
      "permissions": {}
    },
    "company": {
      "id": "uuid",
      "name": "サンプル工務店",
      "feature_flags": {
        "meeting_recording_enabled": false
      }
    }
  }
}
```

処理:

- メールアドレスとパスワードを検証する。
- `users.status = active` であることを確認する。
- `tenants.status = active` であることを確認する。
- セッションを発行する。
- `last_login_at` を更新する。

### 4.2 ログアウト

```text
POST /api/auth/logout
```

権限: 認証済み

レスポンス:

```json
{
  "data": {
    "success": true
  }
}
```

### 4.3 パスワード再設定依頼

```text
POST /api/auth/password-reset/request
```

権限: 未認証

リクエスト:

```json
{
  "email": "user@example.com"
}
```

レスポンス:

```json
{
  "data": {
    "accepted": true
  }
}
```

注意:

- メールアドレスが存在しない場合でも同じレスポンスを返す。
- トークンはハッシュ化して保存する。

### 4.4 パスワード再設定確定

```text
POST /api/auth/password-reset/confirm
```

権限: 未認証

リクエスト:

```json
{
  "token": "reset-token",
  "new_password": "new-password"
}
```

レスポンス:

```json
{
  "data": {
    "success": true
  }
}
```

## 5. ユーザーAPI

### 5.1 ユーザー一覧

```text
GET /api/users
```

権限: 管理者

クエリ:

| パラメータ | 説明 |
| --- | --- |
| `q` | 氏名、メールアドレス検索 |
| `status` | `active`, `suspended` |
| `page` | ページ |
| `per_page` | 件数 |

レスポンス:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "山田太郎",
      "email": "user@example.com",
      "role": "admin",
      "permissions": {},
      "status": "active",
      "last_login_at": "2026-06-02T00:00:00+09:00"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 1
  }
}
```

### 5.2 ユーザー作成

```text
POST /api/users
```

権限: 管理者

リクエスト:

```json
{
  "name": "佐藤花子",
  "email": "sato@example.com",
  "role": "member",
  "permissions": {
    "price_items_manage": true,
    "price_items_import": true
  },
  "temporary_password": "temporary-password"
}
```

レスポンス: `201 Created`

```json
{
  "data": {
    "id": "uuid",
    "name": "佐藤花子",
    "email": "sato@example.com",
    "role": "member",
    "status": "active"
  }
}
```

### 5.3 ユーザー更新

```text
PATCH /api/users/{userId}
```

権限: 管理者

リクエスト:

```json
{
  "name": "佐藤花子",
  "role": "member",
  "permissions": {
    "price_items_manage": true
  },
  "status": "active"
}
```

レスポンス:

```json
{
  "data": {
    "id": "uuid",
    "name": "佐藤花子",
    "role": "member",
    "status": "active",
    "permissions": {
      "price_items_manage": true
    }
  }
}
```

## 6. 会社設定API

### 6.1 自社情報取得

```text
GET /api/company
```

権限: 認証済み

レスポンス:

```json
{
  "data": {
    "id": "uuid",
    "name": "サンプル工務店",
    "postal_code": "100-0001",
    "address": "東京都...",
    "phone": "03-0000-0000",
    "email": "info@example.com",
    "representative_name": "山田太郎",
    "invoice_registration_no": "T1234567890123",
    "bank_account_text": "〇〇銀行...",
    "default_note": "お支払い条件...",
    "logo_file_id": "uuid",
    "subscription_plan": "standard",
    "feature_flags": {
      "meeting_recording_enabled": false
    }
  }
}
```

### 6.2 自社情報更新

```text
PATCH /api/company
```

権限: 管理者

リクエスト:

```json
{
  "name": "サンプル工務店",
  "postal_code": "100-0001",
  "address": "東京都...",
  "phone": "03-0000-0000",
  "email": "info@example.com",
  "representative_name": "山田太郎",
  "invoice_registration_no": "T1234567890123",
  "bank_account_text": "〇〇銀行...",
  "default_note": "本見積の有効期限は..."
}
```

禁止:

- `subscription_plan` と `feature_flags` は通常の会社設定画面から更新しない。
- オプション有効化は運営管理または契約管理側で行う。

### 6.3 ロゴアップロード

```text
POST /api/company/logo
```

権限: 管理者

形式: `multipart/form-data`

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `file` | file | YES | PNG/JPEG |

レスポンス:

```json
{
  "data": {
    "file_id": "uuid",
    "logo_file_id": "uuid"
  }
}
```

## 7. 顧客API

### 7.1 顧客一覧

```text
GET /api/customers
```

権限: 認証済み

クエリ:

| パラメータ | 説明 |
| --- | --- |
| `q` | 顧客名、カナ、電話番号検索 |
| `page` | ページ |
| `per_page` | 件数 |

レスポンス:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "田中太郎",
      "name_kana": "タナカタロウ",
      "phone": "090-0000-0000",
      "email": "tanaka@example.com",
      "contact_name": "田中様",
      "updated_at": "2026-06-02T00:00:00+09:00"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 1
  }
}
```

### 7.2 顧客作成

```text
POST /api/customers
```

権限: 認証済み

リクエスト:

```json
{
  "name": "田中太郎",
  "name_kana": "タナカタロウ",
  "postal_code": "100-0001",
  "address": "東京都...",
  "phone": "090-0000-0000",
  "email": "tanaka@example.com",
  "contact_name": "田中様",
  "note": "午前中連絡希望"
}
```

レスポンス: `201 Created`

```json
{
  "data": {
    "id": "uuid",
    "name": "田中太郎"
  }
}
```

### 7.3 顧客詳細

```text
GET /api/customers/{customerId}
```

権限: 認証済み

レスポンス:

```json
{
  "data": {
    "id": "uuid",
    "name": "田中太郎",
    "name_kana": "タナカタロウ",
    "postal_code": "100-0001",
    "address": "東京都...",
    "phone": "090-0000-0000",
    "email": "tanaka@example.com",
    "contact_name": "田中様",
    "note": "午前中連絡希望",
    "recent_estimates": [
      {
        "id": "uuid",
        "estimate_no": "EST-2026-0001",
        "title": "外壁塗装工事",
        "status": "draft",
        "total_amount": 120000
      }
    ]
  }
}
```

### 7.4 顧客更新

```text
PATCH /api/customers/{customerId}
```

権限: 認証済み

リクエストは顧客作成と同じ項目の部分更新。

### 7.5 顧客削除

```text
DELETE /api/customers/{customerId}
```

権限: 認証済み

処理:

- `deleted_at` を設定する。
- 既存見積がある場合も履歴保持のため物理削除しない。

レスポンス: `204 No Content`

## 8. 単価マスターAPI

### 8.1 単価マスター一覧

```text
GET /api/price-items
```

権限: 認証済み

クエリ:

| パラメータ | 説明 |
| --- | --- |
| `q` | 品目名検索 |
| `unit` | 単位 |
| `is_active` | `true` / `false` |
| `page` | ページ |
| `per_page` | 件数 |

レスポンス:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "外壁塗装",
      "unit": "m2",
      "unit_price": 2500,
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 1
  }
}
```

### 8.2 単価マスター作成

```text
POST /api/price-items
```

権限: 管理者または `price_items_manage`

リクエスト:

```json
{
  "name": "外壁塗装",
  "unit": "m2",
  "unit_price": 2500,
  "is_active": true
}
```

レスポンス: `201 Created`

```json
{
  "data": {
    "id": "uuid",
    "name": "外壁塗装",
    "unit": "m2",
    "unit_price": 2500,
    "is_active": true
  }
}
```

### 8.3 単価マスター更新

```text
PATCH /api/price-items/{itemId}
```

権限: 管理者または `price_items_manage`

リクエスト:

```json
{
  "name": "外壁塗装",
  "unit": "m2",
  "unit_price": 2600,
  "is_active": true
}
```

注意:

- 既存見積明細の単価は自動変更しない。
- 見積明細には選択時点の単価をスナップショットとして保持する。

### 8.4 単価マスター削除

```text
DELETE /api/price-items/{itemId}
```

権限: 管理者または `price_items_manage`

処理:

- 物理削除ではなく、原則 `is_active=false` または `deleted_at` を設定する。

レスポンス: `204 No Content`

## 9. 単価マスターExcel取り込みAPI

### 9.1 Excelアップロード

```text
POST /api/price-items/imports
```

権限: 管理者または `price_items_import`

形式: `multipart/form-data`

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `file` | file | YES | `.xlsx` |

レスポンス: `202 Accepted`

```json
{
  "data": {
    "job_id": "uuid",
    "status": "uploaded",
    "file_id": "uuid",
    "detected_columns": [
      "品目",
      "単位",
      "単価"
    ],
    "suggested_mapping": {
      "name": "品目",
      "unit": "単位",
      "unit_price": "単価"
    }
  }
}
```

### 9.2 列マッピング更新

```text
PATCH /api/price-items/imports/{jobId}/mapping
```

権限: 管理者または `price_items_import`

リクエスト:

```json
{
  "mapping": {
    "name": "品目",
    "unit": "単位",
    "unit_price": "単価"
  },
  "start_row": 2
}
```

レスポンス:

```json
{
  "data": {
    "job_id": "uuid",
    "status": "mapped",
    "mapping": {
      "name": "品目",
      "unit": "単位",
      "unit_price": "単価"
    }
  }
}
```

### 9.3 取り込みプレビュー

```text
POST /api/price-items/imports/{jobId}/preview
```

権限: 管理者または `price_items_import`

レスポンス:

```json
{
  "data": {
    "job_id": "uuid",
    "status": "validated",
    "summary": {
      "total_rows": 120,
      "valid_rows": 110,
      "warning_rows": 8,
      "error_rows": 2
    },
    "rows": [
      {
        "row_no": 2,
        "name": "外壁塗装",
        "unit": "m2",
        "unit_price": 2500,
        "status": "valid",
        "messages": []
      },
      {
        "row_no": 3,
        "name": "",
        "unit": "式",
        "unit_price": 10000,
        "status": "error",
        "messages": [
          "品目は必須です。"
        ]
      }
    ]
  }
}
```

### 9.4 取り込み実行

```text
POST /api/price-items/imports/{jobId}/execute
```

権限: 管理者または `price_items_import`

リクエスト:

```json
{
  "mode": "upsert",
  "target_row_numbers": [2, 4, 5]
}
```

| `mode` | 内容 |
| --- | --- |
| `insert` | 新規追加のみ |
| `upsert` | 同一品目・単位があれば更新 |

レスポンス:

```json
{
  "data": {
    "job_id": "uuid",
    "status": "imported",
    "result": {
      "created": 80,
      "updated": 30,
      "skipped": 8,
      "failed": 2
    }
  }
}
```

## 10. 見積API

### 10.1 見積一覧

```text
GET /api/estimates
```

権限: 認証済み

クエリ:

| パラメータ | 説明 |
| --- | --- |
| `q` | 見積番号、件名、顧客名検索 |
| `customer_id` | 顧客ID |
| `status` | ステータス |
| `date_from` | 見積日From |
| `date_to` | 見積日To |
| `page` | ページ |
| `per_page` | 件数 |

レスポンス:

```json
{
  "data": [
    {
      "id": "uuid",
      "estimate_no": "EST-2026-0001",
      "customer": {
        "id": "uuid",
        "name": "田中太郎"
      },
      "title": "外壁塗装工事",
      "estimate_date": "2026-06-02",
      "status": "draft",
      "total_amount": 120000,
      "updated_at": "2026-06-02T00:00:00+09:00"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 1
  }
}
```

### 10.2 見積作成

```text
POST /api/estimates
```

権限: 認証済み

リクエスト:

```json
{
  "customer_id": "uuid",
  "title": "外壁塗装工事",
  "estimate_date": "2026-06-02",
  "expires_on": "2026-07-02",
  "customer_note": "外壁塗装工事一式のお見積りです。",
  "internal_vendor_instruction": "搬入経路に注意"
}
```

レスポンス: `201 Created`

```json
{
  "data": {
    "id": "uuid",
    "estimate_no": "EST-2026-0001",
    "status": "draft"
  }
}
```

処理:

- `estimate_no` は会社単位で採番する。
- `customer_id` が指定された場合、同一会社の顧客のみ許可する。

### 10.3 見積詳細

```text
GET /api/estimates/{estimateId}
```

権限: 認証済み

レスポンス:

```json
{
  "data": {
    "id": "uuid",
    "estimate_no": "EST-2026-0001",
    "customer": {
      "id": "uuid",
      "name": "田中太郎"
    },
    "title": "外壁塗装工事",
    "estimate_date": "2026-06-02",
    "expires_on": "2026-07-02",
    "status": "draft",
    "subtotal_amount": 100000,
    "tax_amount": 10000,
    "total_amount": 110000,
    "customer_note": "外壁塗装工事一式のお見積りです。",
    "internal_vendor_instruction": "搬入経路に注意",
    "lines": [
      {
        "id": "uuid",
        "line_no": 1,
        "price_item_id": "uuid",
        "location": "外壁",
        "item_name": "外壁塗装",
        "description": "下塗り・上塗り",
        "quantity": 120,
        "unit": "m2",
        "unit_price": 2500,
        "amount": 300000,
        "line_type": "normal",
        "customer_note": null,
        "internal_vendor_instruction": "飛散養生注意"
      }
    ]
  }
}
```

注意:

- 見積編集画面用APIのため、内部情報である `internal_vendor_instruction` を含める。
- 顧客提出用PDF APIではこの情報を含めない。

### 10.4 見積更新

```text
PATCH /api/estimates/{estimateId}
```

権限: 認証済み

リクエスト:

```json
{
  "customer_id": "uuid",
  "title": "外壁塗装工事",
  "estimate_date": "2026-06-02",
  "expires_on": "2026-07-02",
  "status": "draft",
  "customer_note": "顧客向け備考",
  "internal_vendor_instruction": "業者指示事項"
}
```

レスポンス:

```json
{
  "data": {
    "id": "uuid",
    "updated_at": "2026-06-02T00:00:00+09:00"
  }
}
```

### 10.5 見積削除

```text
DELETE /api/estimates/{estimateId}
```

権限: 管理者

処理:

- `deleted_at` を設定する。
- 関連明細は履歴保持のため残す。

レスポンス: `204 No Content`

### 10.6 見積複製

```text
POST /api/estimates/{estimateId}/duplicate
```

権限: 認証済み

リクエスト:

```json
{
  "title": "外壁塗装工事 コピー"
}
```

レスポンス: `201 Created`

```json
{
  "data": {
    "id": "uuid",
    "estimate_no": "EST-2026-0002"
  }
}
```

### 10.7 修正見積作成

```text
POST /api/estimates/{estimateId}/revision
```

権限: 認証済み

リクエスト:

```json
{
  "title": "外壁塗装工事 修正版"
}
```

レスポンス: `201 Created`

```json
{
  "data": {
    "id": "uuid",
    "estimate_no": "EST-2026-0003"
  }
}
```

## 11. 見積明細API

### 11.1 明細追加

```text
POST /api/estimates/{estimateId}/lines
```

権限: 認証済み

リクエスト:

```json
{
  "price_item_id": "uuid",
  "location": "外壁",
  "item_name": "外壁塗装",
  "description": "下塗り・上塗り",
  "quantity": 120,
  "unit": "m2",
  "unit_price": 2500,
  "line_type": "normal",
  "customer_note": null,
  "internal_vendor_instruction": "飛散養生注意"
}
```

レスポンス: `201 Created`

```json
{
  "data": {
    "id": "uuid",
    "line_no": 1,
    "amount": 300000,
    "estimate_totals": {
      "subtotal_amount": 300000,
      "tax_amount": 30000,
      "total_amount": 330000
    }
  }
}
```

処理:

- `price_item_id` が指定された場合、同一会社の単価マスターのみ許可する。
- `amount` はサーバー側で計算する。
- 追加後に見積合計を再計算する。

### 11.2 明細更新

```text
PATCH /api/estimates/{estimateId}/lines/{lineId}
```

権限: 認証済み

リクエスト:

```json
{
  "price_item_id": "uuid",
  "location": "外壁",
  "item_name": "外壁塗装",
  "description": "下塗り・上塗り",
  "quantity": 120,
  "unit": "m2",
  "unit_price": 2600,
  "line_type": "normal",
  "customer_note": null,
  "internal_vendor_instruction": "飛散養生注意"
}
```

レスポンス:

```json
{
  "data": {
    "id": "uuid",
    "amount": 312000,
    "estimate_totals": {
      "subtotal_amount": 312000,
      "tax_amount": 31200,
      "total_amount": 343200
    }
  }
}
```

### 11.3 明細削除

```text
DELETE /api/estimates/{estimateId}/lines/{lineId}
```

権限: 認証済み

レスポンス:

```json
{
  "data": {
    "estimate_totals": {
      "subtotal_amount": 0,
      "tax_amount": 0,
      "total_amount": 0
    }
  }
}
```

### 11.4 明細並び替え

```text
PATCH /api/estimates/{estimateId}/lines/reorder
```

権限: 認証済み

リクエスト:

```json
{
  "line_ids": [
    "uuid-line-1",
    "uuid-line-2",
    "uuid-line-3"
  ]
}
```

レスポンス:

```json
{
  "data": {
    "lines": [
      {
        "id": "uuid-line-1",
        "line_no": 1
      },
      {
        "id": "uuid-line-2",
        "line_no": 2
      }
    ]
  }
}
```

バリデーション:

- 指定された明細IDはすべて同一見積に属すること。
- 同一明細IDの重複指定はエラー。
- 見積内の全明細を指定することを基本とする。

## 12. 音声入力・AI解析API

### 12.1 音声アップロード

```text
POST /api/ai/audio
```

権限: 認証済み

形式: `multipart/form-data`

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `file` | file | YES | 音声ファイル |
| `customer_id` | uuid | NO | 顧客ID |
| `estimate_id` | uuid | NO | 見積ID |
| `purpose` | string | YES | `estimate_line_input` |

レスポンス: `202 Accepted`

```json
{
  "data": {
    "analysis_id": "uuid",
    "file_id": "uuid",
    "status": "queued"
  }
}
```

処理:

- 音声ファイルを `files.kind = audio` として保存する。
- `ai_analysis_runs` を作成する。
- 文字起こしジョブをWorkerへ投入する。

### 12.2 文字起こし結果確認

```text
POST /api/ai/transcriptions/{analysisId}/confirm
```

権限: 認証済み

リクエスト:

```json
{
  "normalized_text": "外壁が120平米、足場と高圧洗浄も入れてください。"
}
```

レスポンス:

```json
{
  "data": {
    "analysis_id": "uuid",
    "status": "confirmed",
    "normalized_text": "外壁が120平米、足場と高圧洗浄も入れてください。"
  }
}
```

### 12.3 見積解析ジョブ作成

```text
POST /api/ai/estimate-analysis
```

権限: 認証済み

リクエスト:

```json
{
  "analysis_id": "uuid",
  "estimate_id": "uuid",
  "text": "外壁が120平米、足場と高圧洗浄も入れてください。"
}
```

レスポンス: `202 Accepted`

```json
{
  "data": {
    "analysis_id": "uuid",
    "status": "processing"
  }
}
```

処理:

- 同一会社の単価マスター候補のみAI入力または照合対象にする。
- AI結果は `extraction_json` に保存する。
- 見積へはまだ反映しない。

### 12.4 AI解析結果取得

```text
GET /api/ai/analysis-runs/{analysisId}
```

権限: 認証済み

レスポンス:

```json
{
  "data": {
    "id": "uuid",
    "status": "completed",
    "input_type": "audio",
    "transcript_text": "外壁が120平米...",
    "normalized_text": "外壁が120平米...",
    "extraction": {
      "schema_version": "1.0",
      "summary": "外壁塗装の見積候補",
      "line_candidates": [
        {
          "source_text": "外壁が120平米",
          "location": "外壁",
          "work_name": "外壁塗装",
          "quantity": 120,
          "unit": "m2",
          "matched_price_item_candidates": [
            {
              "price_item_id": "uuid",
              "name": "外壁塗装",
              "unit": "m2",
              "unit_price": 2500,
              "confidence": 0.86
            }
          ],
          "confidence": 0.8,
          "needs_user_confirmation": false
        }
      ],
      "missing_information": [],
      "internal_vendor_instruction_candidates": []
    }
  }
}
```

### 12.5 AI結果の見積反映

```text
POST /api/ai/analysis-runs/{analysisId}/apply
```

権限: 認証済み

リクエスト:

```json
{
  "estimate_id": "uuid",
  "line_candidates": [
    {
      "client_candidate_id": "cand-1",
      "price_item_id": "uuid",
      "location": "外壁",
      "item_name": "外壁塗装",
      "description": "下塗り・上塗り",
      "quantity": 120,
      "unit": "m2",
      "unit_price": 2500,
      "customer_note": null,
      "internal_vendor_instruction": "飛散養生注意"
    }
  ],
  "customer_note": "外壁塗装工事一式のお見積りです。",
  "internal_vendor_instruction": "駐車場側の養生を確認"
}
```

レスポンス:

```json
{
  "data": {
    "estimate_id": "uuid",
    "created_line_ids": [
      "uuid"
    ],
    "estimate_totals": {
      "subtotal_amount": 300000,
      "tax_amount": 30000,
      "total_amount": 330000
    }
  }
}
```

重要ルール:

- AI結果はこのAPIが呼ばれるまで見積に反映しない。
- `price_item_id` は同一会社の単価マスターのみ許可する。
- 金額はサーバー側で再計算する。

## 13. 帳票出力API

### 13.1 Excel出力ジョブ作成

```text
POST /api/estimates/{estimateId}/exports/excel
```

権限: 認証済み

リクエスト:

```json
{
  "export_mode": "internal"
}
```

| `export_mode` | 説明 |
| --- | --- |
| `customer` | 顧客提出用。業者指示事項を含めない |
| `internal` | 社内確認用。業者指示事項を含められる |
| `vendor_instruction` | 協力業者指示用 |

レスポンス: `202 Accepted`

```json
{
  "data": {
    "job_id": "uuid",
    "status": "queued"
  }
}
```

### 13.2 PDF出力ジョブ作成

```text
POST /api/estimates/{estimateId}/exports/pdf
```

権限: 認証済み

リクエスト:

```json
{
  "export_mode": "customer"
}
```

レスポンス: `202 Accepted`

```json
{
  "data": {
    "job_id": "uuid",
    "status": "queued"
  }
}
```

重要ルール:

- PDFは顧客提出用を基本とする。
- PDF DTOには業者指示事項を含めない。
- クライアントからPDF本文データを受け取らない。
- サーバー側でDBから顧客提出用DTOを生成する。

### 13.3 出力ジョブ状態取得

```text
GET /api/export-jobs/{jobId}
```

権限: 認証済み

レスポンス:

```json
{
  "data": {
    "id": "uuid",
    "estimate_id": "uuid",
    "export_type": "excel",
    "export_mode": "internal",
    "status": "completed",
    "output_file_id": "uuid",
    "error_message": null
  }
}
```

### 13.4 ダウンロードURL発行

```text
GET /api/files/{fileId}/download-url
```

権限: 認証済み

レスポンス:

```json
{
  "data": {
    "file_id": "uuid",
    "download_url": "https://signed-url.example.com/...",
    "expires_at": "2026-06-02T00:10:00+09:00"
  }
}
```

重要ルール:

- `files.tenant_id == session.tenant_id` を検証する。
- 署名URLは短時間有効にする。
- 監査ログに記録する。

## 14. 打ち合わせ録音オプションAPI

打ち合わせ録音はMVP本体ではなく別オプションである。以下のAPIは `meeting_recording_enabled = true` の会社のみ利用できる。

オプション無効時:

```json
{
  "error": {
    "code": "OPTION_NOT_ENABLED",
    "message": "打ち合わせ録音オプションが有効ではありません。"
  }
}
```

### 14.1 打ち合わせ録音作成

```text
POST /api/meeting-recordings
```

権限: 認証済み、オプション有効

形式: `multipart/form-data`

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `file` | file | YES | 音声ファイル |
| `customer_id` | uuid | NO | 顧客ID |
| `estimate_id` | uuid | NO | 見積ID |
| `consent_confirmed` | boolean | YES | 録音同意確認 |

レスポンス: `202 Accepted`

```json
{
  "data": {
    "recording_id": "uuid",
    "file_id": "uuid",
    "status": "recorded"
  }
}
```

バリデーション:

- `consent_confirmed = true` でなければ録音を受け付けない。
- `customer_id`, `estimate_id` は同一会社のものだけ許可する。

### 14.2 打ち合わせ録音詳細

```text
GET /api/meeting-recordings/{recordingId}
```

権限: 認証済み、オプション有効

レスポンス:

```json
{
  "data": {
    "id": "uuid",
    "customer_id": "uuid",
    "estimate_id": "uuid",
    "sales_user_id": "uuid",
    "recorded_at": "2026-06-02T00:00:00+09:00",
    "consent_confirmed": true,
    "transcript_text": "本日の打ち合わせでは...",
    "summary": "外壁塗装の希望あり...",
    "customer_requests": [],
    "confirmation_items": [],
    "estimate_apply_candidates": [],
    "status": "summarized"
  }
}
```

### 14.3 打ち合わせ録音更新

```text
PATCH /api/meeting-recordings/{recordingId}
```

権限: 認証済み、オプション有効

リクエスト:

```json
{
  "transcript_text": "修正後の文字起こし",
  "summary": "要点メモ"
}
```

### 14.4 打ち合わせ要約

```text
POST /api/meeting-recordings/{recordingId}/summarize
```

権限: 認証済み、オプション有効

レスポンス: `202 Accepted`

```json
{
  "data": {
    "recording_id": "uuid",
    "status": "processing"
  }
}
```

### 14.5 打ち合わせ内容の見積反映

```text
POST /api/meeting-recordings/{recordingId}/apply
```

権限: 認証済み、オプション有効

リクエスト:

```json
{
  "estimate_id": "uuid",
  "apply_candidate_ids": [
    "candidate-1"
  ]
}
```

レスポンス:

```json
{
  "data": {
    "estimate_id": "uuid",
    "applied": true
  }
}
```

重要ルール:

- ユーザーが採用するまで見積には反映しない。
- 顧客提出用PDFには打ち合わせ録音内容を出力しない。

## 15. ファイル制限

| 種別 | 拡張子 | 上限目安 | 備考 |
| --- | --- | --- | --- |
| 明細入力音声 | `webm`, `wav`, `m4a`, `mp3` | 25MB | MVPでは短時間録音を想定 |
| ロゴ | `png`, `jpg`, `jpeg` | 5MB | 帳票用 |
| 単価マスターExcel | `xlsx` | 20MB | `.xls` は対象外 |
| 生成Excel | `xlsx` | 生成物 | サーバー生成 |
| 生成PDF | `pdf` | 生成物 | サーバー生成 |
| 打ち合わせ録音 | `webm`, `wav`, `m4a`, `mp3` | プラン設定 | 別オプション |

## 16. セキュリティ詳細

### 16.1 tenant分離

すべてのAPIで以下を行う。

1. セッションから `tenant_id` を取得する。
2. DB接続に `SET LOCAL app.tenant_id` を設定する。
3. 取得、更新、削除の条件に `tenant_id` を含める。
4. ID指定されたデータが他会社のものなら `404` とする。

### 16.2 内部情報の出力制御

以下は顧客提出用PDFに含めない。

- 見積全体の業者指示事項
- 明細単位の業者指示事項
- 打ち合わせ録音
- AI解析の内部メモ
- 監査ログ

### 16.3 AI API連携

- OpenAI APIキーはサーバー/Workerだけで保持する。
- ブラウザに外部APIキーを渡さない。
- AIへ送る単価マスター候補は同一会社のものだけに限定する。
- AI解析結果は候補であり、ユーザー確認前に見積へ反映しない。

## 17. 非同期ジョブ仕様

非同期処理:

- 音声文字起こし
- AI見積解析
- 単価マスターExcelプレビュー
- 単価マスターExcel取り込み
- Excel出力
- PDF出力
- 打ち合わせ録音要約

ジョブ投入時の共通ペイロード:

```json
{
  "tenant_id": "uuid",
  "user_id": "uuid",
  "job_id": "uuid",
  "job_type": "estimate_pdf_export"
}
```

Workerはジョブ内のIDだけを信用せず、DBから `tenant_id` 付きで再取得する。

## 18. API受入基準

- クライアントが `tenant_id` を送らなくても全APIが動作する。
- クライアントが `tenant_id` を送っても無視またはエラーにする。
- 他会社のIDを指定しても参照、更新、削除できない。
- 会社Aの見積に会社Bの顧客、単価マスター、ファイルを紐づけられない。
- 顧客提出用PDF出力APIに業者指示事項を送っても使用されない。
- AI解析結果はユーザーがapplyするまで見積へ反映されない。
- 打ち合わせ録音オプション無効時は、関連APIが利用できない。
- ファイルダウンロードURLは所有会社チェック後にのみ発行される。

## 19. 今後の検討事項

| No | 項目 | 内容 |
| --- | --- | --- |
| 1 | OpenAPI化 | 本仕様をOpenAPI YAMLへ変換し、型生成に利用する |
| 2 | APIバージョニング | `/api/v1` を明示するか検討する |
| 3 | 楽観ロック | `updated_at` または `version` による競合検知を追加するか検討する |
| 4 | 税率API | 税率を固定値ではなく設定値として管理するか検討する |
| 5 | 帳票テンプレートAPI | 独自Excelテンプレート対応時に追加する |
| 6 | Google Sheets連携API | 第2段階で追加する |

