"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { getSupabaseClient } from "../../../lib/supabase";

const weekdays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const hourlySlots = Array.from({ length: 10 }, (_, index) => {
  const start = index + 10;
  const end = start + 1;
  return `${String(start).padStart(2, "0")}:00–${String(end).padStart(2, "0")}:00`;
});

type AccessStatus = "checking" | "signed-out" | "ready" | "denied" | "error" | "unconfigured";
type ReservedIndividualCourse = {
  id: string;
  student_email: string;
  first_name: string;
  last_name: string;
  offer: string;
  scheduled_slot: string;
};
type IndividualCourseRecord = Omit<ReservedIndividualCourse, "scheduled_slot"> & {
  scheduled_slot: string | null;
  availability_slots: string[];
};
type ReservedGroupCourse = {
  id: string;
  student_email: string;
  first_name: string;
  last_name: string;
  offer: string;
  offer_details: string;
};

type PlanningDataResult =
  | { error: string }
  | { error: null; availableSlots: string[]; reservedIndividualCourses: ReservedIndividualCourse[]; reservedGroupCourses: ReservedGroupCourse[] };

async function loadPlanningData(supabase: SupabaseClient): Promise<PlanningDataResult> {
  const [
    { data: slotData, error: slotsError },
    { data: individualCourses, error: individualCoursesError },
    { data: groupCourses, error: groupCoursesError },
  ] = await Promise.all([
    supabase.from("teacher_availability_slots").select("slot").order("slot"),
    supabase
      .from("student_courses")
      .select("id, student_email, first_name, last_name, offer, scheduled_slot, availability_slots")
      .eq("course_type", "individual")
      .order("created_at", { ascending: false }),
    supabase
      .from("student_courses")
      .select("id, student_email, first_name, last_name, offer, offer_details")
      .eq("course_type", "group")
      .not("selected_group_id", "is", null)
      .order("created_at", { ascending: false }),
  ]);

  if (slotsError || individualCoursesError || groupCoursesError) {
    return { error: "Impossible de charger le planning. Appliquez la migration Supabase 202610180009_categorized_course_planning.sql." };
  }

  const reservedIndividualCourses = ((individualCourses ?? []) as IndividualCourseRecord[]).flatMap((course) => {
    const slots = course.scheduled_slot ? [course.scheduled_slot] : course.availability_slots;
    return slots.map((scheduled_slot) => ({ ...course, id: `${course.id}:${scheduled_slot}`, scheduled_slot }));
  });

  return {
    error: null,
    availableSlots: (slotData ?? []).map((row) => row.slot as string),
    reservedIndividualCourses,
    reservedGroupCourses: (groupCourses ?? []) as ReservedGroupCourse[],
  };
}

