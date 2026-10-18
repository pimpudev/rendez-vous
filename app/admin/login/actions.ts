"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_LOGIN_EMAIL, ADMIN_USERNAME } from "../../../lib/admin-auth";

export type LoginState = { error?: string } | undefined;

function getSafeReturnTo(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/admin";
  if (value === "/admin" || value.startsWith("/admin/") && !value.startsWith("/admin/login")) return value;
  return "/admin";
}

export async function loginAdmin(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (username !== ADMIN_USERNAME || !password) {
    return { error: "Identifiant ou mot de passe incorrect." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { error: "Le service de connexion n’est pas configuré." };

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({ email: ADMIN_LOGIN_EMAIL, password });
  if (error || !data.user) return { error: "Identifiant ou mot de passe incorrect." };

  const { data: membership, error: membershipError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (membershipError || !membership || data.user.email?.toLowerCase() !== ADMIN_LOGIN_EMAIL) {
    await supabase.auth.signOut();
    return { error: "Ce compte ne dispose pas des droits administrateur." };
  }

  redirect(getSafeReturnTo(formData.get("next")));
}
