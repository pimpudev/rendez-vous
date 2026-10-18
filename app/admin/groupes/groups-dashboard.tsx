"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../../lib/supabase";

const levels = [
  { value: "COMPLETE BEGINNER", label: "Débutant complet" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" },
];
const weekdays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const schedules = weekdays.flatMap((day) =>
  Array.from({ length: 10 }, (_, index) => {
    const start = index + 10;
    const end = start + 1;
    return `${day} ${String(start).padStart(2, "0")}:00–${String(end).padStart(2, "0")}:00`;
  }),
);
const inputClassName = "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200";

type PageStatus = "checking" | "ready" | "signed-out" | "denied" | "error" | "unconfigured";
type GroupOffer = { id: string; slug: string; name_fr: string };
type GroupMember = { group_id: string; student_email: string; first_name: string; last_name: string };
type CourseGroup = {
  id: string;
  offer: string;
  group_name: string;
  schedule_description: string;
  scheduled_slot: string | null;
  level_min: string | null;
  level_max: string | null;
  is_open: boolean;
  created_at: string;
  members: GroupMember[];
};
type StudentCandidate = { email: string; first_name: string; last_name: string };
type GroupRequest = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  registration_type: number;
  offer: string;
  french_level: string | null;
  offer_details: string;
  availability_slots: string[];
  student_status: string;
  created_at: string;
};
type GroupLoadResult =
  | { error: string; groups?: never }
  | { error: null; groups: CourseGroup[]; offers: GroupOffer[]; students: StudentCandidate[]; requests: GroupRequest[] };

async function loadGroupsData(client: NonNullable<ReturnType<typeof getSupabaseClient>>): Promise<GroupLoadResult> {
  const [groupsResult, offersResult, reservationsResult, coursesResult, membersResult] = await Promise.all([
    client.from("course_groups").select("id, offer, group_name, schedule_description, scheduled_slot, level_min, level_max, is_open, created_at").order("created_at", { ascending: false }),
    client.from("course_offers").select("id, slug, name_fr").eq("category", "group").eq("is_active", true).order("name_fr"),
    client.from("reservations").select("id, email, first_name, last_name, registration_type, offer, french_level, offer_details, availability_slots, student_status, created_at").eq("is_demo", false).neq("student_status", "enrolled").order("created_at", { ascending: false }),
    client.from("student_courses").select("id, student_email, first_name, last_name, course_type, offer, offer_details, availability_slots, scheduled_slot, selected_group_id, created_at"),
    client.from("course_group_members").select("group_id, student_email, first_name, last_name"),
  ]);

  if (groupsResult.error || offersResult.error || reservationsResult.error || coursesResult.error || membersResult.error) {
    return { error: "Impossible de charger les groupes. Appliquez la migration 202610180012_admin_course_group_management.sql dans Supabase." };
  }

  const members = (membersResult.data ?? []) as GroupMember[];
  const groups = ((groupsResult.data ?? []) as Omit<CourseGroup, "members">[]).map((group) => ({
    ...group,
    members: members.filter((member) => member.group_id === group.id),
  }));
  const reservations = (reservationsResult.data ?? []) as GroupRequest[];
  const courses = (coursesResult.data ?? []) as Array<{ student_email: string; first_name: string; last_name: string }>;
  const studentMap = new Map<string, StudentCandidate>();
  for (const student of courses) {
    studentMap.set(student.student_email.toLowerCase(), {
      email: student.student_email,
      first_name: student.first_name,
      last_name: student.last_name,
    });
  }
  for (const student of reservations) {
    studentMap.set(student.email.toLowerCase(), {
      email: student.email,
      first_name: student.first_name,
      last_name: student.last_name,
    });
  }

  return {
    error: null,
    groups,
    offers: (offersResult.data ?? []) as GroupOffer[],
    students: [...studentMap.values()].sort((left, right) => `${left.last_name} ${left.first_name}`.localeCompare(`${right.last_name} ${right.first_name}`, "fr")),
    requests: reservations.filter((reservation) => reservation.registration_type === 2 || reservation.registration_type === 3),
  };
}

