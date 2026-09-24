import PublicShell from "@/components/PublicShell";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Esprit Rénov', couverture, zinguerie et charpente.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <PublicShell>
      <section className="section_legal">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <p className="eyebrow">Informations</p>
              <h1 className="heading-style-h2">Mentions légales</h1>
              <div className="margin-top margin-medium">
                <article className="legal_card">
                  <h2 className="heading-style-h3">Éditeur</h2>
                  <p>Esprit Rénov&apos; — rénovation intérieure et extérieure, couverture, zinguerie et charpente.</p>
                  <p>{SITE.siretLabel}</p>
                  <p>
                    Téléphone : <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>
                  </p>
                  <p>
                    E-mail : <a href={SITE.emailHref}>{SITE.email}</a>
                  </p>
                  <p>Directeur de la publication : le représentant légal d&apos;Esprit Rénov&apos;.</p>
                </article>
                <article className="legal_card">
                  <h2 className="heading-style-h3">Hébergement du site</h2>
                  <p>Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.</p>
                  <p>
                    <a href="https://vercel.com/legal" rel="noopener noreferrer">
                      vercel.com/legal
                    </a>
                  </p>
                </article>
                <article className="legal_card">
                  <h2 className="heading-style-h3">Données et photos</h2>
                  <p>
                    Les demandes de devis et les photos de chantier sont enregistrées chez Supabase Pte. Ltd., 65 Chulia Street #38-02/03, OCBC Centre, Singapore 049513.
                  </p>
                  <p>
                    Le détail des données collectées est décrit dans la{" "}
                    <a href="/politique-de-confidentialite">politique de confidentialité</a>.
                  </p>
                </article>
                <article className="legal_card">
                  <h2 className="heading-style-h3">Propriété intellectuelle</h2>
                  <p>
                    Les textes, la structure des pages et les éléments graphiques de ce site sont réservés. Les photographies de chantier appartiennent à Esprit Rénov&apos;, sauf mention contraire. Toute reproduction non autorisée est interdite.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
