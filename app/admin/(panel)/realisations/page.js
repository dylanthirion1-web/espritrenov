import RealisationManager from "@/components/RealisationManager";
import { getSessionProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Réalisations" };

export default async function RealisationsPage() {
  const { supabase } = await getSessionProfile();
  const next = await supabase
    .from("realisations")
    .select("id, titre, description, categorie, avant_url, apres_url, ordre, publie, mise_en_avant")
    .order("ordre", { ascending: true })
    .order("created_at", { ascending: false });

  let data = next.data;
  if (next.error) {
    const legacy = await supabase
      .from("realisations")
      .select("id, titre, description, categorie, image_url, ordre, publie, mise_en_avant")
      .order("ordre", { ascending: true })
      .order("created_at", { ascending: false });
    const source = legacy.error
      ? await supabase
          .from("realisations")
          .select("id, titre, description, categorie, image_url, ordre, publie")
          .order("ordre", { ascending: true })
          .order("created_at", { ascending: false })
      : legacy;
    data = (source.data || []).map((item) => ({
      ...item,
      avant_url: null,
      apres_url: item.image_url || null,
      mise_en_avant: Boolean(item.mise_en_avant),
    }));
  }

  return (
    <section>
      <p className="eyebrow">Chantiers</p>
      <h1 className="heading-style-h2 margin-bottom margin-medium">Réalisations</h1>
      <RealisationManager realisations={data || []} />
    </section>
  );
}
