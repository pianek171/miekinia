import type { APIRoute } from "astro";
import { z } from "zod";
import { createClient } from "@/lib/supabase";
import { isRecipientKey, type ReportTemplate } from "@/types";

export const prerender = false;

const updateTemplateSchema = z.object({
  email: z
    .string()
    .trim()
    .refine((value) => z.email().safeParse(value).success, "Enter a valid email address"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be at most 200 characters"),
  body: z
    .string()
    .trim()
    .min(1, "Message body is required")
    .max(10_000, "Message body must be at most 10,000 characters"),
});

export const PUT: APIRoute = async (context) => {
  const recipient = context.params.recipient;
  const supabase = createClient(context.request.headers, context.cookies);

  if (!supabase) {
    return Response.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Authentication is required" }, { status: 401 });
  }

  if (!recipient || !isRecipientKey(recipient)) {
    return Response.json({ error: "Unknown recipient" }, { status: 404 });
  }

  const payload: unknown = await context.request.json().catch(() => null);
  const parsed = updateTemplateSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      {
        error: "Template is invalid",
        fields: parsed.error.issues.map((issue) => ({ field: issue.path[0], message: issue.message })),
      },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("report_templates")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("recipient", recipient)
    .select("recipient, email, subject, body, updated_at")
    .maybeSingle();

  if (error) {
    return Response.json({ error: "Could not save the template" }, { status: 500 });
  }

  if (!data) {
    return Response.json({ error: "Unknown recipient" }, { status: 404 });
  }

  return Response.json({ template: data satisfies ReportTemplate });
};
