import { NextResponse } from "next/server";

import { clientIdentifier, rateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

/**
 * Contact endpoint.
 *
 * Order matters here: rate limit before parsing, validate before sending, and
 * never leak whether an address exists. The honeypot is checked last and
 * returns a success response — telling a bot it was caught only helps it
 * adapt, and a real user can never fill that field.
 *
 * Runs on the Edge runtime: the handler only uses Web-standard APIs (fetch,
 * Request/Response, Headers), and edge is what serverless hosts like Cloudflare
 * Pages execute. The in-memory rate limiter is per-isolate there, which the
 * limiter's own docs already call out.
 */

export const runtime = "edge";

const RATE_LIMIT = { limit: 5, windowMs: 60_000 };

async function sendEmail(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "portfolio@fajarariandi.com";

  // Email delivery is optional. Without credentials the message is logged so
  // the form still works end-to-end in development.
  if (!apiKey || !to) {
    console.info(
      "[contact] RESEND_API_KEY/CONTACT_TO_EMAIL not set — logging submission instead:",
      { subject: payload.subject, from: payload.email },
    );
    return { sent: false, reason: "not-configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        // So replying in the mail client goes straight back to the sender.
        reply_to: payload.email,
        subject: `[Portfolio] ${payload.subject}`,
        text: [
          `From: ${payload.name} <${payload.email}>`,
          "",
          payload.message,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[contact] Resend rejected the request:", response.status, detail);
      return { sent: false, reason: "provider-error" };
    }

    return { sent: true };
  } catch (error) {
    console.error("[contact] Failed to reach Resend:", error);
    return { sent: false, reason: "network-error" };
  }
}

export async function POST(request: Request) {
  const identifier = clientIdentifier(request.headers);
  const limit = rateLimit(identifier, RATE_LIMIT);

  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many messages. Please try again in ${limit.retryAfter} seconds.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Malformed request body." },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !errors[field]) {
        errors[field] = issue.message;
      }
    }

    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields.", errors },
      { status: 422 },
    );
  }

  const { name, email, subject, message, company } = parsed.data;

  // Honeypot tripped — accept silently and discard.
  if (company) {
    return NextResponse.json({ ok: true });
  }

  const result = await sendEmail({ name, email, subject, message });

  // A provider outage shouldn't tell the visitor their message vanished, but we
  // do surface it rather than claiming a delivery that didn't happen.
  if (!result.sent && result.reason !== "not-configured") {
    return NextResponse.json(
      {
        ok: false,
        error:
          "The message couldn't be delivered right now. Please email me directly, or try WhatsApp.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

/** Anything but POST is a mistake worth reporting clearly. */
export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Use POST to submit the contact form." },
    { status: 405, headers: { Allow: "POST" } },
  );
}
