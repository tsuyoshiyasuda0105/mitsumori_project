# Soraショート動画プロンプト集 - ボイス見積

> 目的: ChatGPT/Soraで、9:16縦型ショート動画をすぐ生成できる実用資料。  
> 前提: 「ボイス見積」は先行公開中のプロトタイプ。効果の確定数値、完全自動化、確実な連携を断定しない。AIは見積明細の下書きを作り、最後は担当者が確認する。

---

## 制作共通ルール

### 必ず入れる主訴
- 入力が苦手でも、音声で見積作成を始められる。
- 単価マスターで、品目ごとの価格を統一しやすい。
- 他システムへ渡すための見積データを出力できる。

### NG表現
- 「原価」を主訴にしない。
- 「業者指示事項を顧客に出さない安心」を主訴にしない。
- 「内部情報非表示」を主訴にしない。
- 「AIが完璧な見積を自動作成」「必ず時間を削減」「どのシステムとも自動連携」などの断定をしない。
- 導入実績、削減時間、売上向上など、未確定の数値・効果を出さない。

### 推奨トーン
- 現場目線で、平易、誠実。
- 「すごいAI」より「現場の入力作業を助ける道具」。
- 実写風、明るい自然光、日本の住宅街・小規模建設会社の事務所。
- UIは清潔なSaaS画面。白背景、紺、スカイブルー、差し色に橙。
- 画面内テキストは短く、大きく、スマホ視聴で読める量にする。

---

## 15秒ショート動画プロンプト 3案

### 15秒案1: 現場で話すだけ

**狙い**  
パソコン入力が苦手な職人兼代表に、「これなら始められそう」と感じてもらう。

**ターゲット**  
外壁塗装、屋根塗装、リフォーム、設備工事の一人親方・小規模事業者。

**冒頭フック**  
「見積入力、現場で話すだけなら？」

**シーン構成**

| 秒数 | 映像 | ナレーション | テロップ |
| --- | --- | --- | --- |
| 0-3秒 | 住宅外壁の現場。職人がスマホに向かって作業内容を話す。 | 見積入力、現場で話すだけなら？ | 入力が苦手でも音声で作成 |
| 3-7秒 | 音声波形、文字起こし、見積明細候補が生成されるUI。 | ボイス見積は、話した内容をAIが明細の下書きにします。 | 話した内容を明細候補に |
| 7-11秒 | 単価マスターから単価が候補反映される画面。 | 単価マスターで、価格もそろえやすく。 | 単価マスターで価格を統一 |
| 11-15秒 | CSV、Excel、連携用データの出力画面とCTA。 | 見積データを出力。まずはデモで確認してください。 | 他システムへ見積データ出力 |

**Soraに貼る完成プロンプト**

```text
9:16 vertical short video, 15 seconds, realistic Japanese business documentary style. Create a promotional video for a prototype service named "ボイス見積", a voice AI estimate creation system for small construction, exterior painting, roofing, renovation, and equipment work companies.

Scene 1, 0-3 seconds: A clean, realistic Japanese residential exterior worksite in daylight. A craftsperson-owner in work clothes checks an exterior wall and speaks into a smartphone. Show a calm, practical atmosphere. Large Japanese caption: 「入力が苦手でも音声で作成」. Voiceover: 「見積入力、現場で話すだけなら？」

Scene 2, 3-7 seconds: Transition to a clean SaaS UI mockup. A voice waveform becomes Japanese transcription, then estimate line item candidates. The UI shows items such as 外壁塗装, 高圧洗浄, 足場, quantity, unit, notes. Caption: 「話した内容を明細候補に」. Voiceover: 「ボイス見積は、話した内容をAIが明細の下書きにします。」

Scene 3, 7-11 seconds: Show a unit price master table. Unit prices flow into the estimate lines as candidate prices. Use labels: 単価マスター, 品目, 単位, 単価. Caption: 「単価マスターで価格を統一」. Voiceover: 「単価マスターで、価格もそろえやすく。」

Scene 4, 11-15 seconds: Show export buttons for Excel, CSV, and 他システム連携用データ, then a simple CTA screen with "先行公開中 / デモで確認". Caption: 「他システムへ見積データ出力」. Voiceover: 「見積データを出力。まずはデモで確認してください。」

Style: bright, trustworthy, realistic, no exaggerated futuristic effects. Vertical 9:16, readable large Japanese captions, quick but not chaotic cuts, clean white and navy UI with sky blue accents and small orange highlights. Avoid mentioning cost price, hidden internal information, customer-facing instruction hiding, guaranteed time savings, or fully automatic perfect estimates. Make clear through UI or small caption that AI creates a draft and a person confirms it.
```

