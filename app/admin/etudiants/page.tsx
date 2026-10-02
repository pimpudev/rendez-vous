import AdminDashboard from "../admin-dashboard";
import AdminHeader from "../admin-header";

export default function StudentsAdminPage() {
  return (
    <main className="site-shell min-h-screen bg-[linear-gradient(180deg,_#EAF3F8_0%,_#DDECF5_45%,_#C9DDEA_100%)] px-6 py-8 text-slate-800 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AdminHeader />
        <AdminDashboard />
      </div>
    </main>
  );
}