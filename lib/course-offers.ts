import { getSupabaseClient } from "./supabase";

export type CourseOffer = {
  id: string;
  slug: string;
  category: "individual" | "group";
  name_fr: string;
  name_en: string;
  name_es: string;
  description_fr: string;
  description_en: string;
  description_es: string;
  price_inr: number;
  price_eur: number;
  requirements_fr: string[];
  requirements_en: string[];
  requirements_es: string[];
  detail_points_fr: string[];
  detail_points_en: string[];
  detail_points_es: string[];
  is_active: boolean;
  created_at: string;
};

export async function fetchPublishedOffers() {
  const supabase = getSupabaseClient();
  if (!supabase) return { offers: null, error: "Supabase is not configured" };

  const { data, error } = await supabase
    .from("course_offers")
    .select("id, slug, category, name_fr, name_en, name_es, description_fr, description_en, description_es, price_inr, price_eur, requirements_fr, requirements_en, requirements_es, detail_points_fr, detail_points_en, detail_points_es, is_active, created_at")
    .eq("is_active", true)
    .order("price_inr", { ascending: true })
    .order("name_fr", { ascending: true });

  if (error) return { offers: null, error: error.message };
  return { offers: (data ?? []) as CourseOffer[], error: null };
}