# 音声AI見積作成システム AI解析JSONスキーマ詳細設計書

## 1. 文書情報

| 項目 | 内容 |
| --- | --- |
| 文書名 | 音声AI見積作成システム AI解析JSONスキーマ詳細設計書 |
| 版数 | v0.1 |
| 作成日 | 2026-06-02 |
| 対象フェーズ | MVP詳細設計 |
| 関連資料 | `requirements.md`, `docs/11_api_selection_design.md`, `docs/15_api_detail_design.md` |

## 2. 目的

本書は、音声入力またはテキスト入力からAIが返す見積解析JSONの構造、意味、検証ルール、利用ルールを定義する。

AI解析結果はあくまで候補であり、ユーザーが確認・採用するまで見積データには反映しない。

## 3. 対象範囲

MVPの対象:

- 音声文字起こし後のテキスト解析
- 見積明細候補の抽出
- 単価マスター候補の推測
- 不足情報、確認事項の抽出
- 明細単位の備考候補の抽出
- 業者指示事項候補の抽出

対象外:

- 顧客情報、現場住所、見積件名、見積日、有効期限、担当者などのヘッダー情報入力
- 顧客向け備考など見積ヘッダー領域の文案生成
- 明細単位の単位判断
- 最終金額の確定
- 法的判断
- 契約条件の確定
- 顧客への自動送信
- 他会社データを使った推測
- 打ち合わせ録音オプションの長時間会話要約

## 4. 基本方針

- AI出力はJSON Schemaに準拠させる。
- スキーマは `schema_version` でバージョン管理する。
- AIは単価マスター品目候補を提示するが、最終採用はユーザーが行う。
- 明細の単位と単価は、ユーザーが選択した単価マスターから取得する。AIは単位を判断しない。
- 金額はサーバー側で再計算する。
- 業者指示事項は内部情報として扱い、顧客提出用PDFには渡さない。
- AIが不明な情報を推測で埋めない。不足情報は `missing_information` に出す。
- `tenant_id` はAIへ渡さず、サーバー側で管理する。
- 顧客情報、見積件名、見積日、有効期限、担当者などのヘッダー情報はAI出力に含めない。

## 5. 処理フロー

```mermaid
flowchart TD
  Audio["音声入力"] --> STT["文字起こし"]
  Text["テキスト入力"] --> Normalize["ユーザー確認・修正"]
  STT --> Normalize
  Normalize --> AI["AI構造化解析"]
  AI --> ServerValidate["サーバー検証"]
  ServerValidate --> PriceMatch["単価マスター再照合"]
  PriceMatch --> Review["AI解析結果確認画面"]
  Review --> Apply["ユーザー採用"]
  Apply --> Estimate["見積へ反映"]
```

## 6. トップレベル構造

AIは以下のトップレベルJSONを返す。

```json
{
  "schema_version": "1.1",
  "language": "ja",
  "summary": "外壁塗装の見積候補です。",
  "source_quality": {
    "transcript_confidence": 0.82,
    "has_noise": false,
    "ambiguous_phrases": []
  },
  "line_candidates": [],
  "missing_information": [],
  "internal_vendor_instruction_candidates": [],
  "assumptions": [],
  "warnings": []
}
```

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `schema_version` | string | YES | スキーマバージョン。MVPは `1.1` |
| `language` | string | YES | 言語。日本語は `ja` |
| `summary` | string | YES | 入力内容の短い要約 |
| `source_quality` | object | YES | 入力音声またはテキストの品質情報 |
| `line_candidates` | array | YES | 見積明細候補 |
| `missing_information` | array | YES | 不足情報、確認事項 |
| `internal_vendor_instruction_candidates` | array | YES | 業者指示事項候補 |
| `assumptions` | array | YES | AIが置いた仮定 |
| `warnings` | array | YES | 注意事項 |

## 7. source_quality

```json
{
  "transcript_confidence": 0.82,
  "has_noise": false,
  "ambiguous_phrases": [
    "百二十平米か百二十坪か不明"
  ]
}
```

