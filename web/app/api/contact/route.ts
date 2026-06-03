import { NextResponse } from "next/server";

const KINDS = ["導入のご相談", "お見積もり", "取材・提携", "その他"] as const;
const MAX_TEXT_LENGTH = 2000;

type ContactKind = (typeof KINDS)[number];

interface ContactRequest {
  name?: unknown;
  org?: unknown;
  email?: unknown;
  phone?: unknown;
  kind?: unknown;
  message?: unknown;
  website?: unknown;
}

interface ValidContact {
  name: string;
  org: string;
  email: string;
  phone: string;
  kind: ContactKind;
  message: string;
  receivedAt: string;
  userAgent: string;
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: ContactRequest;

  try {
    body = (await request.json()) as ContactRequest;
  } catch {
    return NextResponse.json(
      { ok: false, code: "INVALID_JSON", message: "送信内容を読み取れませんでした。" },
      { status: 400 },
    );
  }

  // Honeypot: humans never fill this hidden field.
  if (toText(body.website)) {
    return NextResponse.json({ ok: true, mode: "ignored" }, { status: 202 });
  }

  const validation = validateContact(body, request.headers.get("user-agent") ?? "unknown");
  if (!validation.ok) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION_ERROR", message: validation.message },
      { status: 400 },
    );
  }

  try {
    const mode = await notifyContact(validation.contact);
    return NextResponse.json(
      {
        ok: true,
        mode,
        message:
          mode === "webhook"
            ? "お問い合わせを受け付けました。"
            : "フォームの送信環境を確認中です。恐れ入りますが、時間をおいてもう一度お試しください。",
      },
      { status: 202 },
    );
  } catch (error) {
    console.error("[contact] notification failed", error);
    return NextResponse.json(
      {
        ok: false,
        code: "NOTIFICATION_FAILED",
        message: "送信先への通知に失敗しました。時間をおいてもう一度お試しください。",
      },
      { status: 502 },
    );
  }
}

function validateContact(
  body: ContactRequest,
  userAgent: string,
): { ok: true; contact: ValidContact } | { ok: false; message: string } {
  const name = toText(body.name);
  const org = toText(body.org);
  const email = toText(body.email);
  const phone = toText(body.phone);
  const kind = toText(body.kind) || KINDS[0];
  const message = toText(body.message);

  if (!name) return { ok: false, message: "お名前を入力してください。" };
  if (!email || !isEmail(email)) return { ok: false, message: "返信先メールアドレスを正しく入力してください。" };
  if (!message) return { ok: false, message: "お問い合わせ内容を入力してください。" };
  if (message.length > MAX_TEXT_LENGTH) {
    return { ok: false, message: `お問い合わせ内容は${MAX_TEXT_LENGTH}文字以内で入力してください。` };
  }
  if (!KINDS.includes(kind as ContactKind)) {
    return { ok: false, message: "お問い合わせ種別を選び直してください。" };
  }

  return {
    ok: true,
    contact: {
      name,
      org,
      email,
      phone,
      kind: kind as ContactKind,
      message,
      receivedAt: new Date().toISOString(),
      userAgent,
    },
  };
}

async function notifyContact(contact: ValidContact): Promise<"webhook" | "not_configured"> {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  if (!webhookUrl) {
    console.info("[contact] CONTACT_WEBHOOK_URL is not configured", {
      kind: contact.kind,
      org: contact.org || undefined,
      receivedAt: contact.receivedAt,
    });
    return "not_configured";
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text: buildNotificationText(contact),
      contact,
    }),
  });

  if (!response.ok) {
    throw new Error(`Webhook responded with ${response.status}`);
  }

  return "webhook";
}

function buildNotificationText(contact: ValidContact): string {
  return [
    "ボイス見積のお問い合わせを受信しました。",
    `種別: ${contact.kind}`,
    `お名前: ${contact.name}`,
    `会社名: ${contact.org || "未入力"}`,
    `メール: ${contact.email}`,
    `電話: ${contact.phone || "未入力"}`,
    "",
    contact.message,
  ].join("\n");
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\u0000/g, "") : "";
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
