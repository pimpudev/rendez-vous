import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../site-header";
import MarkdownContent from "../../markdown-content";
import { fetchPublishedOffers } from "../../../lib/course-offers";
import OfferDetailPoints from "./offer-detail-points";

const legacyOffers = {
  "individuel-professionnel": {
    category: "INDIVIDUEL",
    name: "Sur Mesure",
    price: "3000 roupies = 30 euros / heure",
    description: "Documents techniques / spécialisés",
    limits: ["Parcours unique créé pour l’étudiant", "Accompagnement vers un objectif personnel ou professionnel personnalisé"],
  },
  "individuel-delf-dalf": {
    category: "INDIVIDUEL",
    name: "Académique",
    price: "2500 roupies = 25 euros / heure",
    description: "Préparation aux examens",
    limits: ["DELF DALF", "TCF", "TEF"],
  },
  "individuel-cours-libre": {
    category: "INDIVIDUEL",
    name: "C’est la vie",
    price: "2500 roupies = 25 euros / heure",
    description: "Documents authentiques",
    limits: ["Grammaire", "Sujets d’actualité", "Débat"],
  },
  "individuel-conversation": {
    category: "INDIVIDUEL",
    name: "BlaBlaBla",
    price: "2000 roupies = 20 euros / heure",
    description: "Conversation détendue",
    limits: ["Focus sur la prononciation et l’aisance orale"],
  },
  "groupe-delf-a1-a2-b1": {
    category: "GROUPE",
    name: "Académique",
    price: "1000 roupies = 10 euros / heure",
    description: "Préparation aux examens",
    limits: ["DELF A1 – A2 - B1"],
  },
  "groupe-delf-b2-dalf-c1-c2": {
    category: "GROUPE",
    name: "Académique Avancé",
    price: "1500 roupies = 15 euros / heure",
    description: "Préparation aux examens",
    limits: ["DELF B2", "DALF C1 – C2", "TCF", "TEF"],
  },
  "groupe-cours-libre": {
    category: "GROUPE",
    name: "C’est la vie",
    price: "1000 roupies = 10 euros / heure",
    description: "Documents authentiques",
    limits: ["Grammaire", "Sujets d’actualité", "Débat"],
  },
  "groupe-conversation": {
    category: "GROUPE",
    name: "BlaBlaBla",
    price: "500 roupies = 5 euros / heure",
    description: "Conversation détendue",
    limits: ["Focus sur la prononciation et l’aisance orale"],
  },
} as const;

export default async function OfferPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { offers: publishedOffers } = await fetchPublishedOffers();
  const publishedOffer = publishedOffers?.find((item) => item.slug === slug);
  const legacyOffer = legacyOffers[slug as keyof typeof legacyOffers];
  const offer = publishedOffers === null
    ? legacyOffer
    : publishedOffer
      ? {
        category: publishedOffer.category === "individual" ? "INDIVIDUEL" : "GROUPE",
        name: publishedOffer.name_fr,
        description: publishedOffer.description_fr,
        price: `${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(publishedOffer.price_inr)} = ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(publishedOffer.price_eur)} / heure`,
      }
      : undefined;
  const detailPoints = publishedOffer
    ? {
      fr: publishedOffer.detail_points_fr,
      en: publishedOffer.detail_points_en,
      es: publishedOffer.detail_points_es,
    }
    : {
      fr: [...(legacyOffer?.limits ?? [])],
      en: [],
      es: [],
    };

  if (!offer) {
    notFound();
  }

  return (
    <main className="site-shell min-h-screen bg-[linear-gradient(180deg,_#EAF3F8_0%,_#DDECF5_45%,_#C9DDEA_100%)] px-6 py-8 text-slate-800 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SiteHeader />

        <section className="mx-auto max-w-4xl px-2 pb-10 pt-14 text-center sm:pt-16">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">OFFRE</h1>
          <p className="mt-4 text-lg font-bold uppercase tracking-[0.2em] text-red-600 sm:text-xl">
            {offer.category === "INDIVIDUEL" ? "INDIVIDUELLE" : "GROUPE"}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{offer.name}</h2>
          <p className="mt-4 text-lg font-bold text-slate-900">{offer.price}</p>
        </section>

        <section className="mx-auto max-w-4xl pb-8">
          <MarkdownContent content={offer.description} className="text-left text-lg leading-8 text-slate-600" />
          <OfferDetailPoints points={detailPoints} />
        </section>

        <div className="pb-16 text-center">
          <Link
            href={`/formulaire?offre=${encodeURIComponent(offer.name)}&type=${offer.category === "INDIVIDUEL" ? "individual" : "group"}`}
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500 sm:text-lg"
          >
            Réserver ce cours
          </Link>
        </div>
      </div>
    </main>
  );
}