| フィールド | 型 | 範囲 | 説明 |
| --- | --- | --- | --- |
| `transcript_confidence` | number/null | 0.0-1.0 | 文字起こし全体の信頼度 |
| `has_noise` | boolean |  | 雑音、聞き取り困難があるか |
| `ambiguous_phrases` | string[] |  | 曖昧な発話 |

UI表示:

- `has_noise = true` の場合、確認画面に「聞き取り不確実」バッジを表示する。
- `ambiguous_phrases` がある場合、確認事項に表示する。

## 8. ヘッダー情報の扱い

AIは顧客情報や見積ヘッダー情報を入力しない。

AI出力に含めない項目:

- 顧客名
- 顧客住所
- 顧客電話番号
- 顧客メールアドレス
- 顧客担当者名
- 現場住所
- 見積件名
- 見積日
- 有効期限
- 担当者
- 見積ステータス
- 顧客向け備考
- 見積全体の業者指示事項

これらは、見積編集画面でユーザーが選択または入力する。AI解析結果確認画面では、ヘッダー情報の候補を表示しない。

## 9. 明細単位の扱い

AIは明細の単位を判断しない。

単位の決定ルール:

- 単位は、ユーザーが選択した単価マスター品目に紐づく `unit` を使用する。
- AIの明細候補には `unit` を含めない。
- AIは「m2」「式」「個」などを発話から推測して明細単位として返さない。
- 単価マスター候補の中に表示される `unit` は、DBの単価マスターに登録された値であり、AIが判断した値ではない。
- 単価マスター候補が選べない場合は、ユーザーが単価マスターを選択または登録する。

## 10. line_candidates

見積明細候補を配列で返す。

```json
[
  {
    "candidate_id": "cand-001",
    "source_text": "外壁が120平米くらい",
    "location": "外壁",
    "item_name": "外壁塗装",
    "description": "外壁塗装 下塗り・上塗り",
    "quantity": 120,
    "line_type": "normal",
    "matched_price_item_candidates": [],
    "customer_note": null,
    "internal_vendor_instruction": null,
    "confidence": 0.8,
    "needs_user_confirmation": false,
    "confirmation_reason": null
  }
]
```

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `candidate_id` | string | YES | 候補ID。AIレスポンス内で一意 |
| `source_text` | string | YES | 根拠となる発話 |
| `location` | string/null | YES | 場所 |
| `item_name` | string | YES | 品目名候補 |
| `description` | string/null | YES | 明細説明 |
| `quantity` | number/null | YES | 数量 |
| `line_type` | string | YES | `normal`, `discount`, `expense`, `note` |
| `matched_price_item_candidates` | array | YES | 単価マスター候補 |
| `customer_note` | string/null | YES | 顧客向け明細備考 |
| `internal_vendor_instruction` | string/null | YES | 明細単位の業者指示事項候補 |
| `confidence` | number | YES | 明細候補の信頼度 |
| `needs_user_confirmation` | boolean | YES | ユーザー確認が必要か |
| `confirmation_reason` | string/null | YES | 確認が必要な理由 |

### 10.1 line_type

| 値 | 意味 |
| --- | --- |
| `normal` | 通常明細 |
| `discount` | 値引き |
| `expense` | 諸経費 |
| `note` | 金額なし注記 |

### 10.2 数量ルール

- 数量が聞き取れない場合は `quantity = null`。
- 「一式」と発話された場合も、AIは単位を返さない。数量を `1` とするかどうかは候補として扱い、ユーザー確認対象にする。
- 坪、平米、m2など単位に関わる表現は、明細単位として確定せず、必要に応じて `source_text` または `missing_information` に残す。
- 単位変換が必要な場合は勝手に変換せず、`missing_information` に出す。

## 11. matched_price_item_candidates

単価マスター候補を返す。

```json
[
  {
    "price_item_id": "uuid",
    "name": "外壁塗装",
    "unit": "m2",
    "unit_price": 2500,
    "match_reason": "品目名が近い。単位と単価は単価マスターの値",
    "confidence": 0.86
  }
]
```

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `price_item_id` | string | YES | 単価マスターID |
| `name` | string | YES | 品目名 |
| `unit` | string | YES | 単価マスターに登録された単位。AI判断値ではない |
| `unit_price` | number | YES | 単価マスターに登録された単価 |
| `match_reason` | string | YES | 候補理由 |
| `confidence` | number | YES | 候補信頼度 |

