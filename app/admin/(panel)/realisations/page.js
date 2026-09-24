import RealisationManager from "@/components/RealisationManager";
import { getSessionProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Réalisations" };

export default async function RealisationsPage() {
  const { supabase } = await getSessionProfile();
  const { data } = await supabase
    .from("realisations")
    .select("id, titre, description, categorie, image_url, ordre, publie")
    .order("ordre", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <section>
      <p className="eyebrow">Chantiers</p>
      <h1 className="heading-style-h2 margin-bottom margin-medium">Réalisations</h1>
      <RealisationManager realisations={data || []} />
    </section>
  );
}