---

### 15秒案2: Excel単価表を活かす

**狙い**  
既存のExcel単価表を捨てずに使えること、担当者ごとの価格ばらつきを抑えられることを伝える。

**ターゲット**  
家族経営の事務担当、見積入力を支える事務スタッフ、価格管理に悩む代表。

**冒頭フック**  
「そのExcel単価表、見積に活かせます。」

**シーン構成**

| 秒数 | 映像 | ナレーション | テロップ |
| --- | --- | --- | --- |
| 0-3秒 | 事務所のノートPCにExcel単価表。担当者が確認している。 | そのExcel単価表、見積に活かせます。 | Excel単価表を活用 |
| 3-7秒 | Excel表が単価マスターへ取り込まれるUI。 | 品目、単位、単価をマスター化。 | 単価マスターを作成 |
| 7-11秒 | 現場音声から明細候補が作られ、単価が反映される。 | 音声で作った明細にも、価格をそろえて反映。 | 音声入力 + 価格統一 |
| 11-15秒 | 出力画面と担当者の確認。 | 最後は人が確認し、見積データを出力できます。 | 確認して出力 |

**Soraに貼る完成プロンプト**

```text
9:16 vertical short video, 15 seconds, realistic Japanese small construction office and SaaS UI. Promotional video for "ボイス見積", a prototype voice AI estimate creation system.

Scene 1, 0-3 seconds: Small Japanese construction company office, clean desk, laptop showing an Excel-like unit price table, smartphone, paper estimate. A staff member checks the table. Caption: 「Excel単価表を活用」. Voiceover: 「そのExcel単価表、見積に活かせます。」

Scene 2, 3-7 seconds: The Excel-like table maps into a clean SaaS screen labeled 単価マスター. Columns include 品目, 単位, 単価, 外部ID. Caption: 「単価マスターを作成」. Voiceover: 「品目、単位、単価をマスター化。」

Scene 3, 7-11 seconds: A craftsperson speaks into a smartphone at a residential exterior worksite. The spoken content becomes estimate line candidates, and prices are suggested from the unit price master. Caption: 「音声入力 + 価格統一」. Voiceover: 「音声で作った明細にも、価格をそろえて反映。」

Scene 4, 11-15 seconds: A person reviews the draft estimate, checks quantity and unit price, then output buttons appear: Excel, CSV, 他システム連携用データ. Caption: 「確認して出力」. Voiceover: 「最後は人が確認し、見積データを出力できます。」

Style: practical, trustworthy, bright natural light, Japanese UI, no excessive animation. Use large readable Japanese captions. Keep all screen text short. Do not mention cost price, hidden internal information, customer instruction hiding, or guaranteed improvements. The AI is a draft assistant, not a fully automatic estimator.
```

---

### 15秒案3: 転記を減らす見積データ出力

**狙い**  
見積書だけでなく、他システムへ渡せるデータ出力を短く印象づける。

**ターゲット**  
施工管理、販売管理、会計などへ見積データを転記している会社。

**冒頭フック**  
「見積、同じ内容を何度も入力していませんか？」

**シーン構成**

