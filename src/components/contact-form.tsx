import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { submitInquiry } from "@/lib/properties.functions";
import type { Property } from "@/lib/site-data";

const schema = z.object({
  name: z.string().trim().min(2, "Please share your full name.").max(100),
  phone: z.string().trim().min(7, "A valid phone helps us reach you.").max(30),
  email: z.string().trim().email("A valid email is required.").max(200),
  property: z.string().max(200).optional(),
  message: z.string().trim().min(5, "Tell us a little more.").max(2000),
  contactMethod: z.enum(["email", "phone", "text"]),
});

const inputCls =
  "w-full bg-transparent border-0 border-b border-foreground/20 focus:border-gold outline-none py-3 text-sm placeholder:text-muted-foreground transition-colors";

export function ContactForm({
  properties = [],
  defaultPropertySlug,
}: {
  properties?: Property[];
  defaultPropertySlug?: string;
}) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const send = useServerFn(submitInquiry);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      property: fd.get("property") ?? undefined,
      message: fd.get("message"),
      contactMethod: fd.get("contactMethod"),
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errs[String(issue.path[0])] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setServerError(null);
    setBusy(true);
    try {
      const message = `[Preferred contact: ${parsed.data.contactMethod}] ${parsed.data.message}`;
      await send({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          message,
          property_slug: parsed.data.property || defaultPropertySlug || null,
        },
      });
      setSent(true);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="border border-gold/40 bg-muted/60 p-10 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold-dark" />
        <h3 className="mt-5 font-serif text-3xl">Message received.</h3>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
          Thank you — Tamandeep will personally follow up shortly using your preferred contact method.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground mb-1">
            Full Name
          </label>
          <input id="name" name="name" required className={inputCls} placeholder="Jane Doe" />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground mb-1">
            Phone
          </label>
          <input id="phone" name="phone" required className={inputCls} placeholder="(555) 555-5555" />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground mb-1">
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputCls} placeholder="you@example.com" />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
      </div>

      {properties.length > 0 && (
        <div>
          <label htmlFor="property" className="block text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground mb-1">
            Interested Property
          </label>
          <select
            id="property"
            name="property"
            defaultValue={defaultPropertySlug ?? ""}
            className={inputCls}
          >
            <option value="">General inquiry</option>
            {properties.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title} — {p.city}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="message" className="block text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground mb-1">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className={inputCls + " resize-none"}
          placeholder="Tell Tamandeep about what you're looking for…"
        />
        {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
      </div>

      <div>
        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground mb-3">
          Preferred contact method
        </p>
        <div className="flex flex-wrap gap-6 text-sm">
          {(["email", "phone", "text"] as const).map((m) => (
            <label key={m} className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contactMethod"
                value={m}
                defaultChecked={m === "email"}
                className="accent-[var(--gold)]"
              />
              <span className="capitalize">{m}</span>
            </label>
          ))}
        </div>
      </div>

      {serverError && <p className="text-xs text-destructive">{serverError}</p>}

      <button type="submit" disabled={busy} className="btn-gold justify-self-start mt-2 disabled:opacity-60">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