function AvailabilityGrid({
  availableSlots,
  pendingChanges,
  reservedCourses,
  isSaving,
  onToggle,
}: {
  availableSlots: string[];
  pendingChanges: Record<string, boolean>;
  reservedCourses: ReservedIndividualCourse[];
  isSaving: boolean;
  onToggle: (slot: string) => void;
}) {
  return (
    <div className="overflow-x-auto pb-2">
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
                const reservedCourse = reservedCourses.find((course) => course.scheduled_slot === slot);
                return (
                  <td key={slot} className="p-0">
                    {reservedCourse ? (
                      <span aria-label={`${day} ${time} : réservé pour ${reservedCourse.first_name} ${reservedCourse.last_name}`} title={`${reservedCourse.first_name} ${reservedCourse.last_name} · ${reservedCourse.offer}`} className="flex h-10 items-center justify-center rounded-md border border-amber-300 bg-amber-100 px-1 text-[10px] font-bold text-amber-900">Réservé</span>
                    ) : (
                      <button
                        type="button"
                        aria-label={`${availableSlots.includes(slot) ? "Fermer" : "Ouvrir"} ${day}, ${time}`}
                        aria-pressed={availableSlots.includes(slot)}
                        disabled={isSaving}
                        onClick={() => onToggle(slot)}
                        className={`h-10 w-full rounded-md border text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${slot in pendingChanges ? "ring-2 ring-red-400 ring-offset-1 " : ""}${availableSlots.includes(slot) ? "border-emerald-700 bg-emerald-600 text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-400 hover:bg-slate-100"}`}
                      >
                        {availableSlots.includes(slot) ? "Ouvert" : "Fermé"}
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PlanningDashboard() {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(() =>
    getSupabaseClient() ? "checking" : "unconfigured",
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [reservedIndividualCourses, setReservedIndividualCourses] = useState<ReservedIndividualCourse[]>([]);
  const [reservedGroupCourses, setReservedGroupCourses] = useState<ReservedGroupCourse[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

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

      const planningData = await loadPlanningData(client);
      if (!isActive) return;
      if (planningData.error !== null) {
        setErrorMessage(planningData.error);
        setAccessStatus("error");
        return;
      }

      setAvailableSlots(planningData.availableSlots);
      setReservedIndividualCourses(planningData.reservedIndividualCourses);
      setReservedGroupCourses(planningData.reservedGroupCourses);
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

    const reloadPlanning = async () => {
      const planningData = await loadPlanningData(supabase);
      if (planningData.error !== null) return;
      setAvailableSlots(planningData.availableSlots);
      setReservedIndividualCourses(planningData.reservedIndividualCourses);
      setReservedGroupCourses(planningData.reservedGroupCourses);
    };

    const channel = supabase
      .channel("admin-teacher-availability")
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_availability_slots" }, () => void reloadPlanning())
      .on("postgres_changes", { event: "*", schema: "public", table: "student_courses" }, () => void reloadPlanning())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [accessStatus]);

  const displayedSlots = weekdays.flatMap((day) => hourlySlots.map((time) => `${day} ${time}`))
    .filter((slot) => slot in pendingChanges ? pendingChanges[slot] : availableSlots.includes(slot));
  const pendingCount = Object.keys(pendingChanges).length;

  function toggleSlot(slot: string) {
    if (isSaving) return;
    setSuccessMessage("");
    const wantOpen = !displayedSlots.includes(slot);
    setPendingChanges((current) => {
      const next = { ...current };
      if (wantOpen === availableSlots.includes(slot)) delete next[slot];
      else next[slot] = wantOpen;
      return next;
    });
  }

  async function savePendingChanges() {
    const supabase = getSupabaseClient();
    if (!supabase || isSaving || pendingCount === 0) return;

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    const toOpen = Object.keys(pendingChanges).filter((slot) => pendingChanges[slot]);
    const toClose = Object.keys(pendingChanges).filter((slot) => !pendingChanges[slot]);

    const closeResult = toClose.length > 0
      ? await supabase.from("teacher_availability_slots").delete().in("slot", toClose)
      : null;
    const openResult = !closeResult?.error && toOpen.length > 0
      ? await supabase.from("teacher_availability_slots").insert(toOpen.map((slot) => ({ course_type: "individual", slot })))
      : null;

    if (closeResult?.error || openResult?.error) {
      setErrorMessage("Impossible d’enregistrer les modifications. Vérifiez votre accès administrateur et réessayez.");
      const planningData = await loadPlanningData(supabase);
      if (planningData.error === null) setAvailableSlots(planningData.availableSlots);
    } else {
      setAvailableSlots((current) => [...current.filter((slot) => !toClose.includes(slot)), ...toOpen]);
      setPendingChanges({});
      setSuccessMessage("Les modifications ont été enregistrées.");
    }
    setIsSaving(false);
  }

  if (accessStatus !== "ready") {
    return (
      <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {accessStatus === "checking" && <p role="status" className="text-sm text-slate-600">Vérification de l’accès administrateur…</p>}
        {accessStatus === "signed-out" && <Link href="/admin/login" className="font-semibold text-red-700 underline decoration-red-300 underline-offset-4">Se connecter</Link>}
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
          <h2 className="text-xl font-bold text-slate-900">Planning hebdomadaire</h2>
          <p className="mt-2 text-sm text-slate-600">Un créneau ouvert est disponible pour les cours individuels et en groupe.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600" aria-label="Légende du planning">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-emerald-600" />Créneau ouvert pour tous les cours</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-amber-300" />Cours individuel réservé</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-sky-500" />Cours en groupe réservé</span>
      </div>
      {errorMessage && <p role="alert" className="mt-4 text-sm text-red-700">{errorMessage}</p>}
      {successMessage && <p role="status" className="mt-4 text-sm font-medium text-emerald-700">{successMessage}</p>}
      <div className="mt-4 overflow-x-auto">
        <AvailabilityGrid
          availableSlots={displayedSlots}
          pendingChanges={pendingChanges}
          reservedCourses={reservedIndividualCourses}
          isSaving={isSaving}
          onToggle={toggleSlot}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        {pendingCount > 0 && <p className="mr-auto text-sm text-slate-600">{pendingCount} modification{pendingCount === 1 ? "" : "s"} non enregistrée{pendingCount === 1 ? "" : "s"}</p>}
        <button
          type="button"
          disabled={isSaving || pendingCount === 0}
          onClick={() => { setPendingChanges({}); setSuccessMessage(""); }}
          className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="button"
          disabled={isSaving || pendingCount === 0}
          onClick={() => void savePendingChanges()}
          className="min-h-11 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
      <div className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="text-base font-bold text-slate-900">Cours individuels réservés</h3>
        {reservedIndividualCourses.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Aucun créneau individuel réservé.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200">
            {reservedIndividualCourses.map((course) => {
              const day = weekdays.find((weekday) => course.scheduled_slot.startsWith(`${weekday} `));
              const time = day ? course.scheduled_slot.slice(day.length).trim() : course.scheduled_slot;
              return (
                <li key={course.id} className="py-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
                  <p className="font-semibold text-slate-900">{course.first_name} {course.last_name} · {course.offer}</p>
                  <div className="mt-1 inline-flex items-center gap-2 rounded-md bg-amber-100 px-2 py-1 text-sm font-semibold text-amber-900 sm:mt-0">
                    <span>{time}</span>
                    {day && <span className="rounded bg-white/70 px-2 py-0.5">{day}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="text-base font-bold text-slate-900">Cours en groupe réservés</h3>
        {reservedGroupCourses.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Aucun cours de groupe confirmé.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200">
            {reservedGroupCourses.map((course) => (
              <li key={course.id} className="py-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <p className="font-semibold text-slate-900">{course.first_name} {course.last_name} · {course.offer}</p>
                <p className="mt-1 inline-flex rounded-md bg-sky-100 px-2 py-1 text-sm font-semibold text-sky-900 sm:mt-0">{course.offer_details}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}