| 秒数 | 映像 | ナレーション | テロップ |
| --- | --- | --- | --- |
| 0-3秒 | 事務所で見積内容を別システムへ入力する手元。 | 見積、同じ内容を何度も入力していませんか？ | 転記の手間を減らしたい |
| 3-6秒 | 現場音声から明細候補ができる。 | まずは音声で明細を下書き。 | 音声で見積下書き |
| 6-10秒 | 単価マスターで価格が反映される。 | 単価マスターで価格を統一。 | 価格を統一 |
| 10-15秒 | 外部IDつき見積データが他システムへ流れる図。 | 見積データを出力し、他システム連携につなげます。 | 他システムへ見積データ出力 |

**Soraに貼る完成プロンプト**

```text
9:16 vertical short video, 15 seconds, realistic Japanese business promo with simple SaaS UI diagrams. Product name: "ボイス見積", a prototype voice AI estimate creation system for construction companies.

Scene 1, 0-3 seconds: In a small construction company office, a staff member enters the same estimate content into another business system on a laptop. Show mild busyness, not stress. Caption: 「転記の手間を減らしたい」. Voiceover: 「見積、同じ内容を何度も入力していませんか？」

Scene 2, 3-6 seconds: At a Japanese residential worksite, a craftsperson speaks into a smartphone. A waveform and transcription turn into estimate draft line items. Caption: 「音声で見積下書き」. Voiceover: 「まずは音声で明細を下書き。」

Scene 3, 6-10 seconds: Clean UI showing 単価マスター suggesting unit prices for line items such as 外壁塗装, 足場, 高圧洗浄. Caption: 「価格を統一」. Voiceover: 「単価マスターで価格を統一。」

Scene 4, 10-15 seconds: Simple diagram: estimate data with 外部ID flows to Excel, CSV, 施工管理, 販売管理, 会計. Show export buttons and a CTA "デモで確認". Caption: 「他システムへ見積データ出力」. Voiceover: 「見積データを出力し、他システム連携につなげます。」

Style: bright, clear, readable, practical, not overly futuristic. Vertical 9:16. Use large Japanese captions. Do not claim automatic connection to every system. Avoid cost price, hiding internal information, and customer instruction hiding. Include the idea that AI creates a draft and people confirm the estimate.
```

---

## 30秒ショート動画プロンプト 3案

### 30秒案1: 3ステップ訴求「話す・確認・出力」

**狙い**  
初見でも機能全体を理解できるように、音声入力から出力までを3ステップで見せる。

**ターゲット**  
外壁塗装・屋根塗装・リフォーム・設備工事の小規模事業者、職人兼代表。

**冒頭フック**  
「見積入力が苦手でも、現場で話せば始められます。」

**シーン構成**

| 秒数 | 映像 | ナレーション | テロップ |
| --- | --- | --- | --- |
| 0-4秒 | 現場、メモ、Excel、既存システムを行き来する忙しい画面。 | 見積入力が苦手でも、現場で話せば始められます。 | 入力が苦手でも音声で作成 |
| 4-9秒 | スマホに話す現場担当。波形と文字起こし。 | ボイス見積は、話した内容をAIが見積明細の下書きにします。 | 話した内容を明細候補に |
| 9-14秒 | 明細候補に品目、数量、備考が入る。 | 品目、数量、備考を候補化し、担当者が確認できます。 | AIは下書き。人が確認 |
| 14-20秒 | Excel単価表の取り込み、単価マスター画面。 | 既存のExcel単価表から単価マスターを作成。価格を統一しやすくします。 | 単価マスターで価格を統一 |
| 20-26秒 | 外部IDつき明細、Excel/CSV/連携用データ出力。 | 外部IDつきの見積データを、他システムへ渡しやすい形で出力できます。 | 他システムへ見積データ出力 |
| 26-30秒 | CTA。LP風画面「先行公開中 / デモで確認」。 | 先行公開中。まずはデモで現場の流れに合うか確認してください。 | 先行公開中。デモで確認 |

**Soraに貼る完成プロンプト**

