# 音声AI見積作成システム API選定方針

## 1. 結論

MVPでは、外部APIを最小限に絞り、以下の構成を推奨する。

| 用途 | 採用候補 | MVP採用方針 |
| --- | --- | --- |
| Webホスティング/API | Vercel + Next.js | 採用する。画面、API、Webhook、Cron起動を同一プロジェクトで管理する。 |
| DB/Auth/Storage | Supabase（東京リージョン） | 採用する。Postgres、Auth、Storage、RLSをまとめて利用する。 |
| 課金 | Stripe Billing / Checkout / Customer Portal | 採用する。会社単位の月額課金とオプション課金に使う。 |
| スマートフォン録音 | ブラウザ MediaRecorder API | 採用する。外部APIではなくブラウザ標準機能で録音する。 |
| 音声文字起こし | OpenAI Audio Transcriptions API | 採用する。MVPでは短い現場入力の文字起こしに使う。打ち合わせ録音は別オプションで使う。 |
| リアルタイム文字起こし | OpenAI Realtime transcription | 初期は任意。MVP後に操作性改善として追加する。 |
| 見積項目の抽出 | OpenAI Responses API + Structured Outputs | 採用する。JSON Schemaで見積候補を構造化する。 |
| 単価マスター候補推測 | 自社DB検索 + OpenAI構造化解析 | 採用する。最終単価は自社DBの単価マスターを正とする。 |
| Excel出力 | サーバー側Excel生成ライブラリ | 採用する。外部表計算APIに依存せず `.xlsx` を生成する。 |
| Google Sheets出力 | Google Sheets API / Drive API | 第2段階。Google連携が必要な顧客向けに追加する。 |
| Microsoft Excel Online連携 | Microsoft Graph Excel API | 第2段階。Microsoft 365連携が必要な顧客向けに追加する。 |
| ファイル保存 | Supabase Storage | 採用する。音声、Excel、PDFを会社単位のパスと署名URLで保存する。 |

初期開発では「Vercel + Supabase東京リージョン + Stripe + OpenAI + Excel/PDF生成」を基本構成にする。

## 2. OpenAI APIの使い分け

### 2.1 音声文字起こし

短い見積入力は、サーバーまたはWorkerから OpenAI Audio Transcriptions API を呼び出す。打ち合わせ録音の文字起こしは別オプションとして同APIを利用する。

利用イメージ:

- API: `/v1/audio/transcriptions`
- 用途: 録音ファイルから日本語テキストを生成する
- 入力: `webm`, `wav`, `m4a`, `mp3` などの音声ファイル
- 出力: 文字起こしテキスト
- モデル候補:
  - コスト重視: `gpt-4o-mini-transcribe`
  - 精度重視: `gpt-4o-transcribe`
  - 話者分離が必要な打ち合わせ録音: `gpt-4o-transcribe-diarize`

MVPでは、録音完了後にアップロードして文字起こしする方式を基本とする。リアルタイム字幕のような操作感が必要になった段階で、Realtime transcriptionを追加する。

### 2.2 見積候補の構造化

文字起こし済みテキストを OpenAI Responses API に渡し、Structured Outputsで見積候補JSONを生成する。

利用イメージ:

- API: `/v1/responses`
- 用途: 文字起こしテキストから、場所、品目候補、数量、明細備考候補、業者指示事項候補などを抽出する
- 出力: JSON Schemaに従った構造化データ
- 注意: AIの結果は候補として扱い、ユーザー確認前に見積へ確定反映しない

AIに任せる範囲:

- 音声内容の要約
- 場所、品目候補、数量、明細備考候補の抽出
- 業者指示事項の候補抽出
- 不足情報、確認事項の提示
- 単価マスター候補の推測

AIに任せない範囲:

- 顧客情報、現場住所、件名、見積日、有効期限、担当者などのヘッダー情報入力
- 明細単位の判断
- 単価マスター由来ではない単価の確定
- 最終金額の確定
- 契約条件の判断
- 法的判断
- 顧客への自動送信
- 他会社データを含む検索

