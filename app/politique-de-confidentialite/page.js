import PublicShell from "@/components/PublicShell";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité du site Esprit Rénov' : formulaire de devis et photos de chantier.",
  alternates: { canonical: "/politique-de-confidentialite" },
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <section className="section_legal">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <p className="eyebrow">Données</p>
              <h1 className="heading-style-h2">Politique de confidentialité</h1>
              <div className="margin-top margin-medium">
                <article className="legal_card">
                  <h2 className="heading-style-h3">Responsable</h2>
                  <p>
                    Esprit Rénov&apos;, {SITE.siretLabel}, joignable au {SITE.phoneDisplay} et à {SITE.email}, est responsable des données collectées via ce site.
                  </p>
                </article>
                <article className="legal_card">
                  <h2 className="heading-style-h3">Données recueillies</h2>
                  <p>
                    Le formulaire de devis enregistre le nom, le téléphone, l&apos;e-mail, le type de travaux et la description du projet. Ces informations servent uniquement à répondre à la demande et à suivre le chantier éventuel.
                  </p>
                  <p>
                    L&apos;espace interne enregistre aussi les comptes des personnes habilitées (e-mail et rôle) et les photos des réalisations publiées.
                  </p>
                </article>
                <article className="legal_card">
                  <h2 className="heading-style-h3">Base et durée</h2>
                  <p>
                    La demande de devis repose sur l&apos;intérêt de la personne à être recontactée. Les données sont conservées le temps du suivi commercial, puis le temps des obligations comptables si un marché est signé.
                  </p>
                </article>
                <article className="legal_card">
                  <h2 className="heading-style-h3">Destinataires</h2>
                  <p>Les données ne sont pas vendues et ne servent pas à de la publicité.</p>
                  <p>Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.</p>
                  <p>
                    La base et les photos sont hébergées par Supabase Pte. Ltd., 65 Chulia Street #38-02/03, OCBC Centre, Singapore 049513. Des transferts hors Union européenne peuvent avoir lieu dans ce cadre. La politique de Supabase est disponible sur{" "}
                    <a href="https://supabase.com/privacy" rel="noopener noreferrer">
                      supabase.com/privacy
                    </a>
                    .
                  </p>
                </article>
                <article className="legal_card">
                  <h2 className="heading-style-h3">Vos droits</h2>
                  <p>
                    Vous pouvez demander l&apos;accès, la rectification ou l&apos;effacement de vos informations, ou limiter leur utilisation, en écrivant à {SITE.email}. Vous pouvez aussi saisir la CNIL.
                  </p>
                </article>
                <article className="legal_card">
                  <h2 className="heading-style-h3">Cookies</h2>
                  <p>
                    Le site public ne dépose pas de cookie publicitaire et n&apos;utilise pas d&apos;outil de mesure d&apos;audience. Un cookie technique de session est utilisé seulement pour la connexion à l&apos;espace interne.
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