```text
9:16 vertical short video, 30 seconds, realistic Japanese construction business promo. Product: "ボイス見積", a prototype voice AI estimate creation system for exterior painting, roofing, renovation, and equipment work companies.

Scene 1, 0-4 seconds: Fast but readable montage: a Japanese residential worksite, handwritten notes, smartphone photos, Excel-like unit price table, and another business system screen. Caption: 「入力が苦手でも音声で作成」. Voiceover: 「見積入力が苦手でも、現場で話せば始められます。」

Scene 2, 4-9 seconds: Craftsperson-owner at a bright residential exterior worksite speaks into a smartphone. A voice waveform and Japanese transcription appear. Caption: 「話した内容を明細候補に」. Voiceover: 「ボイス見積は、話した内容をAIが見積明細の下書きにします。」

Scene 3, 9-14 seconds: Clean SaaS UI creates estimate line candidates with columns 品目, 数量, 単位, 備考. Show example items: 外壁塗装, 高圧洗浄, 足場. A person reviews the draft. Caption: 「AIは下書き。人が確認」. Voiceover: 「品目、数量、備考を候補化し、担当者が確認できます。」

Scene 4, 14-20 seconds: Excel-like unit price table imports into a screen labeled 単価マスター. Prices are suggested into estimate lines. Caption: 「単価マスターで価格を統一」. Voiceover: 「既存のExcel単価表から単価マスターを作成。価格を統一しやすくします。」

Scene 5, 20-26 seconds: Estimate line items display 外部ID and 連携先コード. Export buttons appear: Excel, CSV, 他システム連携用データ. Simple arrows flow to 施工管理, 販売管理, 会計. Caption: 「他システムへ見積データ出力」. Voiceover: 「外部IDつきの見積データを、他システムへ渡しやすい形で出力できます。」

Scene 6, 26-30 seconds: Simple CTA screen with product name "ボイス見積", "先行公開中", "デモで確認". Voiceover: 「先行公開中。まずはデモで現場の流れに合うか確認してください。」 Caption: 「先行公開中。デモで確認」

Style: vertical 9:16, realistic, trustworthy, clean white/navy/sky-blue SaaS UI with small orange accent, large readable Japanese captions, gentle upbeat music. Avoid mentioning cost price, hidden internal information, customer instruction hiding, guaranteed savings, perfect automation, or automatic connection to every system.
```

---

### 30秒案2: 事務担当の負担に寄せる

**狙い**  
見積作成を支える事務担当に、メモ探し・単価確認・転記の手間を減らす運用イメージを伝える。

**ターゲット**  
家族経営の事務担当、事務兼経理、代表の見積作成を支えるスタッフ。

**冒頭フック**  
「現場メモ、単価表、転記。見積作成、事務所に負担が集まっていませんか？」

**シーン構成**

| 秒数 | 映像 | ナレーション | テロップ |
| --- | --- | --- | --- |
| 0-5秒 | 事務所の机。手帳、スマホ写真、Excel単価表、見積書が並ぶ。 | 現場メモ、単価表、転記。見積作成、事務所に負担が集まっていませんか？ | メモ探し / 単価確認 / 転記 |
| 5-10秒 | 現場担当がスマホに話し、文字起こしされる。 | ボイス見積なら、現場で話した内容を明細の下書きに。 | 現場の音声を明細候補に |
| 10-15秒 | 事務担当が下書きを確認し、数量や備考を調整。 | AIは下書き。最後は担当者が確認して仕上げます。 | AIは下書き |
| 15-21秒 | 単価マスターから価格候補が反映。 | 単価マスターで、担当者ごとの価格ばらつきを抑えやすく。 | 価格をそろえる |
| 21-27秒 | PDF、Excel、CSV、連携用データの出力。 | 見積書だけでなく、他システムへ渡す見積データも出力できます。 | 見積データを出力 |
| 27-30秒 | CTA。 | 先行公開中。まずはデモで確認してください。 | デモで確認 |

**Soraに貼る完成プロンプト**

