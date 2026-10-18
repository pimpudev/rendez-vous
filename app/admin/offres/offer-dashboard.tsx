"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import Link from "next/link";
import { getSupabaseClient } from "../../../lib/supabase";
import type { CourseOffer } from "../../../lib/course-offers";
import MarkdownContent from "../../markdown-content";

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
  requirements_fr: string;
  requirements_en: string;
  requirements_es: string;
  detail_points_fr: string;
  detail_points_en: string;
  detail_points_es: string;
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
  requirements_fr: "",
  requirements_en: "",
  requirements_es: "",
  detail_points_fr: "",
  detail_points_en: "",
  detail_points_es: "",
};

const fieldClassName = "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200";
const textareaClassName = `${fieldClassName} min-h-24`;

function MarkdownDescriptionField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="min-w-0">
      <label className="block text-sm font-semibold text-slate-800">
        {label}
        <textarea value={value} onChange={(event) => onChange(event.target.value)} className={textareaClassName} />
      </label>
      <div className="mt-3 border-t border-slate-200 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Aperçu</p>
        {value.trim()
          ? <MarkdownContent content={value} className="text-sm leading-6 text-slate-700" />
          : <p className="text-sm italic text-slate-400">Aucun descriptif saisi.</p>}
      </div>
    </div>
  );
}

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
    requirements_fr: offer.requirements_fr.join("\n"),
    requirements_en: offer.requirements_en.join("\n"),
    requirements_es: offer.requirements_es.join("\n"),
    detail_points_fr: offer.detail_points_fr.join("\n"),
    detail_points_en: offer.detail_points_en.join("\n"),
    detail_points_es: offer.detail_points_es.join("\n"),
  };
}

