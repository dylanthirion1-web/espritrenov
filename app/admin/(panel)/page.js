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

  const ids = (data || []).map((lead) => lead.id);
  const { data: history } = ids.length
    ? await supabase
        .from("lead_history")
        .select("id, lead_id, statut, date_heure, created_at")
        .in("lead_id", ids)
        .order("created_at", { ascending: false })
    : { data: [] };

  const historyByLead = new Map();
  for (const entry of history || []) {
    const list = historyByLead.get(entry.lead_id) || [];
    list.push(entry);
    historyByLead.set(entry.lead_id, list);
  }

  const leads = (data || []).map((lead) => ({
    ...lead,
    history: historyByLead.get(lead.id) || [],
  }));

  return (
    <section>
      <p className="eyebrow">Tableau de bord</p>
      <h1 className="heading-style-h2 margin-bottom margin-medium">Demandes de devis</h1>
      <LeadsBoard leads={leads} />
    </section>
  );
}
