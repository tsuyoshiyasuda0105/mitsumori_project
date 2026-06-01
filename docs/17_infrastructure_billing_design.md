# Vercel + Supabase + Stripe 構成設計

## 1. 方針

MVPの基本構成は、Vercel + Supabase東京リージョン + Stripe とする。

| 領域 | 採用 | 主な責務 |
| --- | --- | --- |
| Web/API | Vercel + Next.js | 画面、Route Handlers、Server Actions、Cron、Stripe Webhook |
| 認証 | Supabase Auth | ログイン、セッション、パスワード再設定 |
| DB | Supabase Postgres 東京リージョン | 業務データ、AI解析履歴、課金状態、RLS |
| ファイル | Supabase Storage | 音声、ロゴ、Excel、PDF |
| 課金 | Stripe Billing | 月額課金、オプション課金、請求、カスタマーポータル |
| AI | OpenAI API | 文字起こし、見積明細候補の構造化 |

## 2. 責務分担

Vercelはアプリケーションの入口として使う。ブラウザからOpenAI、Stripe Secret API、Supabase Service Roleを直接呼ばない。

Supabaseはデータの正本とする。会社情報、顧客、単価マスター、見積、AI解析履歴、ファイルメタデータ、課金状態はSupabase Postgresに保存する。RLSにより会社間データ分離を担保する。

Stripeは決済と請求の正本とする。ただしアプリ内の機能制御は、Stripe APIを毎回参照せず、Webhookで同期したDB状態を参照する。

## 3. リージョン方針

- Supabaseプロジェクトは東京リージョンを選択する。
- Vercel Functionは可能な範囲で日本またはAPAC最寄りリージョンを優先する。
- Stripeは外部決済基盤として扱い、Webhook受信後にSupabaseへ同期する。
- 音声、Excel、PDFなどのファイルはSupabase Storageに保存し、公開URLではなく署名URLを使う。

## 4. 認証・権限

- ログインはSupabase Authを使う。
- アプリDBの `users.auth_user_id` にSupabase AuthのユーザーIDを保存する。
- `tenant_id`、ロール、権限はアプリDBで管理する。
- 管理者、一般担当者、追加権限はアプリ側の `users.role` と `users.permissions` で判定する。
- Supabase Service Role KeyはVercelサーバー側だけで利用し、通常のユーザー操作ではRLSを前提にする。

## 5. 課金

Stripeで以下を扱う。

- 基本月額プラン
- 打ち合わせ録音オプション
- 将来の業種別テンプレート追加料金
- 請求書、カード決済、カスタマーポータル

Webhookで受ける主なイベント:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Webhook処理では署名検証と冪等性チェックを必須とする。受信済みイベントは `stripe_webhook_events` に保存する。

## 6. 非同期処理

MVPでは、Supabase上のジョブテーブルとVercel Cron/Functionsで以下を処理する。

- 音声文字起こし
- AI見積解析
- 単価マスターExcel取り込み
- Excel出力
- PDF出力

処理時間がVercel Functionsの制限に近づく場合は、同じSupabase DB/Storageを使う専用Workerへ分離する。

## 7. 注意点

- 顧客提出用PDFには業者指示事項を渡さない。
- AIには顧客情報や見積ヘッダー情報を入力させない。
- 明細単位はAIで判断せず、単価マスターから取得する。
- Stripeの契約状態だけで機能制御せず、DB同期状態と `feature_flags` を正とする。
- Supabase Storageのバケットは非公開を基本とし、署名URLの発行時に必ず `tenant_id` を検証する。
