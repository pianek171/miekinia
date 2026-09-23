import { useState } from "react";
import { Save } from "lucide-react";
import { REPORT_RECIPIENTS, type RecipientKey, type ReportTemplate } from "@/types";

interface Props {
  templates: ReportTemplate[];
}

interface EditorState {
  error?: string;
  success?: string;
  saving: boolean;
}

const TOKEN_REFERENCE = ["{{full_name}}", "{{address}}", "{{odor_level}}", "{{odor_pattern}}"];

function emptyStates(): Record<RecipientKey, EditorState> {
  return {
    zuk: { saving: false },
    burmistrz: { saving: false },
  };
}

function validate(template: ReportTemplate): string | undefined {
  if (!template.email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(template.email.trim())) return "Enter a valid email address";
  if (!template.subject.trim()) return "Subject is required";
  if (template.subject.trim().length > 200) return "Subject must be at most 200 characters";
  if (!template.body.trim()) return "Message body is required";
  if (template.body.trim().length > 10_000) return "Message body must be at most 10,000 characters";
  return undefined;
}

function isReportTemplate(value: unknown): value is ReportTemplate {
  if (!value || typeof value !== "object") return false;
  const template = value as Record<string, unknown>;
  return (
    (template.recipient === "zuk" || template.recipient === "burmistrz") &&
    typeof template.email === "string" &&
    typeof template.subject === "string" &&
    typeof template.body === "string" &&
    typeof template.updated_at === "string"
  );
}

function responseMessage(value: unknown): { error?: string; template?: ReportTemplate } {
  if (!value || typeof value !== "object") return {};
  const response = value as Record<string, unknown>;
  return {
    ...(typeof response.error === "string" ? { error: response.error } : {}),
    ...(isReportTemplate(response.template) ? { template: response.template } : {}),
  };
}

export default function TemplateEditor({ templates: initialTemplates }: Props) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [states, setStates] = useState(emptyStates);

  function updateField(recipient: RecipientKey, field: "email" | "subject" | "body", value: string) {
    setTemplates((current) =>
      current.map((template) => (template.recipient === recipient ? { ...template, [field]: value } : template)),
    );
    setStates((current) => ({ ...current, [recipient]: { saving: false } }));
  }

  async function saveTemplate(recipient: RecipientKey) {
    const template = templates.find((item) => item.recipient === recipient);
    if (!template) return;

    const validationError = validate(template);
    if (validationError) {
      setStates((current) => ({ ...current, [recipient]: { saving: false, error: validationError } }));
      return;
    }

    setStates((current) => ({ ...current, [recipient]: { saving: true } }));

    try {
      const response = await fetch(`/api/admin/report-templates/${recipient}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: template.email, subject: template.subject, body: template.body }),
      });
      const responseBody: unknown = await response.json().catch(() => null);
      const result = responseMessage(responseBody);

      if (!response.ok || !result.template) {
        setStates((current) => ({
          ...current,
          [recipient]: { saving: false, error: result.error ?? "Could not save the template" },
        }));
        return;
      }

      const savedTemplate = result.template;
      setTemplates((current) => current.map((item) => (item.recipient === recipient ? savedTemplate : item)));
      setStates((current) => ({ ...current, [recipient]: { saving: false, success: "Saved" } }));
    } catch {
      setStates((current) => ({ ...current, [recipient]: { saving: false, error: "Could not save the template" } }));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {REPORT_RECIPIENTS.map((recipient) => {
        const template = templates.find((item) => item.recipient === recipient.key);
        if (!template) return null;
        const state = states[recipient.key];
        const idPrefix = `template-${recipient.key}`;

        return (
          <section
            key={recipient.key}
            className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:p-6"
          >
            <h2 className="text-xl font-semibold text-white">{recipient.label}</h2>
            <p className="mt-1 text-sm text-blue-100/70">Destination and message template for this recipient.</p>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-blue-100" htmlFor={`${idPrefix}-email`}>
                Destination email
                <input
                  id={`${idPrefix}-email`}
                  type="email"
                  value={template.email}
                  onChange={(event) => {
                    updateField(recipient.key, "email", event.target.value);
                  }}
                  className="mt-1 w-full rounded-lg border border-white/20 bg-slate-950/40 px-3 py-2 text-white outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-300/30"
                />
              </label>

              <label className="block text-sm font-medium text-blue-100" htmlFor={`${idPrefix}-subject`}>
                Email subject
                <input
                  id={`${idPrefix}-subject`}
                  value={template.subject}
                  onChange={(event) => {
                    updateField(recipient.key, "subject", event.target.value);
                  }}
                  className="mt-1 w-full rounded-lg border border-white/20 bg-slate-950/40 px-3 py-2 text-white outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-300/30"
                />
              </label>

              <label className="block text-sm font-medium text-blue-100" htmlFor={`${idPrefix}-body`}>
                Message body
                <textarea
                  id={`${idPrefix}-body`}
                  value={template.body}
                  onChange={(event) => {
                    updateField(recipient.key, "body", event.target.value);
                  }}
                  rows={12}
                  className="mt-1 w-full resize-y rounded-lg border border-white/20 bg-slate-950/40 px-3 py-2 text-white outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-300/30"
                />
              </label>
            </div>

            <div className="mt-4 rounded-lg border border-blue-200/20 bg-blue-950/30 p-3 text-sm text-blue-100/80">
              <p className="font-medium text-blue-100">Available report tokens</p>
              <p className="mt-1 font-mono text-xs break-words">{TOKEN_REFERENCE.join(" · ")}</p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void saveTemplate(recipient.key)}
                disabled={state.saving}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="size-4" />
                {state.saving ? "Saving…" : `Save ${recipient.label}`}
              </button>
              <p aria-live="polite" className={state.error ? "text-sm text-red-200" : "text-sm text-emerald-200"}>
                {state.error ?? state.success}
              </p>
            </div>
          </section>
        );
      })}
    </div>
  );
}
