"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";

type CourseType = "individual" | "group" | "individual_group";
type AssignmentStatus = "unassigned" | "individual_assigned" | "group_assigned";
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
  assignment_status: AssignmentStatus;
  student_status: StudentStatus;
  offer: string;
  offer_details: string;
  availability_slots: string[];
  selected_group_id: string | null;
  comment: string;
  is_demo: boolean;
  created_at: string;
};

type FollowedCourse = {
  id: string;
  student_email: string;
  first_name: string;
  last_name: string;
  course_type: "individual" | "group";
  offer: string;
  offer_details: string;
  availability_slots: string[];
  scheduled_slot: string | null;
  selected_group_id: string | null;
  comment: string;
  created_at: string;
};

type StudentRow = {
  key: string;
  first_name: string;
  last_name: string;
  email: string;
  is_demo: boolean;
  registrations: Reservation[];
  followed_courses: FollowedCourse[];
};

type AdminLoadResult =
  | { status: "ready"; reservations: Reservation[]; followedCourses: FollowedCourse[] }
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
  assignment_status: "unassigned",
  student_status: "waitlist",
  offer: "OFFRE DE COURS GROUPÉ XYZ",
  offer_details: "Disponibilités : samedi 10:00–11:00, samedi 11:00–12:00",
  availability_slots: ["Samedi 10:00–11:00", "Samedi 11:00–12:00"],
  selected_group_id: null,
  comment: "",
  is_demo: true,
  created_at: "2026-09-01T09:00:00.000Z",
};

const demoIndividualReservation: Reservation = {
  ...demoReservation,
  id: "demo-reservation-002",
  registration_type: 1,
  course_type: "individual",
  assignment_status: "unassigned",
  student_status: "to_validate",
  offer: "Professionnel – 1 à 4 compétences",
  offer_details: "Disponibilités : mardi 14:00–15:00",
  availability_slots: ["Mardi 14:00–15:00"],
  created_at: "2026-09-02T09:00:00.000Z",
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

  const { data: followedCourses, error: coursesError } = await supabase
    .from("student_courses")
      .select("id, student_email, first_name, last_name, course_type, offer, offer_details, availability_slots, scheduled_slot, selected_group_id, comment, created_at")
    .order("created_at", { ascending: false });

  if (coursesError) {
    return { status: "error", message: "Impossible de charger les offres suivies. Appliquez la migration Supabase des inscriptions finalisées." };
  }

  return {
    status: "ready",
    reservations: (data ?? []) as Reservation[],
    followedCourses: (followedCourses ?? []) as FollowedCourse[],
  };
}

const selectClassName =
  "min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200";
function getRequestLabel(registration: Reservation) {
  if (registration.registration_type === 1) return "Réservation de créneaux individuels";
  if (registration.registration_type === 2) return "Demande pour rejoindre un groupe existant";
  return "Demande de création d’un groupe";
}

function getFrenchLevelLabel(registration: Reservation) {
  const levels = registration.french_level
    ? [registration.french_level]
    : registration.french_levels;

  if (levels.length === 0) return "Non renseigné";
  return levels.map((level) => level === "COMPLETE BEGINNER" ? "Débutant complet" : level).join(", ");
}

function getRequestSchedule(registration: Reservation) {
  if (registration.availability_slots.length > 0) return registration.availability_slots.join(" · ");
  return registration.offer_details.replace(/^Disponibilités\s*:\s*/i, "").trim();
}

function getRequestStatusOptions(registration: Reservation) {
  const options: { value: StudentStatus; label: string; disabled?: boolean }[] = [
    { value: "to_validate", label: "En attente de validation" },
    { value: "payment_pending", label: "En attente de règlement" },
    { value: "paused", label: "En pause" },
  ];

  if (registration.registration_type === 3) {
    options.splice(1, 0, { value: "waitlist", label: "En attente de création de groupe" });
  }

  if (!options.some((option) => option.value === registration.student_status)) {
    const legacyStatusLabels: Record<StudentStatus, string> = {
      waitlist: "En attente de création de groupe (ancien statut)",
      to_validate: "En attente de validation",
      payment_pending: "En attente de règlement",
      enrolled: "Inscrit (ancien statut)",
      paused: "En pause",
      finished: "Terminé (ancien statut)",
    };
    options.unshift({ value: registration.student_status, label: legacyStatusLabels[registration.student_status], disabled: true });
  }

  return options;
}

