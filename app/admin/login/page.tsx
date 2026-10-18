import SiteHeader from "../../site-header";
import AdminLoginForm from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const returnTo = Array.isArray(next) ? (next[0] ?? "/admin") : (next ?? "/admin");

  return (
    <main className="site-shell min-h-screen bg-[linear-gradient(180deg,_#EAF3F8_0%,_#DDECF5_45%,_#C9DDEA_100%)] px-6 py-8 text-slate-800 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SiteHeader />
        <section className="mx-auto max-w-md pb-20 pt-12 sm:pt-16">
          <h1 className="text-center text-3xl font-black tracking-tight text-red-600 sm:text-4xl">ADMIN</h1>
          <h2 className="mt-3 text-center text-2xl font-bold text-slate-900">Connexion</h2>
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <AdminLoginForm returnTo={returnTo} />
          </div>
        </section>
      </div>
    </main>
  );
}