重要ルール:

- AIに渡す単価候補は、必ず同一会社の単価マスターに限定する。
- AIが返した `price_item_id` はサーバー側で再検証する。
- `price_item_id` が存在しない、他会社、無効品目の場合は候補から除外する。
- 候補内の `unit` と `unit_price` はDB値を表示する。AIが単位や単価を判断した値として扱わない。
- 候補は最大5件を目安とする。

## 12. missing_information

不足情報や確認事項を返す。

```json
[
  {
    "id": "miss-001",
    "field": "paint_grade",
    "scope": "line",
    "line_candidate_id": "cand-001",
    "question": "使用する塗料グレードを確認してください。",
    "severity": "warning",
    "suggested_choices": [
      "シリコン",
      "フッ素",
      "無機"
    ]
  }
]
```

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | string | YES | 確認事項ID |
| `field` | string | YES | 対象フィールド |
| `scope` | string | YES | `analysis`, `line` |
| `line_candidate_id` | string/null | YES | 明細候補に紐づく場合のID |
| `question` | string | YES | ユーザーへ表示する質問 |
| `severity` | string | YES | `info`, `warning`, `blocking` |
| `suggested_choices` | string[] | YES | 選択肢候補 |

### severity

| 値 | UI/動作 |
| --- | --- |
| `info` | 補足確認。下書き作成可 |
| `warning` | 確認推奨。下書き作成可 |
| `blocking` | そのままでは確定不可。ユーザー入力が必要 |

## 13. internal_vendor_instruction_candidates

業者指示事項候補を返す。

```json
[
  {
    "id": "inst-001",
    "scope": "line",
    "line_candidate_id": "cand-001",
    "text": "高圧洗浄時に隣接駐車場への飛散養生を確認する。",
    "source_text": "隣の駐車場が近い",
    "confidence": 0.74
  }
]
```

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | string | YES | 候補ID |
| `scope` | string | YES | `line` |
| `line_candidate_id` | string/null | YES | 明細候補に紐づく場合のID |
| `text` | string | YES | 業者指示事項候補 |
| `source_text` | string | YES | 根拠となる発話 |
| `confidence` | number | YES | 信頼度 |

重要ルール:

- 業者指示事項は内部情報である。
- 顧客向けPDFには絶対に出力しない。
- AI解析結果確認画面では「内部用」「PDF非表示」と明示する。
- ユーザーが採用した場合のみ、`estimate_lines.internal_vendor_instruction` に保存する。
- 見積全体の業者指示事項はAIで入力せず、ユーザーが見積編集画面で入力する。

## 14. 明細備考候補

顧客向け備考などの見積ヘッダー領域はAIで入力しない。

AIが生成できる備考は、`line_candidates[].customer_note` の明細単位の備考候補のみとする。

ルール:

- 見積全体の顧客向け備考はユーザーが入力する。
- 明細備考候補にも、業者指示事項、内部事情、原価、粗利を含めない。
- 明細備考候補はユーザーが採用した場合のみ明細へ反映する。

## 15. assumptions

AIが置いた仮定を返す。

```json
[
  "外壁面積は発話内容の120m2を使用しています。",
  "塗料グレードは未確認のため見積明細には反映していません。"
]
```

ルール:

- 仮定を隠さない。
- 金額や数量に影響する仮定は `missing_information` にも出す。

## 16. warnings

注意事項を返す。

```json
[
  {
    "code": "LOW_CONFIDENCE_QUANTITY",
    "message": "数量の聞き取り信頼度が低い明細があります。",
    "severity": "warning"
  }
]
```

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `code` | string | YES | 警告コード |
| `message` | string | YES | 表示メッセージ |
| `severity` | string | YES | `info`, `warning`, `blocking` |

## 17. JSON Schema v1.1

