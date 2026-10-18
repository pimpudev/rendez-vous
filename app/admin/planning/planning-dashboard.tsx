"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../../lib/supabase";

const weekdays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const hourlySlots = Array.from({ length: 10 }, (_, index) => {
  const start = index + 10;
  const end = start + 1;
  return `${String(start).padStart(2, "0")}:00–${String(end).padStart(2, "0")}:00`;
});

type AccessStatus = "checking" | "signed-out" | "ready" | "denied" | "error" | "unconfigured";

export default function PlanningDashboard() {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(() =>
    getSupabaseClient() ? "checking" : "unconfigured",
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [savingSlot, setSavingSlot] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let isActive = true;
    const loadAdminSlots = async (client: SupabaseClient, userId: string) => {
      const { data: membership, error: membershipError } = await client
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!isActive) return;
      if (membershipError) {
        setErrorMessage("Impossible de vérifier les droits administrateur.");
        setAccessStatus("error");
        return;
      }
      if (!membership) {
        await client.auth.signOut();
        setAccessStatus("denied");
        return;
      }

      const { data, error } = await client
        .from("teacher_availability_slots")
        .select("slot")
        .order("slot");
      if (!isActive) return;
      if (error) {
        setErrorMessage("Impossible de charger le planning. Vérifiez que la migration des disponibilités a été exécutée.");
        setAccessStatus("error");
        return;
      }

      setAvailableSlots((data ?? []).map((row) => row.slot as string));
      setAccessStatus("ready");
    };

    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!isActive) return;
      if (error) {
        setErrorMessage("Impossible de vérifier la session administrateur.");
        setAccessStatus("error");
      } else if (!data.session) {
        setAccessStatus("signed-out");
      } else {
        await loadAdminSlots(supabase, data.session.user.id);
      }
    };

    void initialize();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (accessStatus !== "ready") return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-teacher-availability")
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_availability_slots" }, async () => {
        const { data, error } = await supabase.from("teacher_availability_slots").select("slot").order("slot");
        if (!error) setAvailableSlots((data ?? []).map((row) => row.slot as string));
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [accessStatus]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setErrorMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMessage("Connexion impossible. Vérifiez votre e-mail et votre mot de passe.");
      return;
    }

    const { data: membership, error: membershipError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (membershipError || !membership) {
      await supabase.auth.signOut();
      setAccessStatus("denied");
      return;
    }

    const { data: slots, error: slotsError } = await supabase
      .from("teacher_availability_slots")
      .select("slot")
      .order("slot");
    if (slotsError) {
      setErrorMessage("Impossible de charger le planning. Vérifiez que la migration des disponibilités a été exécutée.");
      setAccessStatus("error");
      return;
    }

    setAvailableSlots((slots ?? []).map((row) => row.slot as string));
    setAccessStatus("ready");
  }

  async function toggleSlot(slot: string) {
    const supabase = getSupabaseClient();
    if (!supabase || savingSlot) return;

    setSavingSlot(slot);
    setErrorMessage("");
    const result = availableSlots.includes(slot)
      ? await supabase.from("teacher_availability_slots").delete().eq("slot", slot)
      : await supabase.from("teacher_availability_slots").insert({ slot });

    if (result.error) {
      setErrorMessage("Impossible d’enregistrer ce créneau. Vérifiez votre accès administrateur et réessayez.");
    } else {
      setAvailableSlots((current) => current.includes(slot)
        ? current.filter((item) => item !== slot)
        : [...current, slot]);
    }
    setSavingSlot(null);
  }

  if (accessStatus !== "ready") {
    return (
      <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {accessStatus === "checking" && <p role="status" className="text-sm text-slate-600">Vérification de l’accès administrateur…</p>}
        {accessStatus === "signed-out" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <h2 className="text-xl font-bold text-slate-900">Connexion administrateur</h2>
            <label className="block text-sm font-semibold text-slate-800">
              E-mail
              <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Mot de passe
              <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 px-4 py-3" />
            </label>
            {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
            <button type="submit" className="min-h-11 rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600">Se connecter</button>
          </form>
        )}
        {accessStatus === "unconfigured" && <p role="alert" className="text-sm text-red-700">Supabase n’est pas configuré pour gérer le planning.</p>}
        {accessStatus === "denied" && <p role="alert" className="text-sm text-red-700">Ce compte ne dispose pas des droits administrateur.</p>}
        {accessStatus === "error" && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Disponibilités proposées</h2>
          <p className="mt-2 text-sm text-slate-600">Cliquez sur les horaires que les nouveaux élèves peuvent réserver.</p>
        </div>
        <p className="text-sm font-semibold text-slate-600">{availableSlots.length} créneau{availableSlots.length > 1 ? "x" : ""} ouvert{availableSlots.length > 1 ? "s" : ""}</p>
      </div>
      {errorMessage && <p role="alert" className="mt-4 text-sm text-red-700">{errorMessage}</p>}
      <div className="mt-5 overflow-x-auto pb-2">
        <table className="w-full min-w-[700px] border-separate border-spacing-1 text-center text-xs">
          <thead>
            <tr>
              <th scope="col" className="w-16 px-2 py-2 text-left font-semibold text-slate-600">Heure</th>
              {weekdays.map((day) => <th key={day} scope="col" className="px-2 py-2 font-semibold text-slate-800">{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {hourlySlots.map((time, index) => (
              <tr key={time}>
                <th scope="row" className="whitespace-nowrap px-2 py-1 text-left font-medium text-slate-600">{index + 10} h</th>
                {weekdays.map((day) => {
                  const slot = `${day} ${time}`;
                  const isOpen = availableSlots.includes(slot);
                  return (
                    <td key={slot} className="p-0">
                      <button
                        type="button"
                        aria-label={`${isOpen ? "Fermer" : "Ouvrir"} ${day}, ${time}`}
                        aria-pressed={isOpen}
                        disabled={savingSlot !== null}
                        onClick={() => void toggleSlot(slot)}
                        className={`h-10 w-full rounded-md border text-xs font-semibold transition-colors disabled:opacity-60 ${isOpen ? "border-emerald-700 bg-emerald-600 text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-emerald-400 hover:bg-emerald-50"}`}
                      >
                        {isOpen ? "Ouvert" : "Fermé"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}