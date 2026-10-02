"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase";

type CourseType = "individual" | "group" | "individual_group";
type StudentStatus = "waitlist" | "to_validate" | "payment_pending" | "enrolled" | "paused" | "finished";
type AccessStatus = "checking" | "demo" | "signed-out" | "denied" | "ready" | "error";

type Reservation = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  french_level: string | null;
  french_levels: string[];
  registration_type: 1 | 2 | 3;
  course_type: CourseType;
  student_status: StudentStatus;
  offer: string;
  offer_details: string;
  availability_slots: string[];
  selected_group_id: string | null;
  comment: string;
  is_demo: boolean;
  created_at: string;
};

type AdminLoadResult =
  | { status: "ready"; reservations: Reservation[] }
  | { status: "denied" }
  | { status: "error"; message: string };

const demoReservation: Reservation = {
  id: "demo-reservation-001",
  first_name: "Camille",
  last_name: "Martin",
  email: "camille.martin@example.com",
  french_level: "B1",
  french_levels: ["B1"],
  registration_type: 3,
  course_type: "group",
  student_status: "waitlist",
  offer: "OFFRE DE COURS GROUPÉ XYZ",
  offer_details: "Disponibilités : samedi 10:00–11:00, samedi 11:00–12:00",
  availability_slots: ["Samedi 10:00–11:00", "Samedi 11:00–12:00"],
  selected_group_id: null,
  comment: "",
  is_demo: true,
  created_at: "2026-09-01T09:00:00.000Z",
};

async function loadAdminReservations(
  supabase: SupabaseClient,
  userId: string,
): Promise<AdminLoadResult> {
  const { data: membership, error: membershipError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) {
    return { status: "error", message: "Impossible de vérifier les droits administrateur. Vérifiez le schéma Supabase." };
  }

  if (!membership) return { status: "denied" };

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { status: "error", message: "Impossible de charger les réservations. Vérifiez le schéma Supabase." };
  }

  return { status: "ready", reservations: (data ?? []) as Reservation[] };
}

const selectClassName =
  "min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200";
const frenchLevels = ["COMPLETE BEGINNER", "A1", "A2", "B1", "B2", "C1", "C2"];

