# Googleインデックス作成・SEO設定メモ

## 現在の公開URL

- 正規URL: https://web-beryl-one-79.vercel.app/
- サイトマップ: https://web-beryl-one-79.vercel.app/sitemap.xml
- robots.txt: https://web-beryl-one-79.vercel.app/robots.txt

## 実装済み

- トップページ `/` を公開LPの正規URLに統一。
- 旧LP `/lp` は `/` へ恒久リダイレクト。
- `sitemap.xml` は公開対象ページのみを掲載。
- ログイン後のアプリ画面、ログインページ、法務系ページは `noindex` 対象。
- Google Search ConsoleのHTMLタグ確認用に `GOOGLE_SITE_VERIFICATION` / `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` を利用可能。
- お問い合わせ・特定商取引法ページのメールアドレスは現在非公開。

## Search Consoleで送信するもの

1. プロパティは `https://web-beryl-one-79.vercel.app/` を選択する。
2. サイトマップには `sitemap.xml` と入力して送信する。
3. URL検査は `https://web-beryl-one-79.vercel.app/` を優先する。
4. ブログ記事を公開した場合は、各記事URLもURL検査する。

## 所有権確認のHTMLタグ

Search Consoleで「HTMLタグ」を選び、次の形式から `content="..."` の中身だけをコピーする。

```html
<meta name="google-site-verification" content="ここに表示される文字列" />
```

コピーした値をVercelの環境変数に設定する。

- 変数名: `GOOGLE_SITE_VERIFICATION`
- 値: `content` の中身だけ

## デプロイ後の確認

- `/` が 200 で表示される。
- `/sitemap.xml` が 200 でXMLとして取得できる。
- `/robots.txt` にサイトマップURLが含まれる。
- `/contact` と `/tokushoho` に実メールアドレスやメールリンクが表示されない。
- Search Consoleでサイトマップがすぐ失敗表示になっても、公開直後は再取得に時間がかかるため、URLがブラウザで取得できることを先に確認する。

## 注意

- `/lp` は現在の正規URLではないため、Search ConsoleのURL検査では `/` を使う。
- メールアドレスは公開ページ・共有ドキュメントに記載しない。必要な場合は「現在非公開」または「請求があった場合に遅滞なく開示」と表記する。
