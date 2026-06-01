# 音声AI見積作成システム プロジェクト実行計画

## 1. 目的

本ドキュメントは、音声AI見積作成システムを効率的に進めるためのサブエージェント体制、成果物、並列作業方針を定義する。

## 2. 基本方針

- 要件定義、業務設計、UI/UX設計、技術設計、実装計画、QA計画を並列で進める。
- 各エージェントは担当範囲を明確に分け、同じファイルを同時編集しない。
- 顧客向け情報と内部向け情報を分離する。
- 既存Excel運用を尊重し、Excel取込・Excel出力を重視する。
- AIは候補生成と整理を担当し、最終判断は人間が行う。

## 3. サブエージェント構成

| No | エージェント | 主な役割 | 主な成果物 |
| --- | --- | --- | --- |
| 1 | 要件整理エージェント | 要件定義の抜け漏れ確認、MVP範囲整理 | docs/01_requirements_review.md |
| 2 | 業務・見積ドメインエージェント | 見積実務、単価マスター、業者指示事項の設計 | docs/02_domain_design.md |
| 3 | UI/UX設計エージェント | スマホ入力、PC管理、画面遷移、操作導線 | docs/03_ui_ux_design.md |
| 4 | 技術設計エージェント | DB、API、AI連携、Excel/PDF出力方式 | docs/04_technical_design.md |
| 5 | 実装計画エージェント | MVP開発タスク、実装順序、マイルストーン | docs/05_mvp_implementation_plan.md |
| 6 | QA・バグ検証エージェント | テスト観点、受入基準、バグ検証計画 | docs/06_qa_test_plan.md |

UI/UX設計については、Claude Codeへ個別依頼する。依頼範囲は `docs/12_claude_code_uiux_handoff.md` を正とし、Claude CodeはDB、API、AIモデル選定、会社間データ分離仕様を変更しない。

## 4. 並列作業ルール

- 各エージェントは自分の担当ファイルのみ編集する。
- 共通の要件変更は、まず提案として担当ファイルに記載する。
- 統括担当が提案を確認し、必要に応じて requirements.md に反映する。
- 技術設計とUI/UX設計で矛盾が出た場合は、MVP実装の簡単さと現場利用のしやすさを優先する。
- QAエージェントは実装後だけでなく、要件・設計段階からリスクを指摘する。

## 5. 初期成果物

初期フェーズでは以下の成果物を作成する。

- 要件定義書: requirements.md
- プロジェクト実行計画: project_execution_plan.md
- 要件レビュー: docs/01_requirements_review.md
- 業務ドメイン設計: docs/02_domain_design.md
- UI/UX設計: docs/03_ui_ux_design.md
- 技術設計: docs/04_technical_design.md
- MVP実装計画: docs/05_mvp_implementation_plan.md
- QA/バグ検証計画: docs/06_qa_test_plan.md
- 画面サイズ設計: docs/07_screen_size_design.md
- 画面遷移図: docs/08_screen_transition_diagram.md
- 主要画面ワイヤーフレーム: docs/09_wireframes.md
- データベース分離・セキュリティ設計: docs/10_database_security_design.md
- API選定方針: docs/11_api_selection_design.md
- Claude Code向けUI/UX依頼文: docs/12_claude_code_uiux_handoff.md
- 打ち合わせ録音オプション設計: docs/13_meeting_recording_option_design.md
- DB詳細設計書: docs/14_database_detail_design.md
- API詳細仕様書: docs/15_api_detail_design.md
- AI解析JSONスキーマ詳細設計書: docs/16_ai_json_schema_design.md

## 6. 重点論点

### 6.1 業者指示事項

- 見積全体または明細行ごとに登録できる。
- 社内・協力業者向けの内部情報として扱う。
- Excelには出力できる。
- 顧客向けPDFには出力しない。
- QAでは、PDFへの漏えいを最重要リスクとして検証する。

### 6.2 単価マスターExcel取込

- 既存Excel単価表を取り込めることを重視する。
- 取り込み前にプレビューとエラー確認を行う。
- 列名の自動推定、重複チェック、不正値チェックを考慮する。

### 6.3 AI見積解析

- 音声またはテキストから見積条件を抽出する。
- 見積明細候補、単価マスター候補、確認事項、業者指示事項候補を生成する。
- 金額の最終確定はユーザーが行う。

### 6.4 打ち合わせ録音オプション

- 顧客との長時間の打ち合わせ録音、要約、見積反映候補抽出はMVP本体から外し、別オプションとして扱う。
- MVP本体では、見積明細作成用の短い音声入力を優先する。
- オプション無効の会社では、打ち合わせ録音の画面、メニュー、APIを利用できない設計にする。

## 7. 推奨進行順

1. 初期設計ドキュメントを並列作成する。
2. 統括担当が成果物を読み、要件定義書に反映すべき点を抽出する。
3. MVP範囲を確定する。
4. 画面遷移図、DB設計、API設計、帳票テンプレートを作成する。
5. MVP実装を開始する。
6. QA観点に基づき、初期段階からテストケースを作成する。

## 8. 次の判断事項

- 初期ターゲット業種を外壁塗装・リフォームに確定するか。
- Googleスプレッドシート出力をMVPに含めるか。
- 見積Excelは標準テンプレートから始めるか、独自テンプレート対応を初期から行うか。
- LINE連携をMVPに含めるか、後続リリースに回すか。
- AI APIはMVPではOpenAI Audio Transcriptions APIとOpenAI Responses APIを基本とし、詳細は docs/11_api_selection_design.md を正とする。
