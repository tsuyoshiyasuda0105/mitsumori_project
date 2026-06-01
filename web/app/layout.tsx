import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://web-beryl-one-79.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ボイス見積 | 音声AI見積作成",
  description: "現場で音声入力、AIが見積明細を下書き。Excel/PDFで出力できる見積作成システム。",
  applicationName: "ボイス見積",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "ボイス見積",
    url: "/",
    title: "ボイス見積 | 音声AI見積作成",
    description:
      "現場で音声入力、AIが見積明細を下書き。Excel/PDFで出力できる見積作成システム。",
  },
  twitter: {
    card: "summary_large_image",
    title: "ボイス見積 | 音声AI見積作成",
    description: "現場で話すだけ。AIが見積を下書きする音声AI見積作成システム。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
