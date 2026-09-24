import Link from "next/link";
import PublicShell from "@/components/PublicShell";

export default function NotFound() {
  return (
    <PublicShell>
      <section className="section_hero">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <h1 className="heading-style-h2">Page introuvable</h1>
              <p className="text-color-muted margin-top margin-small">Cette adresse ne correspond à aucune page du site.</p>
              <Link className="button margin-top margin-medium" href="/">
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
