import type { SupabaseClient } from "@supabase/supabase-js";
import { REPORT_RECIPIENTS, type ReportTemplate } from "@/types";

export async function loadReportTemplates(supabase: SupabaseClient): Promise<ReportTemplate[]> {
  const { data, error } = await supabase
    .from("report_templates")
    .select("recipient, email, subject, body, updated_at")
    .in(
      "recipient",
      REPORT_RECIPIENTS.map((recipient) => recipient.key),
    );

  if (error) {
    throw new Error("Could not load report templates", { cause: error });
  }

  const templatesByRecipient = new Map((data as ReportTemplate[]).map((template) => [template.recipient, template]));

  return REPORT_RECIPIENTS.map((recipient) => {
    const template = templatesByRecipient.get(recipient.key);
    if (!template) {
      throw new Error(`Missing report template for ${recipient.key}`);
    }
    return template;
  });
}