## 3. 単価マスターとの照合

単価マスター照合は外部APIだけに任せず、自社DBを正とする。

処理方針:

1. AIが音声から品目候補を抽出する。
2. サーバーがログイン中の会社の `price_items` のみを検索する。
3. 外部システム由来の `external_item_code` がある場合は、`price_items.external_item_code` の完全一致を最優先する。
4. 外部品目コードがない場合、または一致しない場合は、品目名、カテゴリ、類似度で候補を絞る。単位はAI判断に使わず、単価マスター候補の表示値として扱う。
5. AIの候補理由とDB検索結果を合わせて、画面に候補を表示する。
6. ユーザーが選択した単価マスターの `unit` と `unit_price` を見積明細へ反映する。

禁止事項:

- AIが生成した単価をそのまま最終単価にしない。
- AIが生成した単位を見積明細の単位として保存しない。
- 他会社の単価マスターを検索対象にしない。
- ブラウザから単価マスター全件をAI APIへ直接送信しない。
- 外部品目コードが一致した場合でも、他会社の単価マスターへ変換しない。

## 4. Excel・スプレッドシート連携

### 4.1 MVPのExcel出力

MVPでは、Google Sheets APIやMicrosoft Graphに依存せず、サーバー側で `.xlsx` を生成する。

理由:

- Google/Microsoftアカウント連携が不要
- 顧客にそのまま送れる
- 既存のExcelテンプレートに合わせやすい
- 会社ごとの帳票フォーマット変更に対応しやすい
- 外部SaaS障害の影響を受けにくい

出力モード:

| モード | 用途 | 業者指示事項 |
| --- | --- | --- |
| `customer` | 顧客提出用 | 出力しない |
| `internal` | 社内確認用 | 出力できる |
| `vendor_instruction` | 協力業者指示用 | 出力できる |

### 4.2 Google Sheets API

Google Sheets連携は第2段階とする。

主な用途:

- 見積をGoogleスプレッドシートへ出力
- 社内で共同編集
- 顧客別、案件別の管理表へ追記

利用候補:

- Google Sheets API `spreadsheets.values`
- Google Sheets API `spreadsheets.batchUpdate`
- Google Drive API

### 4.3 Microsoft Graph Excel API

Microsoft 365を使う会社向けには、Microsoft Graph Excel APIを第2段階で検討する。

主な用途:

- OneDrive / SharePoint上のExcelへ出力
- 既存のMicrosoft 365運用との連携
- 社内共有フォルダでの帳票管理

MVPでは必須にせず、`.xlsx` ファイル出力を先に完成させる。

## 5. 自社アプリケーションAPI

外部APIはブラウザから直接呼ばず、必ず自社アプリケーションAPIを経由する。

MVPでは自社アプリケーションAPIをVercel上のNext.js Route Handlersとして実装する。SupabaseのService Role Key、OpenAI API Key、Stripe Secret KeyはVercelのサーバー環境変数で保持し、ブラウザへ渡さない。

主要API:

| 用途 | 自社API |
| --- | --- |
| 音声アップロード | `POST /api/ai/audio` |
| 文字起こし確認 | `POST /api/ai/transcriptions/{analysisId}/confirm` |
| 見積解析 | `POST /api/ai/estimate-analysis` |
| AI解析結果取得 | `GET /api/ai/analysis-runs/{analysisId}` |
| AI結果の見積反映 | `POST /api/ai/analysis-runs/{analysisId}/apply` |
| 打ち合わせ録音 | `POST /api/meeting-recordings`。別オプション有効時のみ |
| 打ち合わせ要約 | `POST /api/meeting-recordings/{recordingId}/summarize` |
| 単価マスター一覧 | `GET /api/price-items` |
| 単価マスターExcel取り込み | `POST /api/price-items/imports` |
| 見積編集 | `GET /api/estimates/{estimateId}`, `PATCH /api/estimates/{estimateId}` |
| 明細並び替え | `PATCH /api/estimates/{estimateId}/lines/reorder` |
| Excel出力 | `POST /api/estimates/{estimateId}/exports/excel` |
| PDF出力 | `POST /api/estimates/{estimateId}/exports/pdf` |
| ダウンロードURL発行 | `GET /api/files/{fileId}/download-url` |
| Stripe Checkout作成 | `POST /api/billing/checkout-session` |
| Stripe Customer Portal作成 | `POST /api/billing/portal-session` |
| Stripe Webhook | `POST /api/stripe/webhook` |

