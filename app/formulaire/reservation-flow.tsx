"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";

export type OfferType = "individual" | "group";

type OpenGroup = {
  id: string;
  offer: string;
  group_name: string;
  schedule_description: string;
};

type GroupLoadStatus = "loading" | "ready" | "error";

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
const hourlySlots = Array.from({ length: 10 }, (_, index) => {
  const start = index + 10;
  const end = start + 1;
  return { start, value: `${String(start).padStart(2, "0")}:00–${String(end).padStart(2, "0")}:00` };
});

const inputClassName =
  "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200";

function AvailabilityPicker({ availableSlots, selectedSlots, onToggle }: { availableSlots: string[]; selectedSlots: string[]; onToggle: (slot: string) => void }) {
  return (
    <fieldset className="border-t border-slate-200 py-6">
      <legend className="text-lg font-bold text-slate-900">Je suis disponible :</legend>
      <div className="mt-4 overflow-x-auto pb-2">
        <table className="w-full min-w-[620px] border-separate border-spacing-1 text-center text-xs">
          <thead>
            <tr>
              <th scope="col" className="w-16 px-2 py-2 text-left font-semibold text-slate-600">Heure</th>
              {weekdays.map((day) => <th key={day} scope="col" className="px-2 py-2 font-semibold text-slate-800">{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {hourlySlots.map(({ start, value }) => (
              <tr key={value}>
                <th scope="row" className="whitespace-nowrap px-2 py-1 text-left font-medium text-slate-600">{start} h</th>
                {weekdays.map((day) => {
                  const slot = `${day} ${value}`;
                  const available = availableSlots.includes(slot);
                  const selected = selectedSlots.includes(slot);
                  return (
                    <td key={slot} className="p-0">
                      {available ? (
                        <button
                          type="button"
                          aria-label={`${selected ? "Retirer" : "Choisir"} ${day}, ${value}`}
                          aria-pressed={selected}
                          title={`${day} ${value}`}
                          onClick={() => onToggle(slot)}
                          className={`h-10 w-full rounded-md border text-sm font-semibold transition-colors ${selected ? "border-emerald-700 bg-emerald-600 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"}`}
                        >
                          {selected ? "✓" : "Disponible"}
                        </button>
                      ) : (
                        <span aria-label={`${day}, ${value} : indisponible`} className="block h-10 rounded-md bg-slate-100" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-slate-600">Vous pouvez sélectionner autant de jours / heures que vous souhaitez.</p>
      {selectedSlots.map((slot) => <input key={slot} type="hidden" name="availability_slots[]" value={slot} />)}
    </fieldset>
  );
}

export default function ReservationFlow({
  selectedOffer,
  offerType,
}: {
  selectedOffer: string;
  offerType: OfferType;
}) {
  const supabaseConfigured = Boolean(getSupabaseClient());
  const [groups, setGroups] = useState<OpenGroup[]>([]);
  const [groupsStatus, setGroupsStatus] = useState<GroupLoadStatus>(() =>
    offerType === "group" && supabaseConfigured ? "loading" : "ready",
  );
  const [groupLoadError, setGroupLoadError] = useState("");
  const [groupRetry, setGroupRetry] = useState(0);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [declinedGroupIds, setDeclinedGroupIds] = useState<string[]>([]);
  const [selectedAvailabilitySlots, setSelectedAvailabilitySlots] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availabilityStatus, setAvailabilityStatus] = useState<"loading" | "ready" | "error">(() =>
    getSupabaseClient() ? "loading" : "error",
  );
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (offerType !== "group") return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let isActive = true;
    void supabase
      .from("course_groups")
      .select("id, offer, group_name, schedule_description")
      .eq("offer", selectedOffer)
      .eq("is_open", true)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!isActive) return;
        if (error) {
          setGroupLoadError("Impossible de charger les groupes ouverts. Vérifiez que la migration Supabase des formulaires étudiants a été exécutée, puis réessayez.");
          setGroupsStatus("error");
          return;
        }
        setGroups((data ?? []) as OpenGroup[]);
        setGroupsStatus("ready");
      });

    return () => {
      isActive = false;
    };
  }, [offerType, selectedOffer, groupRetry]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let isActive = true;
    const loadAvailability = async () => {
      const { data, error } = await supabase.from("teacher_availability_slots").select("slot");
      if (!isActive) return;
      if (error) {
        setAvailabilityStatus("error");
        return;
      }

      const slots = (data ?? []).map((row) => row.slot as string);
      setAvailableSlots(slots);
      setSelectedAvailabilitySlots((current) => current.filter((slot) => slots.includes(slot)));
      setAvailabilityStatus("ready");
    };

    void loadAvailability();
    const channel = supabase
      .channel("public-teacher-availability")
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_availability_slots" }, () => {
        void loadAvailability();
      })
      .subscribe();

    return () => {
      isActive = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    if (offerType === "group" && groupsStatus !== "ready") {
      setErrorMessage("Attendez le chargement des groupes avant d’envoyer le formulaire.");
      return;
    }

    const selectedGroup = groups.find((group) => group.id === selectedGroupId);
    const groupsAvailable = groups.length > 0;
    const declinedAllGroups = groupsAvailable && groups.every((group) => declinedGroupIds.includes(group.id));

    if (offerType === "group" && groupsAvailable && !selectedGroup && !declinedAllGroups) {
      setErrorMessage("Choisissez un groupe ouvert ou indiquez que vous n’êtes pas disponible sur ces créneaux.");
      return;
    }

    const formData = new FormData(form);
    const text = (name: string) => String(formData.get(name) ?? "").trim();
    const availabilitySlots = selectedAvailabilitySlots;
    const registrationType = offerType === "individual" ? 1 : selectedGroup ? 2 : 3;

    if (registrationType !== 2 && availabilitySlots.length === 0) {
      setErrorMessage("Sélectionnez au moins un créneau disponible.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setErrorMessage("Le formulaire n’est pas connecté à la base de données. Réessayez plus tard.");
      return;
    }

    const level = text("french_level");
    const offerDetails = selectedGroup
      ? `Groupe ${selectedGroup.group_name} – ${selectedGroup.schedule_description}`
      : `Disponibilités : ${availabilitySlots.join(" ; ")}`;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.rpc("submit_reservation", {
        payload: {
          first_name: text("first_name"),
          last_name: text("last_name"),
          email: text("email"),
          french_level: level,
          offer: selectedOffer,
          offer_details: offerDetails,
          availability_slots: availabilitySlots,
          registration_type: registrationType,
          selected_group_id: selectedGroup?.id ?? null,
          comment: text("comment"),
        },
      });

      if (error) {
        setErrorMessage("L’envoi a échoué. Vérifiez votre connexion puis réessayez.");
        return;
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrorMessage("L’envoi a échoué. Vérifiez votre connexion puis réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section role="status" className="mx-auto mb-16 max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <h2 className="text-2xl font-bold text-slate-900">Merci pour votre temps et votre confiance.</h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">Rendez-Vous reviendra vers vous dès que possible.</p>
        <Link href="/#programs" className="mt-8 inline-flex rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-500">
          Retour aux cours
        </Link>
      </section>
    );
  }

  const declinedAllGroups = groups.length > 0 && groups.every((group) => declinedGroupIds.includes(group.id));
  const showSchedule = offerType === "individual" || (groupsStatus === "ready" && (groups.length === 0 || declinedAllGroups));

  return (
    <form onSubmit={handleSubmit} className="mx-auto mb-16 max-w-4xl rounded-2xl border border-slate-200 bg-white px-6 py-2 shadow-sm sm:px-10">
      <div className="grid gap-5 border-t border-slate-200 py-6 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-800">
          Prénom
          <input name="first_name" autoComplete="given-name" required className={inputClassName} />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Nom
          <input name="last_name" autoComplete="family-name" required className={inputClassName} />
        </label>
        <label className="block text-sm font-semibold text-slate-800 sm:col-span-2">
          E-mail
          <input name="email" type="email" autoComplete="email" required className={inputClassName} />
        </label>
      </div>

      <fieldset className="border-t border-slate-200 py-6">
        <legend className="text-lg font-bold text-slate-900">Je m’inscris pour le niveau</legend>
        <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {levels.map((level) => (
            <label key={level.value} className="flex min-h-8 items-center gap-3 text-sm leading-6 text-slate-700">
              <input type="radio" name="french_level" value={level.value} required className="h-4 w-4 accent-red-600" />
              <span>{level.label}</span>
            </label>
          ))}
        </div>
        <Link href="/#faq-niveau-francais" className="mt-4 inline-block text-sm font-semibold text-red-700 underline decoration-red-300 underline-offset-4">
          Je ne connais pas mon niveau ?! Cliquez ici :-)
        </Link>
      </fieldset>

      {offerType === "group" && (
        <fieldset className="border-t border-slate-200 py-6">
          <legend className="text-lg font-bold text-slate-900">Je veux rejoindre CE GROUPE</legend>
          {groupsStatus === "loading" && <p role="status" className="mt-3 text-sm text-slate-600">Recherche des groupes ouverts…</p>}
          {groupsStatus === "error" && (
            <div role="alert" className="mt-3 text-sm text-red-700">
              <p>{groupLoadError}</p>
              <button type="button" onClick={() => { setGroupsStatus("loading"); setGroupRetry((retry) => retry + 1); }} className="mt-2 font-semibold underline">
                Réessayer
              </button>
            </div>
          )}
          {groupsStatus === "ready" && groups.length === 0 && (
            <p className="mt-2 text-sm leading-6 text-slate-600">Aucun groupe n’est actuellement ouvert pour cette offre. Indiquez vos disponibilités ci-dessous.</p>
          )}
          {groupsStatus === "ready" && groups.length > 0 && (
            <div className="mt-3">
              {groups.map((group) => (
                <div key={group.id} className="grid gap-3 border-t border-slate-200 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div>
                    <p className="font-semibold text-slate-900">{group.offer} – Groupe {group.group_name}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{group.schedule_description}</p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={selectedGroupId === group.id}
                    onClick={() => { setSelectedGroupId(group.id); setDeclinedGroupIds([]); setErrorMessage(""); }}
                    className={`rounded-full px-4 py-2 text-sm font-bold text-white ${selectedGroupId === group.id ? "bg-emerald-700" : "bg-emerald-600 hover:bg-emerald-500"}`}
                  >
                    Oui, je le veux.
                  </button>
                  <button
                    type="button"
                    aria-pressed={declinedGroupIds.includes(group.id) && !selectedGroupId}
                    onClick={() => {
                      setSelectedGroupId("");
                      setDeclinedGroupIds((current) => current.includes(group.id) ? current : [...current, group.id]);
                      setErrorMessage("");
                    }}
                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
                  >
                    Non, indisponible
                  </button>
                </div>
              ))}
            </div>
          )}
        </fieldset>
      )}

      {showSchedule && availabilityStatus === "loading" && <p role="status" className="border-t border-slate-200 py-6 text-sm text-slate-600">Chargement des disponibilités…</p>}
      {showSchedule && availabilityStatus === "error" && <p role="alert" className="border-t border-slate-200 py-6 text-sm text-red-700">Impossible de charger les disponibilités. Vérifiez que la migration Supabase du planning est appliquée et que des créneaux sont ouverts dans Admin &gt; Planning, puis rechargez le formulaire.</p>}
      {showSchedule && availabilityStatus === "ready" && availableSlots.length === 0 && <p role="status" className="border-t border-slate-200 py-6 text-sm text-slate-600">Aucun créneau n’est actuellement disponible. Revenez un peu plus tard.</p>}
      {showSchedule && availabilityStatus === "ready" && availableSlots.length > 0 && (
        <AvailabilityPicker
          availableSlots={availableSlots}
          selectedSlots={selectedAvailabilitySlots}
          onToggle={(slot) => setSelectedAvailabilitySlots((current) => current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot])}
        />
      )}

      <label className="block border-t border-slate-200 py-6 text-sm font-semibold text-slate-800">
        Si vous voulez, vous pouvez poster ici une question ou un commentaire :
        <textarea name="comment" rows={5} className={inputClassName} />
      </label>

      <div className="border-t border-slate-200 py-6 text-center">
        {errorMessage && <p role="alert" className="mb-4 text-sm font-semibold text-red-700">{errorMessage}</p>}
        <button
          type="submit"
          disabled={isSubmitting || (offerType === "group" && groupsStatus !== "ready")}
          className="inline-flex min-h-14 items-center justify-center rounded-full bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? "Envoi en cours…" : "Envoyer le formulaire"}
        </button>
      </div>
    </form>
  );
}
