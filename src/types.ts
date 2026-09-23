export const REPORT_RECIPIENTS = [
  { key: "zuk", label: "ZUK" },
  { key: "burmistrz", label: "Burmistrz" },
] as const;

export type RecipientKey = (typeof REPORT_RECIPIENTS)[number]["key"];

export interface ReportTemplate {
  recipient: RecipientKey;
  email: string;
  subject: string;
  body: string;
  updated_at: string;
}

export function isRecipientKey(value: string): value is RecipientKey {
  return REPORT_RECIPIENTS.some((recipient) => recipient.key === value);
}