```text
9:16 vertical short video, 30 seconds, realistic Japanese small business office and construction worksite. Product: "ボイス見積", a prototype voice AI estimate creation system.

Scene 1, 0-5 seconds: Small Japanese construction company office. Desk with notebook, smartphone photos, printed estimate, Excel-like unit price table on laptop. A clerical staff member organizes information calmly. Caption: 「メモ探し / 単価確認 / 転記」. Voiceover: 「現場メモ、単価表、転記。見積作成、事務所に負担が集まっていませんか？」

Scene 2, 5-10 seconds: Worksite cut. A field worker speaks into a smartphone while checking a residential exterior wall. Voice waveform and transcription appear. Caption: 「現場の音声を明細候補に」. Voiceover: 「ボイス見積なら、現場で話した内容を明細の下書きに。」

Scene 3, 10-15 seconds: Back to clean SaaS UI. Draft estimate lines appear, and a staff member edits quantity and notes. Caption: 「AIは下書き」. Voiceover: 「AIは下書き。最後は担当者が確認して仕上げます。」

Scene 4, 15-21 seconds: Unit price master screen. Prices are suggested from 単価マスター into line items. Show 品目, 単位, 単価. Caption: 「価格をそろえる」. Voiceover: 「単価マスターで、担当者ごとの価格ばらつきを抑えやすく。」

Scene 5, 21-27 seconds: Export screen with PDF, Excel, CSV, 他システム連携用データ. Simple arrows to 施工管理, 販売管理, 会計. Caption: 「見積データを出力」. Voiceover: 「見積書だけでなく、他システムへ渡す見積データも出力できます。」

Scene 6, 27-30 seconds: Product logo style text "ボイス見積", "先行公開中", "デモで確認". Caption: 「デモで確認」. Voiceover: 「先行公開中。まずはデモで確認してください。」

Style: friendly and practical, bright natural light, no dark stressful tone, realistic Japanese office, clean UI. Vertical 9:16. Large captions only. Avoid cost price, hidden internal information, customer instruction hiding, guaranteed reductions, and fully automatic claims.
```

---

### 30秒案3: 既存システム連携に刺す

**狙い**  
施工管理・販売管理・会計への転記に課題がある層へ、「見積データを出力できる」価値を強く伝える。

**ターゲット**  
複数システムを使う中小建設会社、見積から受注後処理までの二重入力に悩む代表・管理担当。

**冒頭フック**  
「見積書を作ったあと、また別システムに入力していませんか？」

**シーン構成**

| 秒数 | 映像 | ナレーション | テロップ |
| --- | --- | --- | --- |
| 0-4秒 | 見積書作成後、別システムに同じ内容を入力する画面。 | 見積書を作ったあと、また別システムに入力していませんか？ | 二重入力を減らしたい |
| 4-9秒 | 現場でスマホに話す。 | ボイス見積は、音声から見積明細の下書きを作ります。 | 音声で明細下書き |
| 9-15秒 | 単価マスターで単価が反映される。 | 単価マスターで、品目ごとの価格を統一。 | 単価マスターで価格統一 |
| 15-21秒 | 明細に外部ID、連携先コードが表示される。 | 明細には外部IDや連携用のコードを持たせられます。 | 外部IDつき明細 |
| 21-27秒 | 見積データがExcel、CSV、施工管理、販売管理、会計へ流れる図。 | 他システムへ渡すための見積データを出力できます。 | 他システムへ見積データ出力 |
| 27-30秒 | 担当者が確認して確定、CTA。 | AIは下書き。最後は人が確認。デモでお試しください。 | 先行公開中 |

**Soraに貼る完成プロンプト**

