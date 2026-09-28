"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";

type ChoiceGroupProps = {
  label: string;
  name: string;
  options: string[];
};

const inputClassName =
  "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200";

function ChoiceGroup({ label, name, options }: ChoiceGroupProps) {
  return (
    <fieldset className="border-t border-slate-200 py-6">
      <legend className="px-0 text-lg font-bold text-slate-900">{label}</legend>
      <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option} className="flex min-h-8 items-start gap-3 text-sm leading-6 text-slate-700">
            <input
              type="checkbox"
              name={name}
              value={option}
              className="mt-1 h-4 w-4 shrink-0 accent-red-600"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function ReservationForm({ selectedOffer }: { selectedOffer: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      setErrorMessage("Le formulaire n’est pas connecté à la base de données. Réessayez plus tard.");
      return;
    }

    const formData = new FormData(form);
    const text = (name: string) => String(formData.get(name) ?? "").trim();
    const choices = (name: string) => formData.getAll(name).map(String);

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.from("reservations").insert({
        first_name: text("prenom"),
        last_name: text("nom"),
        age: Number(text("age")),
        email: text("email"),
        french_levels: choices("niveau[]"),
        professional_status: choices("situation[]"),
        enrolled_in_school: choices("inscription[]").includes("Oui"),
        interests: text("interet"),
        discovery_sources: choices("decouverte[]"),
        desired_duration: choices("inscriptionDuree[]"),
        weekly_hours: choices("heuresParSemaine[]"),
        availability_periods: choices("moments[]"),
        available_immediately: choices("disponibiliteDate[]").includes("dès que possible"),
        available_from: text("dateDebut") || null,
        available_until: text("dateFin") || null,
        no_deadline: choices("disponibiliteDate[]").includes("pas de date limite"),
        payment_methods: choices("paiement[]"),
        comment: text("commentaire"),
        offer: text("offre"),
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
          Retour aux offres
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mb-16 max-w-4xl rounded-2xl border border-slate-200 bg-white px-6 py-2 shadow-sm sm:px-10">
      {selectedOffer && (
        <div className="border-b border-slate-200 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Offre sélectionnée</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{selectedOffer}</p>
          <input type="hidden" name="offre" value={selectedOffer} />
        </div>
      )}

      <div className="grid gap-5 border-t border-slate-200 py-6 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-800">
          Prénom
          <input name="prenom" autoComplete="given-name" required className={inputClassName} />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Nom
          <input name="nom" autoComplete="family-name" required className={inputClassName} />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Âge
          <input name="age" type="number" min="1" max="120" required className={inputClassName} />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          E-mail
          <input name="email" type="email" autoComplete="email" required className={inputClassName} />
        </label>
      </div>

      <ChoiceGroup
        label="Mon niveau de français est"
        name="niveau[]"
        options={["débutant", "A1", "A2", "B1", "B2", "C1", "C2"]}
      />
      <ChoiceGroup
        label="Situation professionnelle"
        name="situation[]"
        options={["Étudiant", "Travailleur", "Autre"]}
      />
      <ChoiceGroup
        label="Je suis actuellement inscrit dans un institut / une école de français"
        name="inscription[]"
        options={["Oui"]}
      />

      <fieldset className="border-t border-slate-200 py-6">
        <legend className="text-lg font-bold text-slate-900">Je suis intéressé(e) par</legend>
        <input
          name="interet"
          defaultValue={selectedOffer}
          placeholder="Précisez votre intérêt"
          className={inputClassName}
        />
      </fieldset>

      <ChoiceGroup
        label="J’ai découvert Rendez-Vous grâce à :"
        name="decouverte[]"
        options={["un ami", "Instagram", "autre"]}
      />
      <ChoiceGroup
        label="Je souhaite m’inscrire pour"
        name="inscriptionDuree[]"
        options={["2 heures", "10 heures", "+ de 10 heures"]}
      />
      <ChoiceGroup
        label="Je suis disponible"
        name="heuresParSemaine[]"
        options={["une heure par semaine", "deux heures par semaine", "+ de deux heures par semaine"]}
      />
      <ChoiceGroup
        label="Je suis disponible"
        name="moments[]"
        options={["la semaine", "le week-end", "le matin", "l’après-midi", "le soir"]}
      />

      <fieldset className="border-t border-slate-200 py-6">
        <legend className="text-lg font-bold text-slate-900">Je suis disponible</legend>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className="flex items-center gap-3 text-sm leading-6 text-slate-700">
            <input type="checkbox" name="disponibiliteDate[]" value="dès que possible" className="h-4 w-4 accent-red-600" />
            dès que possible
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            à partir de
            <input type="date" name="dateDebut" className={inputClassName} />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            jusqu’à
            <input type="date" name="dateFin" className={inputClassName} />
          </label>
          <label className="flex items-center gap-3 text-sm leading-6 text-slate-700">
            <input type="checkbox" name="disponibiliteDate[]" value="pas de date limite" className="h-4 w-4 accent-red-600" />
            pas de date limite
          </label>
        </div>
      </fieldset>

      <ChoiceGroup
        label="Je peux payer"
        name="paiement[]"
        options={[
          "en cash",
          "via UPI",
          "via transfert bancaire sur un compte indien",
          "via transfert bancaire sur un compte français",
        ]}
      />

      <label className="block border-t border-slate-200 py-6 text-sm font-semibold text-slate-800">
        Postez ici une question ou un commentaire :
        <textarea name="commentaire" rows={5} className={inputClassName} />
      </label>

      <div className="border-t border-slate-200 py-6 text-center">
        {errorMessage && <p role="alert" className="mb-4 text-sm font-semibold text-red-700">{errorMessage}</p>}
        <button type="submit" disabled={isSubmitting} className="inline-flex min-h-14 items-center justify-center rounded-full bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-wait disabled:opacity-60">
          {isSubmitting ? "Envoi en cours…" : "Envoyer le formulaire"}
        </button>
      </div>
    </form>
  );
}