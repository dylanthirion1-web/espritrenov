import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { signOut } from "@/app/admin/actions";
import { getSessionProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }) {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile || !["admin", "directeur"].includes(profile.role)) {
    redirect("/admin/login?erreur=acces");
  }

  return (
    <div className="admin_shell">
      <aside className="admin_sidebar">
        <p className="brand_name">
          Esprit <span className="text-gradient">Rénov&apos;</span>
        </p>
        <AdminNav role={profile.role} />
        <p className="text-size-small text-color-muted">{profile.email}</p>
        <p className="text-size-small text-color-muted">{profile.role === "admin" ? "Admin" : "Directeur"}</p>
        <form action={signOut}>
          <button className="button is-secondary" type="submit">
            Déconnexion
          </button>
        </form>
      </aside>
      <div className="admin_main">{children}</div>
    </div>
  );
}