## 6. セキュリティ方針

### 6.1 APIキー

- OpenAI APIキー、Supabase Service Role Key、Stripe Secret Key、Stripe Webhook Secret、Google APIキー、Microsoft Graphのクライアントシークレットはサーバー側でのみ保持する。
- ブラウザへ外部APIキーを渡さない。
- Realtime APIをブラウザから使う場合は、サーバーで短命のエフェメラルトークンを発行する。

### 6.2 会社間データ分離

- 外部APIに渡すデータは、ログイン中の会社に属するデータだけに限定する。
- `tenant_id` はクライアントから受け取らず、サーバー側のセッションから決定する。
- 音声、文字起こし、AI解析結果、Excel、PDFはすべて `tenant_id` を持つ。
- 署名付きURL発行時も `files.tenant_id == session.tenant_id` を検証する。

### 6.3 AI送信データの最小化

AI APIへ送る情報は、解析に必要な範囲に限定する。

送信してよい情報:

- 文字起こしテキスト
- 明細作成に必要な場所、品目候補、数量、備考、業者指示候補に関わるテキスト
- ログイン中の会社の単価マスター候補。ただし必要最小限の候補に絞る
- 既存見積へ反映するために必要な最小限の見積情報

送信を避ける情報:

- 不要な個人情報
- 顧客情報、現場住所、件名、見積日、有効期限、担当者など、AI入力対象外のヘッダー情報
- 他会社データ
- APIキー、認証情報
- 内部ログ全文
- 出力に不要な社内機密メモ

## 7. 推奨する実装順

1. Supabase東京リージョンのプロジェクト、Vercelプロジェクト、Stripeアカウントを用意する。
2. Supabase Auth、Postgres、Storage、RLS、基本テーブルを実装する。
3. Vercel上のNext.js APIで認証済みAPIとStripe Webhookを実装する。
4. MediaRecorder APIで録音し、音声ファイルをSupabase Storageへアップロードする。
5. Vercel Function/ジョブ処理からOpenAI Audio Transcriptions APIを呼ぶ。
6. 文字起こし結果を確認画面に表示する。
7. OpenAI Responses APIを呼び、見積候補JSONを生成する。
8. Supabase Postgresの単価マスターと照合し、候補を画面に表示する。
9. ユーザー確定後に見積明細へ反映する。
10. `.xlsx` とPDF出力を実装する。
11. Stripe Billingでプランと打ち合わせ録音オプションの有効/無効を制御する。
12. 必要に応じてGoogle Sheets APIまたはMicrosoft Graph連携を追加する。

## 8. 参考URL

- OpenAI Speech to text: https://platform.openai.com/docs/guides/speech-to-text
- OpenAI Realtime transcription: https://platform.openai.com/docs/guides/realtime-transcription
- OpenAI Responses API: https://platform.openai.com/docs/api-reference/responses
- OpenAI Structured Outputs: https://platform.openai.com/docs/guides/structured-outputs
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Stripe Billing: https://docs.stripe.com/billing
- Stripe Webhooks: https://docs.stripe.com/webhooks
- Google Sheets API Values: https://developers.google.com/workspace/sheets/api/guides/values
- Google Sheets API Batch update: https://developers.google.com/workspace/sheets/api/guides/batchupdate
- Google Drive API Uploads: https://developers.google.com/workspace/drive/api/guides/manage-uploads
- Microsoft Graph Excel API: https://learn.microsoft.com/en-us/graph/api/resources/excel