MVPで使用するJSON Schema。v1.1では、顧客情報や見積ヘッダー情報、明細単位をAI出力から除外する。

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mitsumori.example.com/schemas/estimate-ai-extraction-1.1.json",
  "title": "EstimateAIExtraction",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schema_version",
    "language",
    "summary",
    "source_quality",
    "line_candidates",
    "missing_information",
    "internal_vendor_instruction_candidates",
    "assumptions",
    "warnings"
  ],
  "properties": {
    "schema_version": { "const": "1.1" },
    "language": { "type": "string", "enum": ["ja"] },
    "summary": { "type": "string", "maxLength": 1000 },
    "source_quality": {
      "type": "object",
      "additionalProperties": false,
      "required": ["transcript_confidence", "has_noise", "ambiguous_phrases"],
      "properties": {
        "transcript_confidence": { "type": ["number", "null"], "minimum": 0, "maximum": 1 },
        "has_noise": { "type": "boolean" },
        "ambiguous_phrases": {
          "type": "array",
          "items": { "type": "string", "maxLength": 500 }
        }
      }
    },
    "line_candidates": {
      "type": "array",
      "maxItems": 100,
      "items": { "$ref": "#/$defs/lineCandidate" }
    },
    "missing_information": {
      "type": "array",
      "maxItems": 100,
      "items": { "$ref": "#/$defs/missingInformation" }
    },
    "internal_vendor_instruction_candidates": {
      "type": "array",
      "maxItems": 100,
      "items": { "$ref": "#/$defs/internalVendorInstructionCandidate" }
    },
    "assumptions": {
      "type": "array",
      "items": { "type": "string", "maxLength": 1000 }
    },
    "warnings": {
      "type": "array",
      "items": { "$ref": "#/$defs/warning" }
    }
  },
  "$defs": {
    "lineCandidate": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "candidate_id",
        "source_text",
        "location",
        "item_name",
        "description",
        "quantity",
        "line_type",
        "matched_price_item_candidates",
        "customer_note",
        "internal_vendor_instruction",
        "confidence",
        "needs_user_confirmation",
        "confirmation_reason"
      ],
      "properties": {
        "candidate_id": { "type": "string", "maxLength": 100 },
        "source_text": { "type": "string", "maxLength": 1000 },
        "location": { "type": ["string", "null"], "maxLength": 255 },
        "item_name": { "type": "string", "maxLength": 255 },
        "description": { "type": ["string", "null"], "maxLength": 2000 },
        "quantity": { "type": ["number", "null"], "minimum": 0 },
        "line_type": { "type": "string", "enum": ["normal", "discount", "expense", "note"] },
        "matched_price_item_candidates": {
          "type": "array",
          "maxItems": 5,
          "items": { "$ref": "#/$defs/priceItemCandidate" }
        },
        "customer_note": { "type": ["string", "null"], "maxLength": 2000 },
        "internal_vendor_instruction": { "type": ["string", "null"], "maxLength": 2000 },
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
        "needs_user_confirmation": { "type": "boolean" },
        "confirmation_reason": { "type": ["string", "null"], "maxLength": 1000 }
      }
    },
    "priceItemCandidate": {
      "type": "object",
      "additionalProperties": false,
      "required": ["price_item_id", "name", "unit", "unit_price", "match_reason", "confidence"],
      "properties": {
        "price_item_id": { "type": "string", "format": "uuid" },
        "name": { "type": "string", "maxLength": 255 },
        "unit": { "type": "string", "maxLength": 50 },
        "unit_price": { "type": "number", "minimum": 0 },
        "match_reason": { "type": "string", "maxLength": 1000 },
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    },
    "missingInformation": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "field", "scope", "line_candidate_id", "question", "severity", "suggested_choices"],
      "properties": {
        "id": { "type": "string", "maxLength": 100 },
        "field": { "type": "string", "maxLength": 100 },
        "scope": { "type": "string", "enum": ["analysis", "line"] },
        "line_candidate_id": { "type": ["string", "null"], "maxLength": 100 },
        "question": { "type": "string", "maxLength": 1000 },
        "severity": { "type": "string", "enum": ["info", "warning", "blocking"] },
        "suggested_choices": {
          "type": "array",
          "maxItems": 20,
          "items": { "type": "string", "maxLength": 255 }
        }
      }
    },
    "internalVendorInstructionCandidate": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "scope", "line_candidate_id", "text", "source_text", "confidence"],
      "properties": {
        "id": { "type": "string", "maxLength": 100 },
        "scope": { "type": "string", "enum": ["line"] },
        "line_candidate_id": { "type": ["string", "null"], "maxLength": 100 },
        "text": { "type": "string", "maxLength": 2000 },
        "source_text": { "type": "string", "maxLength": 1000 },
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    },
    "warning": {
      "type": "object",
      "additionalProperties": false,
      "required": ["code", "message", "severity"],
      "properties": {
        "code": { "type": "string", "maxLength": 100 },
        "message": { "type": "string", "maxLength": 1000 },
        "severity": { "type": "string", "enum": ["info", "warning", "blocking"] }
      }
    }
  }
}
```

## 18. サンプルレスポンス

```json
{
  "schema_version": "1.1",
  "language": "ja",
  "summary": "外壁120m2、足場、高圧洗浄を含む明細候補です。",
  "source_quality": {
    "transcript_confidence": 0.84,
    "has_noise": false,
    "ambiguous_phrases": []
  },
  "line_candidates": [
    {
      "candidate_id": "cand-001",
      "source_text": "外壁が120平米くらい",
      "location": "外壁",
      "item_name": "外壁塗装",
      "description": "外壁塗装",
      "quantity": 120,
      "line_type": "normal",
      "matched_price_item_candidates": [
        {
          "price_item_id": "11111111-1111-1111-1111-111111111111",
          "name": "外壁塗装",
          "unit": "m2",
          "unit_price": 2500,
          "match_reason": "品目名が一致。単位と単価は単価マスターの値",
          "confidence": 0.86
        }
      ],
      "customer_note": null,
      "internal_vendor_instruction": null,
      "confidence": 0.82,
      "needs_user_confirmation": false,
      "confirmation_reason": null
    },
    {
      "candidate_id": "cand-002",
      "source_text": "足場と高圧洗浄も入れて",
      "location": "外部",
      "item_name": "足場",
      "description": "仮設足場",
      "quantity": null,
      "line_type": "normal",
      "matched_price_item_candidates": [],
      "customer_note": null,
      "internal_vendor_instruction": "足場設置時に隣地境界を確認する。",
      "confidence": 0.68,
      "needs_user_confirmation": true,
      "confirmation_reason": "足場の数量が不明です。"
    }
  ],
  "missing_information": [
    {
      "id": "miss-001",
      "field": "quantity",
      "scope": "line",
      "line_candidate_id": "cand-002",
      "question": "足場に対応する単価マスター品目と数量を確認してください。",
      "severity": "warning",
      "suggested_choices": []
    }
  ],
  "internal_vendor_instruction_candidates": [
    {
      "id": "inst-001",
      "scope": "line",
      "line_candidate_id": "cand-002",
      "text": "足場設置時に隣地境界を確認する。",
      "source_text": "隣が近いから注意",
      "confidence": 0.72
    }
  ],
  "assumptions": [
    "外壁の数量は発話内容の120を使用しています。単位は単価マスター選択後に決まります。"
  ],
  "warnings": [
    {
      "code": "MISSING_LINE_QUANTITY",
      "message": "数量が未確定の明細があります。",
      "severity": "warning"
    }
  ]
}
```

## 19. サーバー側検証ルール

AIレスポンス受信後、サーバー側で以下を検証する。

1. JSON Schemaに準拠していること。
2. `schema_version` が対応バージョンであること。
3. `candidate_id` がレスポンス内で重複していないこと。
4. `line_candidate_id` が存在する候補を参照していること。
5. `matched_price_item_candidates.price_item_id` が同一会社の有効な単価マスターであること。
6. `line_candidates` に `unit` や `unit_price` が含まれていないこと。
7. 単位と単価は、ユーザーが選択した単価マスターのDB値を正とすること。
8. `quantity` と `amount` はサーバー側で再計算すること。
9. `internal_vendor_instruction` は顧客向けDTOに渡さないこと。
10. 長すぎる文字列は保存前にエラーまたは切り詰め確認を行うこと。
11. `blocking` の確認事項がある場合は、見積への確定反映を止めること。

## 20. 単価マスター候補生成ルール

AI解析前後で以下の2段階照合を行う。

### 20.1 AI入力前

サーバーはログイン中の会社の単価マスターから、入力テキストと近い候補だけを抽出してAIへ渡す。

候補抽出条件:

- 品目名の部分一致
- かな、漢字、表記揺れを考慮した簡易正規化
- 有効品目のみ

### 20.2 AI出力後

AIが返した候補をサーバー側で再検証する。

- 存在しない `price_item_id` は除外。
- 他会社の `price_item_id` は除外。
- 無効品目は除外。
- 単位と単価はDB値で上書き。
- 候補が0件の場合、手入力品目として表示。

## 21. UI反映ルール

AI解析結果確認画面では以下の表示にする。

| JSON項目 | UI表示 |
| --- | --- |
| `summary` | 解析概要 |
| `line_candidates` | 明細候補カードまたは表 |
| `matched_price_item_candidates` | 単価マスター候補の選択肢。単位と単価はマスター値として表示 |
| `missing_information` | 確認事項リスト |
| `internal_vendor_instruction_candidates` | 内部用・PDF非表示の指示候補 |
| `warnings` | 警告バナー |

採用ルール:

- 明細候補はユーザーが選択したものだけ見積に反映する。
- 単価マスター候補はユーザーが選択する。選択後、単価マスターの単位と単価を明細へ反映する。
- 業者指示事項候補は初期状態では未採用にする。
- `needs_user_confirmation = true` の候補は確認済みになるまで強調表示する。
- `severity = blocking` の確認事項がある場合は「見積へ反映」ボタンを無効にする。

## 22. AIプロンプト制約

システムプロンプトに含めるべき制約:

- 必ず指定JSON Schemaに従う。
- 不明な項目は推測で埋めず `null` にする。
- 不足情報は `missing_information` に出す。
- 金額は最終確定しない。
- 単位を判断しない。明細候補に `unit` を出力しない。
- 単価を判断しない。明細候補に `unit_price` を出力しない。
- 顧客情報、現場住所、見積件名、見積日、有効期限、担当者、顧客向け備考などのヘッダー情報を出力しない。
- 業者指示事項は明細単位の `internal_vendor_instruction_candidates` または明細の `internal_vendor_instruction` に分離する。
- 同一の作業を重複して明細化しない。
- 数量が不明な場合は確認事項にする。単位が不明な場合は、単価マスター選択で決めるためAIは補完しない。

## 23. 保存方針

`ai_analysis_runs.extraction_json` に以下を保存する。

- AIの生JSON
- サーバー検証後の正規化JSON
- スキーマバージョン
- 検証結果

MVPでは1つの `extraction_json` に保存してよいが、将来は以下に分けることを検討する。

- `raw_extraction_json`
- `validated_extraction_json`
- `validation_errors`

## 24. 受入基準

- AIレスポンスがJSON Schemaに準拠している。
- 必須項目が欠けている場合は保存せずエラーにする。
- AIレスポンスに顧客情報、見積ヘッダー情報、顧客向け備考案が含まれない。
- AIレスポンスの明細候補に `unit` と `unit_price` が含まれない。
- 他会社の単価マスターIDが混入してもサーバー側で除外する。
- AIが返した単価マスター候補はDBの単位・単価で再検証される。
- AI解析結果はユーザーが採用するまで見積に反映されない。
- 業者指示事項候補は顧客向けPDF DTOに含まれない。
- `blocking` の確認事項がある場合、見積への反映が止まる。
- サンプル音声から、場所、品目候補、数量、明細備考、業者指示事項候補を抽出できる。

## 25. 今後の拡張

| 項目 | 内容 |
| --- | --- |
| 打ち合わせ録音オプション | 長時間会話用の要約スキーマを別途定義する |
| 画像・図面解析 | `input_type = image`, `drawing` に対応する |
| 業種別スキーマ | 外壁塗装、水道修理、電気工事などで確認項目を切り替える |
| 類似見積検索 | 過去見積候補をAI入力に加える。ただし会社単位の分離を必須とする |
| OpenAPI連携 | API仕様とJSON Schemaを型生成に利用する |