function groupStudentReservations(reservations: Reservation[], followedCourses: FollowedCourse[]): StudentRow[] {
  const grouped = new Map<string, StudentRow>();
  const getStudent = (email: string, firstName: string, lastName: string, isDemo: boolean) => {
    const key = email.trim().toLocaleLowerCase();
    let student = grouped.get(key);
    if (!student) {
      student = {
        key,
        first_name: firstName,
        last_name: lastName,
        email,
        is_demo: isDemo,
        registrations: [],
        followed_courses: [],
      };
      grouped.set(key, student);
    }
    return student;
  };

  for (const reservation of reservations) {
    getStudent(reservation.email, reservation.first_name, reservation.last_name, reservation.is_demo)
      .registrations.push(reservation);
  }

  for (const course of followedCourses) {
    getStudent(course.student_email, course.first_name, course.last_name, false)
      .followed_courses.push(course);
  }

  return [...grouped.values()];
}

export default function AdminDashboard() {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(() =>
    getSupabaseClient() ? "checking" : "demo",
  );
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    getSupabaseClient() ? [] : [demoIndividualReservation, demoReservation],
  );
  const [followedCourses, setFollowedCourses] = useState<FollowedCourse[]>([]);
  const [selectedFinalSlots, setSelectedFinalSlots] = useState<Record<string, string>>({});
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});
  const [savedStudentNotes, setSavedStudentNotes] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingNoteEmail, setSavingNoteEmail] = useState<string | null>(null);

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
    setFollowedCourses(result.followedCourses);

    const { data: noteData, error: notesError } = await supabase
      .from("admin_student_notes")
      .select("student_email, note");
    if (notesError) {
      setSaveError("Les notes étudiant ne sont pas disponibles. Appliquez la migration Supabase des notes admin.");
    } else {
      const notes = Object.fromEntries((noteData ?? []).map((item) => [item.student_email, item.note])) as Record<string, string>;
      setStudentNotes(notes);
      setSavedStudentNotes(notes);
      setSaveError("");
    }

    setAccessStatus("ready");
  }

  async function updateReservation(
    reservationId: string,
    updates: Partial<Pick<Reservation, "student_status">>,
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

  async function saveStudentNote(email: string, note: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedNote = note.trim();
    if (savedStudentNotes[normalizedEmail] === normalizedNote) return;

    if (accessStatus === "demo") {
      setStudentNotes((current) => ({ ...current, [normalizedEmail]: normalizedNote }));
      setSavedStudentNotes((current) => ({ ...current, [normalizedEmail]: normalizedNote }));
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSavingNoteEmail(normalizedEmail);
    setSaveError("");
    const { error } = await supabase
      .from("admin_student_notes")
      .upsert({ student_email: normalizedEmail, note: normalizedNote, updated_at: new Date().toISOString() }, { onConflict: "student_email" });

    setSavingNoteEmail(null);
    if (error) {
      setSaveError("Note non enregistrée. Vérifiez que la migration Supabase des notes admin est appliquée.");
      return;
    }

    setStudentNotes((current) => ({ ...current, [normalizedEmail]: normalizedNote }));
    setSavedStudentNotes((current) => ({ ...current, [normalizedEmail]: normalizedNote }));
  }

  async function finalizeRegistration(student: StudentRow, registration: Reservation) {
    const scheduledSlot = registration.registration_type === 1
      ? selectedFinalSlots[registration.id] ?? (registration.availability_slots.length === 1 ? registration.availability_slots[0] : "")
      : "";

    if (registration.registration_type === 1 && !scheduledSlot) {
      setSaveError("Choisissez le créneau individuel à réserver avant de finaliser l’inscription.");
      return;
    }

    const confirmed = window.confirm(
      `Finaliser l’inscription de ${student.first_name} ${student.last_name} à « ${registration.offer} »${scheduledSlot ? ` pour le créneau ${scheduledSlot}` : ""} ? La demande sera retirée et l’offre ajoutée aux offres suivies.`,
    );
    if (!confirmed) return;

    if (accessStatus === "demo") {
      const followedCourse: FollowedCourse = {
        id: `demo-course-${registration.id}`,
        student_email: student.email.trim().toLowerCase(),
        first_name: student.first_name,
        last_name: student.last_name,
        course_type: registration.registration_type === 1 ? "individual" : "group",
        offer: registration.offer,
        offer_details: registration.offer_details,
        availability_slots: registration.availability_slots,
        scheduled_slot: scheduledSlot || null,
        selected_group_id: registration.selected_group_id,
        comment: registration.comment,
        created_at: new Date().toISOString(),
      };
      setFollowedCourses((current) => [...current, followedCourse]);
      setReservations((current) => current.filter((item) => item.id !== registration.id));
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSavingId(registration.id);
    setSaveError("");
    const { error } = await supabase.rpc("finalize_reservation", {
      p_reservation_id: registration.id,
      p_scheduled_slot: scheduledSlot || null,
    });
    setSavingId(null);

    if (error) {
      setSaveError("Finalisation impossible. Vérifiez que la migration Supabase des inscriptions finalisées est appliquée.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      await refreshAdminData(supabase, sessionData.session.user.id);
    } else {
      setSaveError("Inscription finalisée, mais la liste n’a pas pu être actualisée. Rechargez la page.");
    }
  }

  async function deleteStudent(student: StudentRow) {
    const recordCount = student.registrations.length + student.followed_courses.length;
    const recordLabel = recordCount > 1 ? "cours et demandes" : "cours ou demande";
    const confirmed = window.confirm(
      `Supprimer ${student.first_name} ${student.last_name}, sa note et ses ${recordCount} ${recordLabel} ? Cette action est définitive.`,
    );

    if (!confirmed) return;

    if (accessStatus === "demo") {
      setReservations((current) => current.filter((reservation) => reservation.email.trim().toLowerCase() !== student.key));
      setFollowedCourses((current) => current.filter((course) => course.student_email !== student.key));
      setStudentNotes((current) => Object.fromEntries(Object.entries(current).filter(([email]) => email !== student.key)));
      setSavedStudentNotes((current) => Object.fromEntries(Object.entries(current).filter(([email]) => email !== student.key)));
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const savingKey = `student:${student.key}`;
    setSavingId(savingKey);
    setSaveError("");

    const { error } = await supabase.rpc("delete_student_records", { p_student_email: student.key });

    setSavingId(null);

    if (error) {
      setSaveError("Suppression non effectuée. Vérifiez que la migration Supabase des cours suivis est appliquée, puis réessayez.");
      return;
    }

    setReservations((current) => current.filter((reservation) => reservation.email.trim().toLowerCase() !== student.key));
    setFollowedCourses((current) => current.filter((course) => course.student_email !== student.key));
    setStudentNotes((current) => Object.fromEntries(Object.entries(current).filter(([email]) => email !== student.key)));
    setSavedStudentNotes((current) => Object.fromEntries(Object.entries(current).filter(([email]) => email !== student.key)));
  }

  async function deleteRegistration(student: StudentRow, registration: Reservation) {
    const confirmed = window.confirm(
      `Supprimer le cours « ${registration.offer} » de ${student.first_name} ${student.last_name} ? Ses autres inscriptions seront conservées.`,
    );

    if (!confirmed) return;

    if (accessStatus === "demo") {
      setReservations((current) => current.filter((reservation) => reservation.id !== registration.id));
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const savingKey = `student:${student.key}`;
    setSavingId(savingKey);
    setSaveError("");

    const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("id", registration.id);

    setSavingId(null);

    if (error) {
      setSaveError("Suppression du cours impossible. Vérifiez la migration Supabase puis réessayez.");
      return;
    }

    setReservations((current) => current.filter((reservation) => reservation.id !== registration.id));
  }

  async function handleLogout() {
    await getSupabaseClient()?.auth.signOut();
    setReservations([]);
    setAccessStatus("signed-out");
    window.location.assign("/admin/login");
  }

  if (accessStatus === "checking") {
    return <p role="status" className="py-12 text-center text-slate-600">Vérification de l’accès…</p>;
  }

  if (accessStatus === "signed-out" || accessStatus === "denied" || accessStatus === "error") {
    return (
      <section className="mx-auto mb-16 max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <h1 className="text-2xl font-bold text-slate-900">Session administrateur</h1>
        {accessStatus === "denied" && (
          <p role="alert" className="mt-4 text-sm font-semibold text-red-700">Ce compte n’a pas les droits administrateur.</p>
        )}
        {loginError && <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{loginError}</p>}
        <Link href="/admin/login" className="mt-6 inline-flex font-semibold text-red-700 underline decoration-red-300 underline-offset-4">Se connecter</Link>
      </section>
    );
  }

  const students = groupStudentReservations(reservations, followedCourses);
  const requestsInProgress = reservations.filter((registration) => registration.student_status !== "enrolled" && registration.student_status !== "finished").length;

  return (
    <section className="mx-auto mb-16 max-w-6xl">
      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
        <div aria-hidden="true" />
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl"><span className="text-red-600">ADMIN</span><span className="text-red-600"> - Étudiants</span></h1>
          {accessStatus === "demo" && <p className="mt-2 text-sm text-slate-600">Aperçu avec données fictives — les modifications ne sont pas enregistrées.</p>}
        </div>
        {accessStatus === "ready" && (
          <button type="button" onClick={handleLogout} className="justify-self-end text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-red-600">
            Se déconnecter
          </button>
        )}
      </div>

      {accessStatus === "demo" && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
          Mode démo : la page est publique et affiche un client fictif. Configurez Supabase et l’accès administrateur avant d’y consulter des données réelles.
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Étudiants</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{students.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Demandes en cours</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{requestsInProgress}</p>
        </div>
      </div>

      {saveError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{saveError}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1320px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3">Nom</th>
              <th scope="col" className="px-4 py-3">Prénom</th>
              <th scope="col" className="px-4 py-3">Demandes de réservation</th>
              <th scope="col" className="px-4 py-3">Offres suivies</th>
              <th scope="col" className="px-4 py-3">Note étudiant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((student) => {
              const isSaving = savingId === `student:${student.key}` || student.registrations.some((registration) => savingId === registration.id);
              const isSavingNote = savingNoteEmail === student.key;
              const pendingRequests = student.registrations.filter((registration) => registration.student_status !== "enrolled" && registration.student_status !== "finished");
              const followedOffers = student.followed_courses;

              return (
                <tr key={student.key} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{student.last_name}</p>
                    {student.is_demo && <span className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">Démo</span>}
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => void deleteStudent(student)}
                      className="mt-2 block text-xs font-semibold text-red-700 underline decoration-red-300 underline-offset-2 disabled:cursor-wait disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <p className="font-semibold text-slate-900">{student.first_name}</p>
                    <a href={`mailto:${student.email}`} className="mt-1 inline-block text-xs text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-red-600">{student.email}</a>
                  </td>
                  <td className="min-w-64 px-4 py-4">
                    <div className="space-y-4">
                      {pendingRequests.length === 0 && <p className="text-sm text-slate-500">Aucune demande en attente.</p>}
                      {pendingRequests.map((registration) => (
                        <div key={registration.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${registration.registration_type === 1 ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>
                            {registration.registration_type === 1 ? "INDIVIDUEL" : "GROUPE"}
                          </span>
                          <h4 className="mt-2 text-base font-bold text-slate-900">{registration.offer}</h4>
                          {registration.registration_type !== 1 && <p className="mt-1 text-sm font-semibold text-slate-700">{getRequestLabel(registration)}</p>}
                          <div className="mb-3 rounded-md bg-white px-3 py-2">
                            <p className="text-xs font-semibold text-slate-500">Créneau horaire</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-800">{getRequestSchedule(registration) || "À préciser"}</p>
                          </div>
                          <div className="mb-3 rounded-md bg-white px-3 py-2">
                            <p className="text-xs font-semibold text-slate-500">Niveau de français sélectionné</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">{getFrenchLevelLabel(registration)}</p>
                          </div>
                          {registration.comment.trim() && (
                            <div className="mb-3 rounded-md bg-white px-3 py-2">
                              <p className="text-xs font-semibold text-slate-500">Commentaire de l’étudiant</p>
                              <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-800">{registration.comment}</p>
                            </div>
                          )}
                          {registration.registration_type === 1 && (
                            <label className="mb-3 block text-xs font-semibold text-slate-600">
                              Créneau individuel à réserver
                              <select
                                aria-label={`Créneau individuel à réserver pour ${registration.offer} de ${student.first_name} ${student.last_name}`}
                                value={selectedFinalSlots[registration.id] ?? (registration.availability_slots.length === 1 ? registration.availability_slots[0] : "")}
                                disabled={isSaving}
                                onChange={(event) => setSelectedFinalSlots((current) => ({ ...current, [registration.id]: event.target.value }))}
                                className={`${selectClassName} mt-1`}
                              >
                                <option value="">Choisir un créneau</option>
                                {registration.availability_slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                              </select>
                            </label>
                          )}
                          <label className="block text-xs font-semibold text-slate-600">
                            Statut de la demande
                            <select
                              aria-label={`Statut de la demande ${registration.offer} de ${student.first_name} ${student.last_name}`}
                              value={registration.student_status}
                              disabled={isSaving}
                              onChange={(event) => void updateReservation(registration.id, { student_status: event.target.value as StudentStatus })}
                              className={`${selectClassName} mt-1`}
                            >
                              {getRequestStatusOptions(registration).map((option) => (
                                <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>
                              ))}
                            </select>
                          </label>
                          <div className="mt-3 grid gap-2">
                            <button
                              type="button"
                              disabled={isSaving || (registration.registration_type === 1 && !(selectedFinalSlots[registration.id] ?? (registration.availability_slots.length === 1 ? registration.availability_slots[0] : "")))}
                              onClick={() => void finalizeRegistration(student, registration)}
                              className="min-h-10 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-50"
                            >
                              Finaliser l’inscription
                            </button>
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => void deleteRegistration(student, registration)}
                              className="min-h-10 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                            >
                              Supprimer la demande
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="min-w-72 px-4 py-4">
                    <div className="space-y-4">
                      {followedOffers.length === 0 && <p className="text-sm text-slate-500">Aucune offre finalisée.</p>}
                      {followedOffers.map((course) => (
                        <div key={course.id} className="border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                          <p className="font-semibold text-slate-900">{course.offer} · {course.course_type === "individual" ? "Individuel" : "Groupe"}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {course.scheduled_slot
                              ? course.scheduled_slot
                              : course.availability_slots.length > 0
                              ? course.availability_slots.join(" · ")
                              : course.offer_details || "Créneau à préciser"}
                          </p>
                          {course.comment.trim() && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{course.comment}</p>}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="min-w-56 px-4 py-4">
                    <label className="block text-xs font-semibold text-slate-600">
                      Note interne sur l’étudiant
                      <textarea
                        aria-label={`Note étudiant ${student.first_name} ${student.last_name}`}
                        value={studentNotes[student.key] ?? ""}
                        rows={4}
                        disabled={isSavingNote}
                        onChange={(event) => setStudentNotes((current) => ({ ...current, [student.key]: event.target.value }))}
                        onBlur={(event) => void saveStudentNote(student.email, event.currentTarget.value)}
                        className={`${selectClassName} mt-2`}
                      />
                    </label>
                    {isSavingNote && <p role="status" className="mt-1 text-xs text-slate-500">Enregistrement…</p>}
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-600">Aucun étudiant pour le moment.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Link href="/admin" className="mt-8 inline-flex font-semibold text-red-700 underline decoration-red-300 underline-offset-4">
        Retour aux sections
      </Link>
    </section>
  );
}