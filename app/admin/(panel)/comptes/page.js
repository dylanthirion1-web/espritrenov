import { redirect } from "next/navigation";
import ComptesBoard from "@/components/ComptesBoard";
import { getSessionProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comptes" };

export default async function ComptesPage() {
  const { supabase, user, profile } = await getSessionProfile();
  if (profile?.role !== "admin") redirect("/admin");

  const { data } = await supabase.from("profiles").select("id, email, role").order("email", { ascending: true });

  return (
    <section>
      <p className="eyebrow">Accès</p>
      <h1 className="heading-style-h2 margin-bottom margin-medium">Comptes</h1>
      <ComptesBoard profiles={data || []} currentId={user.id} />
    </section>
  );
}