export default function GroupsDashboard() {
  const [status, setStatus] = useState<PageStatus>(() => getSupabaseClient() ? "checking" : "unconfigured");
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [offers, setOffers] = useState<GroupOffer[]>([]);
  const [students, setStudents] = useState<StudentCandidate[]>([]);
  const [requests, setRequests] = useState<GroupRequest[]>([]);
  const [selectedOffer, setSelectedOffer] = useState("");
  const [levelMin, setLevelMin] = useState("A1");
  const [levelMax, setLevelMax] = useState("A2");
  const [scheduledSlot, setScheduledSlot] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function refreshData(client = getSupabaseClient()) {
    if (!client) return;
    const result = await loadGroupsData(client);
    if (result.error !== null) {
      setErrorMessage(result.error);
      setStatus("error");
      return;
    }
    setGroups(result.groups);
    setOffers(result.offers);
    setStudents(result.students);
    setRequests(result.requests);
    setSelectedOffer((current) => current || result.offers[0]?.name_fr || "");
    setStatus("ready");
  }

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;
    let active = true;
    async function initialize(client: NonNullable<ReturnType<typeof getSupabaseClient>>) {
      const { data, error } = await client.auth.getSession();
      if (!active) return;
      if (error) {
        setErrorMessage("Impossible de vérifier la session administrateur.");
        setStatus("error");
        return;
      }
      if (!data.session) {
        setStatus("signed-out");
        return;
      }
      const { data: membership, error: membershipError } = await client
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.session.user.id)
        .maybeSingle();
      if (!active) return;
      if (membershipError) {
        setErrorMessage("Impossible de vérifier les droits administrateur.");
        setStatus("error");
      } else if (!membership) {
        await client.auth.signOut();
        setStatus("denied");
      } else {
        await refreshData(client);
      }
    }
    void initialize(client);
    return () => { active = false; };
  }, []);

  async function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client || isSaving) return;
    if (!selectedOffer || !scheduledSlot) {
      setErrorMessage("Choisissez une offre et un horaire.");
      return;
    }
    if (levels.findIndex((level) => level.value === levelMin) > levels.findIndex((level) => level.value === levelMax)) {
      setErrorMessage("Le niveau de début doit précéder ou égaler le niveau de fin.");
      return;
    }
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    const selectedLevelMin = levels.find((level) => level.value === levelMin)?.label ?? levelMin;
    const selectedLevelMax = levels.find((level) => level.value === levelMax)?.label ?? levelMax;
    const { error } = await client.rpc("create_admin_course_group", {
      p_offer: selectedOffer,
      p_group_name: groupName.trim() || `${selectedOffer} · ${selectedLevelMin}-${selectedLevelMax}`,
      p_level_min: levelMin,
      p_level_max: levelMax,
      p_scheduled_slot: scheduledSlot,
    });
    if (error) {
      setErrorMessage(error.message.includes("schedule") || error.message.includes("overlap")
        ? "Cet horaire est déjà réservé pour un autre cours. Choisissez-en un autre."
        : `Impossible de créer le groupe : ${error.message}`);
    } else {
      setSuccessMessage("Le groupe a été créé.");
      setGroupName("");
      setScheduledSlot("");
      await refreshData(client);
    }
    setIsSaving(false);
  }

  async function changeMember(group: CourseGroup, student: StudentCandidate, action: "add" | "remove") {
    const client = getSupabaseClient();
    if (!client || isSaving) return;
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    const { error } = await client.rpc(action === "add" ? "admin_add_course_group_member" : "admin_remove_course_group_member", {
      p_group_id: group.id,
      p_student_email: student.email,
      p_first_name: student.first_name,
      p_last_name: student.last_name,
    });
    if (error) {
      setErrorMessage(`Impossible de modifier les membres du groupe : ${error.message}`);
    } else {
      setSuccessMessage(action === "add" ? `${student.first_name} a été ajouté(e) au groupe.` : `${student.first_name} a été retiré(e) du groupe.`);
      await refreshData(client);
    }
    setIsSaving(false);
  }

  if (status !== "ready") {
    return (
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {status === "checking" && <p role="status" className="text-sm text-slate-600">Vérification de l’accès administrateur…</p>}
        {status === "signed-out" && <Link href="/admin/login" className="font-semibold text-red-700 underline">Se connecter</Link>}
        {status === "denied" && <p role="alert" className="text-sm text-red-700">Ce compte ne dispose pas des droits administrateur.</p>}
        {status === "unconfigured" && <p role="alert" className="text-sm text-red-700">Supabase n’est pas configuré pour gérer les groupes.</p>}
        {status === "error" && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Créer un groupe</h2>
          <p className="mt-1 text-sm text-slate-600">L’horaire choisi doit être libre, mais n’a pas besoin d’être ouvert aux réservations.</p>
        </div>
        <form onSubmit={(event) => void createGroup(event)} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700">Offre de groupe
            <select required value={selectedOffer} onChange={(event) => setSelectedOffer(event.target.value)} className={inputClassName}>
              <option value="">Choisir une offre</option>
              {offers.map((offer) => <option key={offer.id} value={offer.name_fr}>{offer.name_fr}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">Niveau de début
            <select value={levelMin} onChange={(event) => setLevelMin(event.target.value)} className={inputClassName}>
              {levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">Niveau de fin
            <select value={levelMax} onChange={(event) => setLevelMax(event.target.value)} className={inputClassName}>
              {levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">Horaire
            <select required value={scheduledSlot} onChange={(event) => setScheduledSlot(event.target.value)} className={inputClassName}>
              <option value="">Choisir un horaire</option>
              {schedules.map((schedule) => <option key={schedule} value={schedule}>{schedule}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">Nom du groupe (facultatif)
            <input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Généré à partir de l’offre et du niveau" className={inputClassName} />
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={isSaving || offers.length === 0} className="min-h-11 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-50">
              {isSaving ? "Enregistrement…" : "Créer le groupe"}
            </button>
          </div>
        </form>
        {offers.length === 0 && <p className="mt-3 text-sm text-slate-500">Aucune offre de groupe active n’est disponible.</p>}
        {errorMessage && <p role="alert" className="mt-4 text-sm font-medium text-red-700">{errorMessage}</p>}
        {successMessage && <p role="status" className="mt-4 text-sm font-medium text-emerald-700">{successMessage}</p>}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Groupes créés</h2>
            <p className="mt-1 text-sm text-slate-600">{groups.length} groupe{groups.length === 1 ? "" : "s"}</p>
          </div>
          <button type="button" onClick={() => void refreshData()} disabled={isSaving} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Actualiser</button>
        </div>
        {groups.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Aucun groupe créé.</p>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const availableStudents = students.filter((student) => !group.members.some((member) => member.student_email.toLowerCase() === student.email.toLowerCase()));
              const selectedStudent = selectedStudents[group.id] ?? "";
              const studentToAdd = availableStudents.find((student) => student.email === selectedStudent);
              const minLabel = levels.find((level) => level.value === group.level_min)?.label ?? group.level_min;
              const maxLabel = levels.find((level) => level.value === group.level_max)?.label ?? group.level_max;
              return (
                <article key={group.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{group.group_name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{group.offer}</p>
                    </div>
                    <span className="rounded-md bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-900">{minLabel && maxLabel ? `${minLabel} – ${maxLabel}` : "Niveau non renseigné"}</span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-800">{group.scheduled_slot ?? group.schedule_description}</p>
                  <div className="mt-5">
                    <h4 className="text-sm font-bold text-slate-900">Étudiants ({group.members.length})</h4>
                    {group.members.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-500">Aucun étudiant dans ce groupe.</p>
                    ) : (
                      <ul className="mt-2 divide-y divide-slate-100">
                        {group.members.map((member) => (
                          <li key={member.student_email} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                            <span className="text-slate-800">{member.first_name} {member.last_name} <span className="text-slate-500">· {member.student_email}</span></span>
                            <button type="button" disabled={isSaving} onClick={() => void changeMember(group, { email: member.student_email, first_name: member.first_name, last_name: member.last_name }, "remove")} className="font-semibold text-red-700 underline decoration-red-200 underline-offset-2 disabled:opacity-50">Retirer</button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <select aria-label={`Ajouter un étudiant à ${group.group_name}`} value={selectedStudent} onChange={(event) => setSelectedStudents((current) => ({ ...current, [group.id]: event.target.value }))} className={`${inputClassName} mt-0`}>
                        <option value="">Choisir un étudiant de la base</option>
                        {availableStudents.map((student) => <option key={student.email} value={student.email}>{student.first_name} {student.last_name} · {student.email}</option>)}
                      </select>
                      <button type="button" disabled={isSaving || !studentToAdd} onClick={() => studentToAdd && void changeMember(group, studentToAdd, "add")} className="min-h-11 shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Ajouter</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Demandes de groupes</h2>
          <p className="mt-1 text-sm text-slate-600">Demandes reçues via le formulaire, y compris les demandes pour rejoindre un groupe existant.</p>
        </div>
        {requests.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune demande de groupe en attente.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {requests.map((request) => (
              <li key={request.id} className="py-4 sm:flex sm:items-start sm:justify-between sm:gap-6">
                <div>
                  <p className="font-semibold text-slate-900">{request.first_name} {request.last_name} <span className="font-normal text-slate-500">· {request.email}</span></p>
                  <p className="mt-1 text-sm text-slate-700">{request.offer} · {request.registration_type === 3 ? "Demande de création" : "Demande pour rejoindre un groupe"}</p>
                  <p className="mt-1 text-sm text-slate-600">Niveau : {request.french_level || "Non précisé"}</p>
                  <p className="mt-1 text-sm text-slate-600">{request.availability_slots.length > 0 ? request.availability_slots.join(" · ") : request.offer_details || "Aucune disponibilité précisée"}</p>
                </div>
                <span className="mt-2 inline-flex shrink-0 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900 sm:mt-0">{request.student_status === "waitlist" ? "En attente" : "À traiter"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p role="status" className="sr-only">{successMessage}</p>
    </div>
  );
}