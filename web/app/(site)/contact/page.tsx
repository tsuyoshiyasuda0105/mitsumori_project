import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/ContactForm";

const TITLE = "お問い合わせ";
const DESC = "ボイス見積の導入相談、お見積もり、取材・提携に関するお問い合わせフォームです。メールアドレスを公開せず、フォームから相談できます。";

export const metadata: Metadata = {
  title: `${TITLE} | ボイス見積`,
  description: DESC,
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "ボイス見積",
    url: "/contact",
    title: `${TITLE} | ボイス見積`,
    description: DESC,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "ボイス見積 お問い合わせ",
      },
    ],
  },
};

export default function Page() {
  return <ContactForm />;
}