export default function OfferDashboard() {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(() =>
    getSupabaseClient() ? "checking" : "unconfigured",
  );
  const [offers, setOffers] = useState<CourseOffer[]>([]);
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
      .select("id, slug, category, name_fr, name_en, name_es, description_fr, description_en, description_es, price_inr, price_eur, requirements_fr, requirements_en, requirements_es, detail_points_fr, detail_points_en, detail_points_es, is_active, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      setErrorMessage("Impossible de charger les offres. Appliquez la migration Supabase 202610180005_localized_offer_lists.sql, puis rechargez cette page.");
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
      requirements_fr: form.requirements_fr.split("\n").map((point) => point.trim()).filter(Boolean),
      requirements_en: form.requirements_en.split("\n").map((point) => point.trim()).filter(Boolean),
      requirements_es: form.requirements_es.split("\n").map((point) => point.trim()).filter(Boolean),
      detail_points_fr: form.detail_points_fr.split("\n").map((point) => point.trim()).filter(Boolean),
      detail_points_en: form.detail_points_en.split("\n").map((point) => point.trim()).filter(Boolean),
      detail_points_es: form.detail_points_es.split("\n").map((point) => point.trim()).filter(Boolean),
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
        {accessStatus === "signed-out" && <Link href="/admin/login" className="font-semibold text-red-700 underline decoration-red-300 underline-offset-4">Se connecter</Link>}
        {accessStatus === "unconfigured" && <p role="alert" className="text-sm text-red-700">Supabase n’est pas configuré pour gérer les offres.</p>}
        {accessStatus === "denied" && <p role="alert" className="text-sm text-red-700">Ce compte ne dispose pas des droits administrateur.</p>}
        {accessStatus === "error" && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
      </section>
    );
  }

  const activeOffers = offers.filter((offer) => offer.is_active);
  const archivedOffers = offers.filter((offer) => !offer.is_active);

  return (
    <div className="flex flex-col gap-8">
      <section className="order-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
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

          <fieldset className="space-y-5 border-t border-slate-200 pt-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold text-slate-800">
                Nom en français
                <input required value={form.name_fr} onChange={(event) => setForm((current) => ({ ...current, name_fr: event.target.value }))} className={fieldClassName} />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Name in English
                <input value={form.name_en} onChange={(event) => setForm((current) => ({ ...current, name_en: event.target.value }))} className={fieldClassName} />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Nombre en español
                <input value={form.name_es} onChange={(event) => setForm((current) => ({ ...current, name_es: event.target.value }))} className={fieldClassName} />
              </label>
            </div>
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
          </fieldset>

          <fieldset className="space-y-4 border-t-2 border-red-300 pt-6">
            <legend className="px-1 text-xl font-black text-red-700">Page d'accueil</legend>
            <p className="border-l-4 border-slate-300 py-1 pl-3 text-sm font-bold text-slate-800">Liste à puces - un élément par ligne</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold text-slate-800">
                Français
                <textarea value={form.requirements_fr} onChange={(event) => setForm((current) => ({ ...current, requirements_fr: event.target.value }))} placeholder="Conversation détendue&#10;Focus sur la prononciation et l’aisance orale" className={textareaClassName} />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                English
                <textarea value={form.requirements_en} onChange={(event) => setForm((current) => ({ ...current, requirements_en: event.target.value }))} className={textareaClassName} />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Español
                <textarea value={form.requirements_es} onChange={(event) => setForm((current) => ({ ...current, requirements_es: event.target.value }))} className={textareaClassName} />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t-2 border-slate-400 pt-6">
            <legend className="px-1 text-xl font-black text-red-700">Page de l’offre</legend>
            <div className="space-y-4">
              <h3 className="border-l-4 border-slate-300 py-1 pl-3 text-base font-bold text-slate-800">Descriptif détaillé</h3>
              <p className="text-sm leading-6 text-slate-600">
                Mise en forme : <code className="rounded bg-slate-100 px-1 py-0.5">**gras**</code>, <code className="rounded bg-slate-100 px-1 py-0.5">*italique*</code>, ligne vide pour un paragraphe, <code className="rounded bg-slate-100 px-1 py-0.5">- élément</code> pour une liste, ou nouvelle ligne pour un retour à la ligne.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <MarkdownDescriptionField
                  label="Français"
                  value={form.description_fr}
                  onChange={(value) => setForm((current) => ({ ...current, description_fr: value }))}
                />
                <MarkdownDescriptionField
                  label="English"
                  value={form.description_en}
                  onChange={(value) => setForm((current) => ({ ...current, description_en: value }))}
                />
                <MarkdownDescriptionField
                  label="Español"
                  value={form.description_es}
                  onChange={(value) => setForm((current) => ({ ...current, description_es: value }))}
                />
              </div>
            </div>
            <div className="space-y-4 border-t border-slate-200 pt-4">
              <h3 className="border-l-4 border-slate-300 py-1 pl-3 text-base font-bold text-slate-800">Points essentiels</h3>
              <p className="text-sm text-slate-600">Une puce par ligne, une liste par langue.</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-semibold text-slate-800">
                  Français
                  <textarea value={form.detail_points_fr} onChange={(event) => setForm((current) => ({ ...current, detail_points_fr: event.target.value }))} placeholder="Focus sur la prononciation et l’aisance orale" className={textareaClassName} />
                </label>
                <label className="text-sm font-semibold text-slate-800">
                  English
                  <textarea value={form.detail_points_en} onChange={(event) => setForm((current) => ({ ...current, detail_points_en: event.target.value }))} className={textareaClassName} />
                </label>
                <label className="text-sm font-semibold text-slate-800">
                  Español
                  <textarea value={form.detail_points_es} onChange={(event) => setForm((current) => ({ ...current, detail_points_es: event.target.value }))} className={textareaClassName} />
                </label>
              </div>
            </div>
          </fieldset>

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

      <section className="order-1 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Offres publiées <span className="text-sm font-medium text-slate-500">({activeOffers.length})</span></h2>
        {activeOffers.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Aucune offre publiée.</p>}
        {activeOffers.map((offer) => (
          <article
            key={offer.id}
            aria-current={editingOffer?.id === offer.id ? "true" : undefined}
            className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5 shadow-sm transition-colors ${editingOffer?.id === offer.id ? "border-red-400 bg-red-50 ring-1 ring-red-300" : "border-slate-200 bg-white"}`}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-slate-900">{offer.name_fr}</p>
                {editingOffer?.id === offer.id && <span role="status" className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">Modification en cours</span>}
              </div>
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
        <section className="order-3 space-y-4">
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
