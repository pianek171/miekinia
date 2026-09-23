import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";

export const POST: APIRoute = async (context) => {
  const password = (await context.request.formData()).get("password");
  const supabase = createClient(context.request.headers, context.cookies);

  if (!supabase) {
    return context.redirect(`/auth/signin?error=${encodeURIComponent("Supabase is not configured")}`);
  }

  if (typeof password !== "string" || password.length < 8) {
    return context.redirect(
      `/auth/set-password?error=${encodeURIComponent("Password must contain at least 8 characters")}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return context.redirect(
      `/auth/signin?error=${encodeURIComponent("Your session has expired. Request a new invitation link.")}`,
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return context.redirect(`/auth/set-password?error=${encodeURIComponent(error.message)}`);
  }

  return context.redirect("/dashboard");
};
