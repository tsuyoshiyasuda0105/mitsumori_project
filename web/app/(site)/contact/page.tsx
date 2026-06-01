import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ | ボイス見積",
  robots: { index: false },
};

export default function Page() {
  return <ContactForm />;
}
