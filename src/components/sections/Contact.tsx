import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ContactFormSubmission } from "@/lib/templateGlossary";

/**
 * Contact — the contact form section (templateGlossary decisions #18 + #20).
 *
 * Anchor id is "contact-form" so CONTACT_ANCHOR ("#contact-form") CTAs land
 * here. Writes to the contact_messages table.
 *
 * Columns deliberately NOT sent from the client: user_agent, ip_hash,
 * is_read, is_spam. Those are server-side/default concerns — a client that
 * sets its own spam flag is not a spam filter.
 *
 * Fields per ContactFormSubmission: name and email required; role_title,
 * organization, message optional (#20).
 *
 * The success message claims only that the message was stored. It does not
 * promise a reply time or delivery — no notification pipeline exists yet.
 */

type Status = "idle" | "sending" | "sent" | "error";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const EMPTY: ContactFormSubmission = {
  name: "",
  email: "",
  role_title: null,
  organization: null,
  message: null,
};

export default function Contact() {
  const [form, setForm] = useState<ContactFormSubmission>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof ContactFormSubmission) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value || null }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name?.trim() || !form.email?.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setError("That email address doesn't look right.");
      return;
    }

    setStatus("sending");
    const { error: insertError } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      role_title: form.role_title,
      organization: form.organization,
      message: form.message,
    });

    if (insertError) {
      console.warn("[Contact] insert failed", insertError);
      setStatus("error");
      setError("That didn't send. Please try again, or email me directly.");
      return;
    }

    setStatus("sent");
    setForm(EMPTY);
  }

  return (
    <section id="contact-form" className="sec-contact sec-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 col-12 mx-auto">
            <h5 className="mb-4">Get in touch</h5>

            {status === "sent" ? (
              <p className="fs-7" role="status">
                Your message is saved. I'll follow up at the email you provided.
              </p>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-md-6 col-12">
                    <label className="form-label fs-8" htmlFor="cf-name">
                      Name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="cf-name"
                      className="form-control"
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <label className="form-label fs-8" htmlFor="cf-email">
                      Email <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="cf-email"
                      className="form-control"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <label className="form-label fs-8" htmlFor="cf-role">
                      Role or title
                    </label>
                    <input
                      id="cf-role"
                      className="form-control"
                      type="text"
                      value={form.role_title ?? ""}
                      onChange={set("role_title")}
                      autoComplete="organization-title"
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <label className="form-label fs-8" htmlFor="cf-org">
                      Company or organization
                    </label>
                    <input
                      id="cf-org"
                      className="form-control"
                      type="text"
                      value={form.organization ?? ""}
                      onChange={set("organization")}
                      autoComplete="organization"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fs-8" htmlFor="cf-message">
                      Message
                    </label>
                    <textarea
                      id="cf-message"
                      className="form-control"
                      rows={5}
                      value={form.message ?? ""}
                      onChange={set("message")}
                    />
                  </div>
                  <div className="col-12 d-flex align-items-center gap-3">
                    <button
                      type="submit"
                      className="btn btn-dark hover-up"
                      disabled={status === "sending"}
                    >
                      {status === "sending" ? "Sending…" : "Send message"}
                    </button>
                    {error && (
                      <p className="fs-8 m-0" role="alert">
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
