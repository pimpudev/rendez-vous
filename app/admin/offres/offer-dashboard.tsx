"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { getSupabaseClient } from "../../../lib/supabase";
import type { CourseOffer } from "../../../lib/course-offers";

type AccessStatus = "checking" | "signed-out" | "ready" | "denied" | "error" | "unconfigured";
type OfferForm = {
  category: CourseOffer["category"];
  name_fr: string;
  name_en: string;
  name_es: string;
  description_fr: string;
  description_en: string;
  description_es: string;
  price_inr: string;
  price_eur: string;
  requirements: string;
};

const emptyForm: OfferForm = {
  category: "individual",
  name_fr: "",
  name_en: "",
  name_es: "",
  description_fr: "",
  description_en: "",
  description_es: "",
  price_inr: "",
  price_eur: "",
  requirements: "",
};

const fieldClassName = "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200";
const textareaClassName = `${fieldClassName} min-h-24`;

function makeSlug(category: CourseOffer["category"], name: string) {
  const prefix = category === "individual" ? "individuel" : "groupe";
  const suffix = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${prefix}-${suffix || "nouvelle-offre"}`;
}

function toOfferForm(offer: CourseOffer): OfferForm {
  return {
    category: offer.category,
    name_fr: offer.name_fr,
    name_en: offer.name_en,
    name_es: offer.name_es,
    description_fr: offer.description_fr,
    description_en: offer.description_en,
    description_es: offer.description_es,
    price_inr: String(offer.price_inr),
    price_eur: String(offer.price_eur),
    requirements: offer.requirements.join("\n"),
  };
}

export default function OfferDashboard() {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(() =>
    getSupabaseClient() ? "checking" : "unconfigured",
  );
  const [offers, setOffers] = useState<CourseOffer[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [form, setForm] = useState<OfferForm>(emptyForm);
  const [editingOffer, setEditingOffer] = useState<CourseOffer | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadOffers() {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { data, error } = await supabase
      .from("course_offers")
      .select("id, slug, category, name_fr, name_en, name_es, description_fr, description_en, description_es, price_inr, price_eur, requirements, is_active, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      setErrorMessage("Impossible de charger les offres. Vérifiez que la migration Supabase des offres est appliquée.");
      setAccessStatus("error");
      return false;
    }

    setOffers((data ?? []) as CourseOffer[]);
    setAccessStatus("ready");
    return true;
  }

  async function verifyAdmin(userId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      setErrorMessage("Impossible de vérifier les droits administrateur.");
      setAccessStatus("error");
    } else if (!data) {
      await supabase.auth.signOut();
      setAccessStatus("denied");
    } else {
      await loadOffers();
    }
  }

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let isActive = true;
    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!isActive) return;
      if (error) {
        setErrorMessage("Impossible de vérifier la session administrateur.");
        setAccessStatus("error");
      } else if (!data.session) {
        setAccessStatus("signed-out");
      } else {
        await verifyAdmin(data.session.user.id);
      }
    };

    void initialize();
    return () => {
      isActive = false;
    };
  }, []);

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

    await verifyAdmin(data.user.id);
  }

  function startEditing(offer: CourseOffer) {
    setEditingOffer(offer);
    setForm(toOfferForm(offer));
    setErrorMessage("");
    setSuccessMessage("");
  }

  function cancelEditing() {
    setEditingOffer(null);
    setForm(emptyForm);
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function saveOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      category: form.category,
      name_fr: form.name_fr.trim(),
      name_en: form.name_en.trim(),
      name_es: form.name_es.trim(),
      description_fr: form.description_fr.trim(),
      description_en: form.description_en.trim(),
      description_es: form.description_es.trim(),
      price_inr: Number(form.price_inr),
      price_eur: Number(form.price_eur),
      requirements: form.requirements.split("\n").map((requirement) => requirement.trim()).filter(Boolean),
    };

    const result = editingOffer
      ? await supabase.from("course_offers").update(payload).eq("id", editingOffer.id)
      : await supabase.from("course_offers").insert({ ...payload, slug: makeSlug(form.category, form.name_fr) });

    if (result.error) {
      setErrorMessage(result.error.code === "23505"
        ? "Une offre utilise déjà cette adresse. Modifiez son nom ou sa catégorie."
        : "Enregistrement impossible. Vérifiez les champs et votre accès administrateur.");
      setIsSaving(false);
      return;
    }

    const wasEditing = Boolean(editingOffer);
    setEditingOffer(null);
    setForm(emptyForm);
    setSuccessMessage(wasEditing ? "Offre mise à jour." : "Offre créée et publiée.");
    await loadOffers();
    setIsSaving(false);
  }

  async function archiveOffer(offer: CourseOffer) {
    if (!window.confirm(`Supprimer « ${offer.name_fr} » de la page d’accueil ?`)) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase.from("course_offers").update({ is_active: false }).eq("id", offer.id);
    if (error) {
      setErrorMessage("Suppression impossible. Vérifiez votre accès administrateur et réessayez.");
      return;
    }

    setSuccessMessage("Offre supprimée de la page d’accueil. Les inscriptions précédentes sont conservées.");
    setErrorMessage("");
    await loadOffers();
  }

  async function restoreOffer(offer: CourseOffer) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase.from("course_offers").update({ is_active: true }).eq("id", offer.id);
    if (error) {
      setErrorMessage("Restauration impossible. Vérifiez votre accès administrateur et réessayez.");
      return;
    }

    setSuccessMessage("Offre republiée.");
    setErrorMessage("");
    await loadOffers();
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
              <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClassName} />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Mot de passe
              <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClassName} />
            </label>
            {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
            <button type="submit" className="min-h-11 rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600">Se connecter</button>
          </form>
        )}
        {accessStatus === "unconfigured" && <p role="alert" className="text-sm text-red-700">Supabase n’est pas configuré pour gérer les offres.</p>}
        {accessStatus === "denied" && <p role="alert" className="text-sm text-red-700">Ce compte ne dispose pas des droits administrateur.</p>}
        {accessStatus === "error" && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
      </section>
    );
  }

  const activeOffers = offers.filter((offer) => offer.is_active);
  const archivedOffers = offers.filter((offer) => !offer.is_active);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{editingOffer ? "Modifier une offre" : "Créer une offre"}</h2>
            {editingOffer && <p className="mt-1 text-sm text-slate-500">Adresse : /offres/{editingOffer.slug}</p>}
          </div>
          {editingOffer ? (
            <button type="button" onClick={cancelEditing} aria-label="Annuler la modification" title="Annuler" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"><X size={18} /></button>
          ) : <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Plus size={18} /></span>}
        </div>

        <form onSubmit={saveOffer} className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-800">
              Type de cours
              <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as CourseOffer["category"] }))} className={fieldClassName}>
                <option value="individual">Cours individuel</option>
                <option value="group">Cours groupe</option>
              </select>
            </label>
            <div className="text-sm font-semibold text-slate-800">
              Adresse de l’offre
              <p className="mt-2 flex min-h-11 items-center rounded-lg bg-slate-50 px-3 font-normal text-slate-600">/offres/{editingOffer?.slug ?? makeSlug(form.category, form.name_fr)}</p>
            </div>
          </div>

          <fieldset className="grid gap-4 sm:grid-cols-3">
            <legend className="mb-1 text-sm font-bold text-slate-900">Noms de l’offre</legend>
            <label className="text-sm font-semibold text-slate-800">
              Français
              <input required value={form.name_fr} onChange={(event) => setForm((current) => ({ ...current, name_fr: event.target.value }))} className={fieldClassName} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              English
              <input value={form.name_en} onChange={(event) => setForm((current) => ({ ...current, name_en: event.target.value }))} className={fieldClassName} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Español
              <input value={form.name_es} onChange={(event) => setForm((current) => ({ ...current, name_es: event.target.value }))} className={fieldClassName} />
            </label>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-800">
              Prix en roupies indiennes par heure
              <input required type="number" min="0" step="0.01" value={form.price_inr} onChange={(event) => setForm((current) => ({ ...current, price_inr: event.target.value }))} className={fieldClassName} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Prix en euros par heure
              <input required type="number" min="0" step="0.01" value={form.price_eur} onChange={(event) => setForm((current) => ({ ...current, price_eur: event.target.value }))} className={fieldClassName} />
            </label>
          </div>

          <fieldset className="grid gap-4 sm:grid-cols-3">
            <legend className="mb-1 text-sm font-bold text-slate-900">Descriptions</legend>
            <label className="text-sm font-semibold text-slate-800">
              Français
              <textarea value={form.description_fr} onChange={(event) => setForm((current) => ({ ...current, description_fr: event.target.value }))} className={textareaClassName} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              English
              <textarea value={form.description_en} onChange={(event) => setForm((current) => ({ ...current, description_en: event.target.value }))} className={textareaClassName} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Español
              <textarea value={form.description_es} onChange={(event) => setForm((current) => ({ ...current, description_es: event.target.value }))} className={textareaClassName} />
            </label>
          </fieldset>

          {form.category === "group" && (
            <label className="block text-sm font-semibold text-slate-800">
              Conditions du groupe, une par ligne
              <textarea value={form.requirements} onChange={(event) => setForm((current) => ({ ...current, requirements: event.target.value }))} placeholder="Minimum 4 étudiants / Maximum 10 étudiants&#10;Minimum 10 heures" className={textareaClassName} />
            </label>
          )}

          {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
          {successMessage && <p role="status" className="text-sm text-emerald-700">{successMessage}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={isSaving} className="min-h-11 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60">
              {isSaving ? "Enregistrement…" : editingOffer ? "Enregistrer les modifications" : "Créer l’offre"}
            </button>
            {editingOffer && <button type="button" onClick={cancelEditing} className="min-h-11 rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Annuler</button>}
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Offres publiées <span className="text-sm font-medium text-slate-500">({activeOffers.length})</span></h2>
        {activeOffers.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Aucune offre publiée.</p>}
        {activeOffers.map((offer) => (
          <article key={offer.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="min-w-0">
              <p className="font-bold text-slate-900">{offer.name_fr}</p>
              <p className="mt-1 text-sm text-slate-600">{offer.category === "individual" ? "Individuel" : "Groupe"} · {offer.price_inr} ₹ / h · {offer.price_eur} € / h</p>
              <p className="mt-1 text-xs text-slate-500">/offres/{offer.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => startEditing(offer)} aria-label={`Modifier ${offer.name_fr}`} title="Modifier" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"><Pencil size={17} /></button>
              <button type="button" onClick={() => void archiveOffer(offer)} aria-label={`Supprimer ${offer.name_fr}`} title="Supprimer" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50"><Trash2 size={17} /></button>
            </div>
          </article>
        ))}
      </section>

      {archivedOffers.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Offres supprimées</h2>
          {archivedOffers.map((offer) => (
            <article key={offer.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="font-bold text-slate-700">{offer.name_fr}</p>
                <p className="mt-1 text-sm text-slate-500">Cette offre n’apparaît plus sur le site.</p>
              </div>
              <button type="button" onClick={() => void restoreOffer(offer)} aria-label={`Restaurer ${offer.name_fr}`} title="Restaurer" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-white"><RotateCcw size={17} /></button>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
