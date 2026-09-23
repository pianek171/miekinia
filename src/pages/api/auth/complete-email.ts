import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";

const EMAIL_LINK_TYPES = new Set(["invite", "magiclink", "recovery", "signup"]);

export const POST: APIRoute = async (context) => {
  const body: unknown = await context.request.json().catch(() => null);

  if (
    !body ||
    typeof body !== "object" ||
    !("accessToken" in body) ||
    !("refreshToken" in body) ||
    !("type" in body) ||
    typeof body.accessToken !== "string" ||
    typeof body.refreshToken !== "string" ||
    typeof body.type !== "string" ||
    !EMAIL_LINK_TYPES.has(body.type)
  ) {
    return Response.json({ error: "Invalid authentication link" }, { status: 400 });
  }

  const supabase = createClient(context.request.headers, context.cookies);
  if (!supabase) {
    console.error("Supabase email session completion failed: missing configuration");
    return Response.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const { error } = await supabase.auth.setSession({
    access_token: body.accessToken,
    refresh_token: body.refreshToken,
  });

  if (error) {
    console.error("Supabase email session completion failed", {
      code: error.code,
      message: error.message,
      status: error.status,
    });
    return Response.json({ error: "Invalid or expired authentication link" }, { status: 401 });
  }

  return Response.json({
    redirectTo: body.type === "invite" || body.type === "recovery" ? "/auth/set-password" : "/dashboard",
  });
};
