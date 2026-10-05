"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const TOPICS = [
  "Intellectual Property",
  "Trademark",
  "Patent",
  "Market Entry",
  "Regulatory Coordination",
  "Technology Transfer",
  "Innovation Partnership",
  "International Law Firm Partnership",
  "Other"
] as const;

/**
 * Formulário de contato da landing internacional.
 * Reaproveita o backend existente (/api/contact → contact_messages + SMTP) sem
 * criar novos endpoints: Company / Country / topic são incorporados ao campo
 * `subject`/`message` aceitos pela API. Anti-spam via honeypot (website_sweet).
 */
export default function IntlContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const name = fd.get("name")?.toString().trim() ?? "";
    const email = fd.get("email")?.toString().trim() ?? "";
    const phone = fd.get("phone")?.toString().trim() ?? "";
    const company = fd.get("company")?.toString().trim() ?? "";
    const country = fd.get("country")?.toString().trim() ?? "";
    const topic = fd.get("topic")?.toString().trim() ?? "";
    const message = fd.get("message")?.toString().trim() ?? "";

    // Compõe o corpo com os campos adicionais (backend aceita subject/message).
    const fullMessage = [
      company ? `Company: ${company}` : "",
      country ? `Country: ${country}` : "",
      topic ? `Area of interest: ${topic}` : "",
      "",
      message
    ]
      .join("\n")
      .trim();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject: topic
            ? `International inquiry — ${topic}`
            : "International inquiry",
          message: fullMessage,
          website_sweet: fd.get("website_sweet")?.toString() ?? ""
        })
      });

      const data = (await res.json().catch(() => null)) as
        | { ok: boolean; error?: string | null }
        | null;

      if (res.status === 429 || !res.ok || !data?.ok) {
        setError(
          data?.error || "We could not send your message. Please try again."
        );
        return;
      }
      setSent(true);
      form.reset();
    } catch {
      setError("We could not send your message right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="card p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold-500" />
        <h3 className="mt-4 font-display text-xl font-semibold text-navy-900">
          Inquiry sent
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-navy-600">
          Thank you for reaching out. Your message has been registered and we
          will get back to you as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="btn-ghost mt-6"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
      {error && (
        <p
          role="alert"
          className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Honeypot anti-robô (invisível para humanos). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website_sweet" className="sr-only">
          Leave blank
        </label>
        <input
          id="website_sweet"
          name="website_sweet"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label-field">
            Name *
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            className="input-field"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="label-field">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input-field"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label htmlFor="company" className="label-field">
            Company
          </label>
          <input
            id="company"
            name="company"
            className="input-field"
            placeholder="Your company or firm"
          />
        </div>
        <div>
          <label htmlFor="country" className="label-field">
            Country
          </label>
          <input
            id="country"
            name="country"
            className="input-field"
            placeholder="Your country"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="phone" className="label-field">
            Phone / WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="input-field"
            placeholder="+00 000 000 000"
          />
        </div>
      </div>

      <div>
        <label htmlFor="topic" className="label-field">
          What can we help you with?
        </label>
        <select id="topic" name="topic" className="input-field" defaultValue="">
          <option value="" disabled>
            Select an option
          </option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="label-field">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          rows={6}
          className="input-field"
          placeholder="Tell us about your objectives in Brazil, your technology or your client's matter…"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full sm:w-auto"
        data-analytics="intl_contact_submit"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Send inquiry
          </>
        )}
      </button>

      <p className="text-xs text-navy-400">
        By submitting, you agree to be contacted in response to this request.
        Your data is processed confidentially and stored securely, in line with
        our privacy practices (LGPD).
      </p>
    </form>
  );
}