```text
9:16 vertical short video, 30 seconds, realistic Japanese business promo with UI and simple data-flow diagrams. Product name: "ボイス見積", a prototype voice AI estimate creation system for construction companies.

Scene 1, 0-4 seconds: Small construction office. A person finishes an estimate, then begins entering the same content into another business system. Keep it realistic and not overly negative. Caption: 「二重入力を減らしたい」. Voiceover: 「見積書を作ったあと、また別システムに入力していませんか？」

Scene 2, 4-9 seconds: At a Japanese residential exterior worksite, a craftsperson speaks into a smartphone. Waveform and transcription become draft estimate lines. Caption: 「音声で明細下書き」. Voiceover: 「ボイス見積は、音声から見積明細の下書きを作ります。」

Scene 3, 9-15 seconds: Unit price master UI. Items such as 外壁塗装, 高圧洗浄, 足場 receive suggested prices from 単価マスター. Caption: 「単価マスターで価格統一」. Voiceover: 「単価マスターで、品目ごとの価格を統一。」

Scene 4, 15-21 seconds: Estimate detail UI zoom. Show columns: 品目, 数量, 単位, 単価, 外部ID, 連携先コード. Caption: 「外部IDつき明細」. Voiceover: 「明細には外部IDや連携用のコードを持たせられます。」

Scene 5, 21-27 seconds: Simple clean diagram. Estimate data flows to Excel, CSV, 施工管理, 販売管理, 会計. Do not imply universal automatic integration; show exportable data. Caption: 「他システムへ見積データ出力」. Voiceover: 「他システムへ渡すための見積データを出力できます。」

Scene 6, 27-30 seconds: A person checks the draft estimate and presses confirm. CTA: "先行公開中 / デモで確認". Caption: 「先行公開中」. Voiceover: 「AIは下書き。最後は人が確認。デモでお試しください。」

Style: clean SaaS visuals, realistic Japanese worksite and office, vertical 9:16, bright and trustworthy, readable Japanese captions. Avoid cost price, hidden internal information, customer instruction hiding, guaranteed savings, and claims that all systems connect automatically.
```

---

## 生成後に確認するチェックリスト

### 内容チェック
- 主訴が「音声で見積作成」「単価マスターで価格統一」「他システムへ見積データ出力」になっている。
- 「原価」「業者指示事項を顧客に出さない安心」「内部情報非表示」が主訴になっていない。
- AIが作るものを「下書き」「候補」と表現している。
- 最後は担当者・人が確認する流れが入っている。
- 「先行公開中」「プロトタイプ」「デモで確認」のいずれかが入っている。
- 効果の確定数値、導入実績、削減率、売上向上などを出していない。
- 「どのシステムとも自動連携」と誤解される表現になっていない。

### 映像チェック
- 9:16縦型で、スマホ投稿に適した構図になっている。
- 住宅外壁、屋根、事務所、見積UIなど、建設業向けだと分かる映像になっている。
- スマホに話す動作が自然で、音声入力の価値が伝わる。
- UIに「単価マスター」「外部ID」「Excel」「CSV」「他システム連携用データ」などが読みやすく出ている。
- テロップが大きく、スマホ視聴でも読める。
- 画面内テキストが多すぎず、1カット1メッセージになっている。
- 実在しない会社名、顧客名、個人情報のような文字が出ていない。

### ナレーション・テロップチェック
- ナレーションが速すぎず、15秒版・30秒版の尺に収まっている。
- テロップとナレーションの意味が一致している。
- 「入力が苦手でも音声で作成」が冒頭付近に入っている。
- 「単価マスターで価格を統一」が中盤に入っている。
- 「他システムへ見積データ出力」が終盤に入っている。
- CTAは「デモで確認」「デモを試す」など、先行公開中に合う表現になっている。

### ブランド・トーンチェック
- 押し売り感が強すぎない。
- AIを過剰に万能化していない。
- 現場担当者や事務担当者を責める表現になっていない。
- 明るく信頼できるトーンになっている。
- BGMや動きが派手すぎず、業務ツールらしい落ち着きがある。

---

## 使い分けメモ

- 初見向けのSNS投稿: **15秒案1** または **30秒案1**
- 事務担当向けDM・商談前送付: **15秒案2** または **30秒案2**
- 既存システム連携に関心がある会社: **15秒案3** または **30秒案3**
- Instagram Reels / TikTok: 冒頭1秒に大きく「入力が苦手でも音声で作成」
- YouTube Shorts: 最後2秒に「先行公開中 / デモで確認」
