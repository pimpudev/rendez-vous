"use client";

import { useActionState } from "react";
import { loginAdmin, type LoginState } from "./actions";

export default function AdminLoginForm({ returnTo }: { returnTo: string }) {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(loginAdmin, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={returnTo} />
      <label className="block text-sm font-semibold text-slate-800">
        Nom d’utilisateur
        <input required name="username" autoComplete="username" className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200" />
      </label>
      <label className="block text-sm font-semibold text-slate-800">
        Mot de passe
        <input required name="password" type="password" autoComplete="current-password" className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200" />
      </label>
      {state?.error && <p role="alert" className="text-sm font-semibold text-red-700">{state.error}</p>}
      <button type="submit" disabled={isPending} className="min-h-12 w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-wait disabled:opacity-60">
        {isPending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
