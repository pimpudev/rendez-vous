"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase";

type PaymentStatus = "pending" | "paid";
type CourseStatus = "unassigned" | "individual" | "group_pending" | "group_assigned";
type AccessStatus = "checking" | "demo" | "signed-out" | "denied" | "ready" | "error";

type Reservation = {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  email: string;
  interests: string;
  enrolled_in_school: boolean;
  french_levels: string[];
  professional_status: string[];
  discovery_sources: string[];
  desired_duration: string[];
  weekly_hours: string[];
  availability_periods: string[];
  available_immediately: boolean;
  available_from: string | null;
  available_until: string | null;
  no_deadline: boolean;
  payment_methods: string[];
  comment: string;
  offer: string;
  payment_status: PaymentStatus;
  course_status: CourseStatus;
  group_name: string | null;
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
  age: 29,
  email: "camille.martin@example.com",
  interests: "Cours libre – 3 compétences",
  enrolled_in_school: false,
  french_levels: ["A2", "B1"],
  professional_status: ["Travailleur"],
  discovery_sources: ["un ami"],
  desired_duration: ["10 heures"],
  weekly_hours: ["deux heures par semaine"],
  availability_periods: ["le week-end", "le matin"],
  available_immediately: true,
  available_from: null,
  available_until: null,
  no_deadline: true,
  payment_methods: ["via UPI"],
  comment: "",
  offer: "Cours libre – 3 compétences",
  payment_status: "pending",
  course_status: "group_pending",
  group_name: null,
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
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [groupDrafts, setGroupDrafts] = useState<Record<string, string>>({});
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
    updates: Partial<Pick<Reservation, "payment_status" | "course_status" | "group_name">>,
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
    setRowErrors((current) => ({ ...current, [reservationId]: "" }));

    const { data, error } = await supabase
      .from("reservations")
      .update(updates)
      .eq("id", reservationId)
      .select("*")
      .single();

    setSavingId(null);

    if (error) {
      setRowErrors((current) => ({ ...current, [reservationId]: "Modification non enregistrée. Réessayez." }));
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

  const pendingPayments = reservations.filter((reservation) => reservation.payment_status === "pending").length;
  const waitingForGroup = reservations.filter((reservation) => reservation.course_status === "group_pending").length;

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
          <p className="text-sm text-slate-600">En attente de paiement</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{pendingPayments}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">En attente d’un groupe</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{waitingForGroup}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1480px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3">Client</th>
              <th scope="col" className="px-4 py-3">Offre / intérêt</th>
              <th scope="col" className="px-4 py-3">Profil</th>
              <th scope="col" className="px-4 py-3">Institut / origine</th>
              <th scope="col" className="px-4 py-3">Disponibilités</th>
              <th scope="col" className="px-4 py-3">Paiement</th>
              <th scope="col" className="px-4 py-3">Cours / groupe</th>
              <th scope="col" className="px-4 py-3">Commentaire</th>
              <th scope="col" className="px-4 py-3">Reçu le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {reservations.map((reservation) => {
              const groupName = groupDrafts[reservation.id] ?? reservation.group_name ?? "";
              const isSaving = savingId === reservation.id;

              return (
                <tr key={reservation.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{reservation.first_name} {reservation.last_name}</p>
                    {reservation.is_demo && <span className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">Démo</span>}
                    <p className="mt-1 whitespace-nowrap text-slate-600">{reservation.age} ans</p>
                    <a href={`mailto:${reservation.email}`} className="mt-1 inline-block text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-red-600">{reservation.email}</a>
                  </td>
                  <td className="max-w-56 px-4 py-4 text-slate-700">
                    <p className="font-semibold">{reservation.offer || "Offre non précisée"}</p>
                    {reservation.interests && reservation.interests !== reservation.offer && <p className="mt-1 text-xs text-slate-500">{reservation.interests}</p>}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <p>{reservation.french_levels.join(", ") || "Niveau non précisé"}</p>
                    <p className="mt-1 text-xs text-slate-500">{reservation.professional_status.join(", ")}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <p>{reservation.enrolled_in_school ? "Inscrit dans un institut" : "Institut non indiqué"}</p>
                    <p className="mt-1 text-xs text-slate-500">{reservation.discovery_sources.length ? `Découvert via : ${reservation.discovery_sources.join(", ")}` : "Origine non indiquée"}</p>
                  </td>
                  <td className="max-w-56 px-4 py-4 text-slate-700">
                    <p>{reservation.desired_duration.join(", ")}</p>
                    <p className="mt-1">{reservation.weekly_hours.join(", ")}</p>
                    <p className="mt-1 text-xs text-slate-500">{reservation.available_immediately ? "Dès que possible" : ""}{reservation.availability_periods.length ? ` · ${reservation.availability_periods.join(", ")}` : ""}</p>
                    {(reservation.available_from || reservation.available_until) && (
                      <p className="mt-1 text-xs text-slate-500">{reservation.available_from ?? ""}{reservation.available_until ? ` – ${reservation.available_until}` : ""}</p>
                    )}
                    {reservation.no_deadline && <p className="mt-1 text-xs text-slate-500">Sans date limite</p>}
                  </td>
                  <td className="px-4 py-4">
                    <p className="mb-2 max-w-48 text-xs leading-5 text-slate-500">{reservation.payment_methods.join(", ") || "Moyen non indiqué"}</p>
                    <select
                      aria-label={`Statut de paiement de ${reservation.first_name} ${reservation.last_name}`}
                      value={reservation.payment_status}
                      disabled={isSaving}
                      onChange={(event) => void updateReservation(reservation.id, { payment_status: event.target.value as PaymentStatus })}
                      className={selectClassName}
                    >
                      <option value="pending">En attente de paiement</option>
                      <option value="paid">Paiement effectué</option>
                    </select>
                  </td>
                  <td className="min-w-64 px-4 py-4">
                    <select
                      aria-label={`Statut du cours de ${reservation.first_name} ${reservation.last_name}`}
                      value={reservation.course_status}
                      disabled={isSaving}
                      onChange={(event) => {
                        const courseStatus = event.target.value as CourseStatus;
                        if (courseStatus === "group_assigned" && !groupName.trim()) {
                          setRowErrors((current) => ({ ...current, [reservation.id]: "Saisissez un nom de groupe avant l’affectation." }));
                          return;
                        }
                        void updateReservation(reservation.id, {
                          course_status: courseStatus,
                          group_name: courseStatus === "group_assigned" ? groupName.trim() : null,
                        });
                      }}
                      className={selectClassName}
                    >
                      <option value="unassigned">À organiser</option>
                      <option value="individual">Cours individuel</option>
                      <option value="group_pending">En attente de constitution du groupe</option>
                      <option value="group_assigned">Groupe assigné</option>
                    </select>
                    {(reservation.course_status === "group_pending" || reservation.course_status === "group_assigned") && (
                      <input
                        aria-label={`Nom du groupe de ${reservation.first_name} ${reservation.last_name}`}
                        value={groupName}
                        disabled={isSaving}
                        onChange={(event) => setGroupDrafts((current) => ({ ...current, [reservation.id]: event.target.value }))}
                        placeholder={reservation.course_status === "group_assigned" ? "Nom du groupe" : "Nom du futur groupe (facultatif)"}
                        className={`${selectClassName} mt-2`}
                      />
                    )}
                    {reservation.course_status === "group_assigned" && (
                      <button
                        type="button"
                        disabled={isSaving || !groupName.trim()}
                        onClick={() => void updateReservation(reservation.id, { course_status: "group_assigned", group_name: groupName.trim() })}
                        className="mt-2 text-xs font-semibold text-red-700 underline decoration-red-300 underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Enregistrer le groupe
                      </button>
                    )}
                    {rowErrors[reservation.id] && <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{rowErrors[reservation.id]}</p>}
                  </td>
                  <td className="max-w-64 whitespace-pre-wrap break-words px-4 py-4 text-slate-700">{reservation.comment || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(reservation.created_at))}
                  </td>
                </tr>
              );
            })}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-slate-600">Aucune réservation pour le moment.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}