export default function AdminDashboard() {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(() =>
    getSupabaseClient() ? "checking" : "demo",
  );
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    getSupabaseClient() ? [] : [demoReservation],
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const client: SupabaseClient = supabase;
    let isMounted = true;

    async function initialize() {
      const { data, error } = await client.auth.getSession();
      if (!isMounted) return;

      if (error) {
        setLoginError("Impossible de vérifier la session administrateur.");
        setAccessStatus("error");
        return;
      }

      if (!data.session) {
        setAccessStatus("signed-out");
        return;
      }

      await refreshAdminData(client, data.session.user.id);
    }

    void initialize();
    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshAdminData(supabase: SupabaseClient, userId: string) {
    const result = await loadAdminReservations(supabase, userId);

    if (result.status === "denied") {
      await supabase.auth.signOut();
      setAccessStatus("denied");
      return;
    }

    if (result.status === "error") {
      setLoginError(result.message);
      setAccessStatus("error");
      return;
    }

    setReservations(result.reservations);
    setAccessStatus("ready");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseClient();

    if (!supabase) {
      setLoginError("Supabase n’est pas configuré. Utilisez la démo ou configurez les variables d’environnement.");
      return;
    }

    setLoginError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoginError("Connexion impossible. Vérifiez votre e-mail et votre mot de passe.");
      return;
    }

    await refreshAdminData(supabase, data.user.id);
  }

  async function updateReservation(
    reservationId: string,
    updates: Partial<Pick<Reservation, "french_level" | "french_levels" | "course_type" | "student_status" | "offer" | "offer_details" | "comment">>,
  ) {
    if (accessStatus === "demo") {
      setReservations((current) => current.map((reservation) =>
        reservation.id === reservationId ? { ...reservation, ...updates } : reservation,
      ));
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSavingId(reservationId);
    setSaveError("");

    const { data, error } = await supabase
      .from("reservations")
      .update(updates)
      .eq("id", reservationId)
      .select("*")
      .single();

    setSavingId(null);

    if (error) {
      setSaveError("Modification non enregistrée. Vérifiez votre connexion puis réessayez.");
      return;
    }

    setReservations((current) => current.map((reservation) =>
      reservation.id === reservationId ? (data as Reservation) : reservation,
    ));
  }

  async function handleLogout() {
    await getSupabaseClient()?.auth.signOut();
    setReservations([]);
    setAccessStatus("signed-out");
  }

  if (accessStatus === "checking") {
    return <p role="status" className="py-12 text-center text-slate-600">Vérification de l’accès…</p>;
  }

  if (accessStatus === "signed-out" || accessStatus === "denied" || accessStatus === "error") {
    return (
      <section className="mx-auto mb-16 max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <h1 className="text-2xl font-bold text-slate-900">Connexion administrateur</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Connectez-vous avec un compte inscrit dans la liste des administrateurs.
        </p>
        {accessStatus === "denied" && (
          <p role="alert" className="mt-4 text-sm font-semibold text-red-700">Ce compte n’a pas les droits administrateur.</p>
        )}
        {loginError && <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{loginError}</p>}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-800">
            E-mail
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={selectClassName}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Mot de passe
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={selectClassName}
            />
          </label>
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-500">
            Se connecter
          </button>
        </form>
      </section>
    );
  }

  const toValidate = reservations.filter((reservation) => reservation.student_status === "to_validate").length;
  const waitingList = reservations.filter((reservation) => reservation.student_status === "waitlist").length;

  return (
    <section className="mx-auto mb-16 max-w-6xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Administration</h1>
          <p className="mt-2 text-sm text-slate-600">
            {accessStatus === "demo" ? "Aperçu avec données fictives — les modifications ne sont pas enregistrées." : "Gestion des demandes de réservation."}
          </p>
        </div>
        {accessStatus === "ready" && (
          <button type="button" onClick={handleLogout} className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-red-600">
            Se déconnecter
          </button>
        )}
      </div>

      {accessStatus === "demo" && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
          Mode démo : la page est publique et affiche un client fictif. Configurez Supabase et l’accès administrateur avant d’y consulter des données réelles.
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Clients</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{reservations.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">À valider</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{toValidate}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Liste d’attente</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{waitingList}</p>
        </div>
      </div>

      {saveError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{saveError}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3">Nom</th>
              <th scope="col" className="px-4 py-3">Prénom</th>
              <th scope="col" className="px-4 py-3">Niveau</th>
              <th scope="col" className="px-4 py-3">Cours</th>
              <th scope="col" className="px-4 py-3">Statut</th>
              <th scope="col" className="px-4 py-3">Offre</th>
              <th scope="col" className="px-4 py-3">Commentaire</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {reservations.map((reservation) => {
              const isSaving = savingId === reservation.id;
              const frenchLevel = reservation.french_level ?? reservation.french_levels[0] ?? "";

              return (
                <tr key={reservation.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{reservation.last_name}</p>
                    {reservation.is_demo && <span className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">Démo</span>}
                    <p className="mt-1 text-xs text-slate-500">Inscription type {reservation.registration_type}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <p className="font-semibold text-slate-900">{reservation.first_name}</p>
                    <a href={`mailto:${reservation.email}`} className="mt-1 inline-block text-xs text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-red-600">{reservation.email}</a>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      aria-label={`Niveau de français de ${reservation.first_name} ${reservation.last_name}`}
                      value={frenchLevel}
                      disabled={isSaving}
                      onChange={(event) => void updateReservation(reservation.id, { french_level: event.target.value, french_levels: event.target.value ? [event.target.value] : [] })}
                      className={selectClassName}
                    >
                      <option value="">À préciser</option>
                      {frenchLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      aria-label={`Cours de ${reservation.first_name} ${reservation.last_name}`}
                      value={reservation.course_type}
                      disabled={isSaving}
                      onChange={(event) => void updateReservation(reservation.id, { course_type: event.target.value as CourseType })}
                      className={selectClassName}
                    >
                      <option value="individual">INDIVIDUEL</option>
                      <option value="group">GROUPE</option>
                      <option value="individual_group">INDIVIDUEL + GROUPE</option>
                    </select>
                  </td>
                  <td className="min-w-56 px-4 py-4">
                    <select
                      aria-label={`Statut de ${reservation.first_name} ${reservation.last_name}`}
                      value={reservation.student_status}
                      disabled={isSaving}
                      onChange={(event) => void updateReservation(reservation.id, { student_status: event.target.value as StudentStatus })}
                      className={selectClassName}
                    >
                      <option value="waitlist">LISTE D’ATTENTE</option>
                      <option value="to_validate">À VALIDER</option>
                      <option value="payment_pending">ATTENTE DE RÈGLEMENT</option>
                      <option value="enrolled">INSCRIT</option>
                      <option value="paused">EN PAUSE</option>
                      <option value="finished">FINI</option>
                    </select>
                  </td>
                  <td className="min-w-64 px-4 py-4">
                    <input
                      aria-label={`Offre de ${reservation.first_name} ${reservation.last_name}`}
                      defaultValue={reservation.offer}
                      disabled={isSaving}
                      onBlur={(event) => {
                        if (event.target.value !== reservation.offer) void updateReservation(reservation.id, { offer: event.target.value });
                      }}
                      className={selectClassName}
                    />
                    <textarea
                      aria-label={`Détails de l’offre de ${reservation.first_name} ${reservation.last_name}`}
                      defaultValue={reservation.offer_details}
                      rows={3}
                      disabled={isSaving}
                      onBlur={(event) => {
                        if (event.target.value !== reservation.offer_details) void updateReservation(reservation.id, { offer_details: event.target.value });
                      }}
                      className={`${selectClassName} mt-2`}
                    />
                  </td>
                  <td className="min-w-56 px-4 py-4">
                    <textarea
                      aria-label={`Commentaire de ${reservation.first_name} ${reservation.last_name}`}
                      defaultValue={reservation.comment}
                      rows={3}
                      disabled={isSaving}
                      onBlur={(event) => {
                        if (event.target.value !== reservation.comment) void updateReservation(reservation.id, { comment: event.target.value });
                      }}
                      className={selectClassName}
                    />
                  </td>
                </tr>
              );
            })}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-600">Aucun étudiant pour le moment.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}