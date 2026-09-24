import LeadsBoard from "@/components/LeadsBoard";
import { getSessionProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Demandes" };

export default async function DashboardPage() {
  const { supabase } = await getSessionProfile();
  const { data } = await supabase
    .from("leads")
    .select("id, created_at, nom, telephone, email, type_travaux, adresse, ville, code_postal, projet, statut")
    .order("created_at", { ascending: false });

  return (
    <section>
      <p className="eyebrow">Tableau de bord</p>
      <h1 className="heading-style-h2 margin-bottom margin-medium">Demandes de devis</h1>
      <LeadsBoard leads={data || []} />
    </section>
  );
}
