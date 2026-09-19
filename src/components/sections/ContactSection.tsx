"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn, whatsappLink } from "@/lib/utils";
import { validateContact, type ContactErrors, type ContactInput } from "@/lib/validation";
import type { SiteSettings } from "@/types/content";

type Status = "idle" | "sending" | "sent" | "error";

const EMPTY: ContactInput = {
  name: "",
  email: "",
  subject: "",
  message: "",
  company: "",
};

/**
 * Contact section.
 *
 * Validation runs client-side first for immediate feedback, then again on the
 * server — the client pass is a courtesy, the server pass is the actual gate.
 * Every input has a real `<label>`, errors are wired through `aria-describedby`
 * and announced in a live region, so the form is usable without sight.
 */
export function ContactSection({
  settings,
  headingLevel = "h2",
}: {
  settings: SiteSettings;
  /** h1 on /contact where this is the page title; the Home page already has the
   * hero's h1, so it stays h2 there. */
  headingLevel?: "h1" | "h2";
}) {
  const [values, setValues] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");

  const update =
    (field: keyof ContactInput) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
      // Clear the field's error as soon as the user starts fixing it.
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerMessage("");

    const { success, errors: validationErrors } = validateContact(values);
    if (!success) {
      setErrors(validationErrors);
      setStatus("error");
      setServerMessage("Please fix the highlighted fields and try again.");
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data: { ok?: boolean; error?: string; errors?: ContactErrors } =
        await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        setStatus("error");
        setServerMessage(
          data.error ?? "Something went wrong sending that. Please try again.",
        );
        return;
      }

      setStatus("sent");
      setValues(EMPTY);
    } catch {
      setStatus("error");
      setServerMessage(
        "Couldn't reach the server. Check your connection, or message me on WhatsApp instead.",
      );
    }
  }

  const whatsappHref = whatsappLink(
    settings.whatsapp,
    "Hi Fajar — I found your portfolio and I'd like to talk about a project.",
  );

  return (
    <Section id="contact">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <SectionHeading
            as={headingLevel}
            eyebrow="Contact"
            title={
              <>
                Let&apos;s build <span className="text-gradient">something</span>
              </>
            }
            description="Hiring, freelance work, or a technical question — I read everything that comes through here."
          />

          <div className="mt-10 space-y-4">
            <a
              href={`mailto:${settings.email}`}
              className="surface group flex items-center gap-4 p-4 transition-colors hover:border-accent-cyan/30"
            >
              <span className="grid size-10 place-items-center rounded-lg border border-line bg-white/[0.03] text-ink-muted transition-colors group-hover:text-accent-cyan">
                <SocialIcon platform="Email" className="size-4.5" />
              </span>
              <span>
                <span className="block text-xs text-ink-faint">Email</span>
                <span className="block text-sm text-ink">{settings.email}</span>
              </span>
            </a>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="surface group flex items-center gap-4 p-4 transition-colors hover:border-emerald-400/30"
            >
              <span className="grid size-10 place-items-center rounded-lg border border-line bg-white/[0.03] text-ink-muted transition-colors group-hover:text-emerald-400">
                <SocialIcon platform="WhatsApp" className="size-4.5" />
              </span>
              <span>
                <span className="block text-xs text-ink-faint">WhatsApp</span>
                <span className="block text-sm text-ink">Fastest reply</span>
              </span>
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="surface p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Name"
              name="name"
              value={values.name}
              onChange={update("name")}
              error={errors.name}
              autoComplete="name"
              placeholder="Your name"
            />
            <Field
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={update("email")}
              error={errors.email}
              autoComplete="email"
              placeholder="you@company.com"
            />
          </div>

          <div className="mt-5">
            <Field
              label="Subject"
              name="subject"
              value={values.subject}
              onChange={update("subject")}
              error={errors.subject}
              placeholder="What's this about?"
            />
          </div>

          <div className="mt-5">
            <Field
              label="Message"
              name="message"
              multiline
              value={values.message}
              onChange={update("message")}
              error={errors.message}
              placeholder="Tell me about the project, the timeline, and what success looks like…"
            />
          </div>

          {/* Honeypot — visually and semantically hidden from real users. */}
          <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
            <label htmlFor="company">Company (leave blank)</label>
            <input
              id="company"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={values.company}
              onChange={update("company")}
            />
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={status === "sending" || status === "sent"}
            >
              {status === "sending" ? "Sending…" : status === "sent" ? "Message sent" : "Send message"}
            </Button>

            <p className="text-xs text-ink-faint">
              Or{" "}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-cyan underline decoration-accent-cyan/30 underline-offset-4 hover:decoration-accent-cyan"
              >
                message me on WhatsApp
              </a>
            </p>
          </div>

          {/* Status region — announced to screen readers on change. */}
          <div role="status" aria-live="polite" className="min-h-6">
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <motion.p
                  key="sent"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                  className="mt-4 flex items-center gap-2 text-sm text-emerald-400"
                >
                  <CheckIcon />
                  Thanks — your message is on its way. I&apos;ll reply by email.
                </motion.p>
              ) : serverMessage ? (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                  className="mt-4 text-sm text-rose-400"
                >
                  {serverMessage}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------------------
   Field
   -------------------------------------------------------------------------- */

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  multiline = false,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;

  const base = cn(
    "w-full rounded-xl border bg-white/[0.02] px-4 py-3 text-sm text-ink",
    "placeholder:text-ink-faint/70",
    "transition-colors duration-200 outline-none",
    error
      ? "border-rose-500/50 focus:border-rose-400"
      : "border-line focus:border-accent-cyan/60 focus:bg-white/[0.04]",
  );

  return (
    <div className={multiline ? "" : "min-w-0"}>
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-xs uppercase tracking-wider text-ink-faint"
      >
        {label}
      </label>

      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={6}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(base, "resize-y")}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={base}
        />
      )}

      {error ? (
        <p id={errorId} className="mt-2 text-xs text-rose-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}
