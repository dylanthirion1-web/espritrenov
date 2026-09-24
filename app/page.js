import PublicShell from "@/components/PublicShell";
import ProjectMedia from "@/components/ProjectMedia";
import QuoteForm from "@/components/QuoteForm";
import { IconCharpente, IconCouverture, IconZinguerie } from "@/components/Icons";
import { SITE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SERVICES = [
  {
    title: "Couverture",
    icon: IconCouverture,
    text: "Tuiles, ardoises ou système adapté au bâti. Les entrées d'eau, le faîtage et les rives sont repris avant que l'humidité n'atteigne les pièces.",
  },
  {
    title: "Zinguerie",
    icon: IconZinguerie,
    text: "Gouttières, chéneaux, noues, solins et habillages. L'eau est conduite, les murs restent secs, les jonctions avec la façade restent nettes.",
  },
  {
    title: "Charpente",
    icon: IconCharpente,
    text: "Contrôle, renfort et reprise du bois, traditionnel ou industriel. La structure est vérifiée avant de reposer la couverture.",
  },
];

async function getRealisations() {
  const supabase = await createClient();
  if (!supabase) return [];
  const featured = await supabase
    .from("realisations")
    .select("id, titre, description, categorie, image_url, mise_en_avant")
    .eq("publie", true)
    .order("mise_en_avant", { ascending: false })
    .order("ordre", { ascending: true })
    .order("created_at", { ascending: false });
  if (!featured.error) return featured.data || [];

  const fallback = await supabase
    .from("realisations")
    .select("id, titre, description, categorie, image_url")
    .eq("publie", true)
    .order("ordre", { ascending: true })
    .order("created_at", { ascending: false });
  if (fallback.error) {
    console.error(fallback.error);
    return [];
  }
  return (fallback.data || []).map((item) => ({ ...item, mise_en_avant: false }));
}

export default async function HomePage() {
  const realisations = await getRealisations();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.name,
    url: SITE.url,
    telephone: "+33780641511",
    email: SITE.email,
    image: `${SITE.url}/opengraph-image`,
    description:
      "Entreprise de rénovation intérieure et extérieure, spécialisée en couverture, zinguerie et charpente.",
    areaServed: SITE.zone,
    iso6523Code: "0002:13021026300013",
    identifier: {
      "@type": "PropertyValue",
      name: "SIRET",
      value: "13021026300013",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Métiers",
      itemListElement: SERVICES.map((service) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: service.title },
      })),
    },
  };

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="section_hero" id="accueil">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <div className="hero_component">
                <p className="hero_badge">{SITE.zone}</p>
                <h1 className="heading-style-h1">
                  Esprit <span className="text-gradient">Rénov&apos;</span>
                </h1>
                <p className="hero_subtitle">Rénovation intérieure & extérieure</p>
                <a className="button" href="#devis">
                  Demander un devis gratuit
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section_services" id="services">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <div className="section_heading margin-bottom margin-large">
                <p className="eyebrow">Métiers</p>
                <h2 className="heading-style-h2">Trois gestes pour un bâtiment au sec.</h2>
                <p className="text-size-large text-color-muted max-width-medium margin-top margin-small">
                  Couverture, zinguerie et charpente avancent ensemble. Quand le projet le demande, la rénovation se poursuit à l&apos;intérieur comme à l&apos;extérieur.
                </p>
              </div>
              <div className="services_grid">
                {SERVICES.map((service) => {
                  const Icon = service.icon;
                  return (
                    <article className="service_card" key={service.title}>
                      <div className="service_icon">
                        <Icon />
                      </div>
                      <h3 className="heading-style-h3">{service.title}</h3>
                      <p className="text-color-muted">{service.text}</p>
                    </article>
                  );
                })}
              </div>
              <div className="services_band">
                <p className="text-weight-bold">Un avis sur votre toit, tout de suite ?</p>
                <a className="band_phone" href={SITE.phoneHref}>
                  {SITE.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section_about" id="a-propos">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <div className="about_component">
                <div>
                  <p className="eyebrow">À propos</p>
                  <h2 className="heading-style-h2">Qui sommes-nous</h2>
                  <p className="text-size-large text-color-muted margin-top margin-small">
                    Esprit Rénov&apos; suit la maison dans son ensemble : pièces de vie, façades, et d&apos;abord le clos et le couvert. La couverture, la zinguerie et la charpente restent le cœur du travail.
                  </p>
                  <p className="text-color-muted margin-top margin-small">
                    Le devis nomme les postes, le délai et ce qui reste en dehors du marché. Vous décidez ensuite, sans engagement. Un seul interlocuteur reste joignable du premier passage sur le toit jusqu&apos;à la réception.
                  </p>
                  <a className="button margin-top margin-medium" href="#devis">
                    Demander un devis gratuit
                  </a>
                </div>
                <ul className="about_badges" aria-label="Repères">
                  <li className="about_badge">{SITE.zone}</li>
                  <li className="about_badge">DEVIS SOUS 48 H</li>
                  <li className="about_badge">ASSURÉ & DÉCENNALE</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section_realisations" id="realisations">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <div className="section_heading margin-bottom margin-large">
                <p className="eyebrow">Chantiers</p>
                <h2 className="heading-style-h2">Des toitures déjà reprises.</h2>
              </div>
              {realisations.length === 0 ? (
                <p className="empty_state">Les premières photos de chantier seront publiées ici.</p>
              ) : (
                <div className="realisations_grid">
                  {realisations.map((item) => (
                      <article className="project_card" key={item.id}>
                        <div className="project_media">
                          <ProjectMedia src={item.image_url} alt={item.titre} />
                        </div>
                        <div className="project_body">
                          <p className="project_tag">{item.categorie}</p>
                          {item.mise_en_avant ? <p className="project_tag">Mis en avant</p> : null}
                          <h3 className="heading-style-h3">{item.titre}</h3>
                          {item.description ? <p className="text-size-small text-color-muted">{item.description}</p> : null}
                        </div>
                      </article>
                    ))}
                </div>
              )}
              <div className="project_cta">
                <h3 className="heading-style-h3">Un chantier similaire ?</h3>
                <p className="text-color-muted">Décrivez le vôtre. Nous vous disons si le déplacement est possible, et sous quel délai.</p>
                <a className="button" href="#devis">
                  Demander un devis gratuit
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section_devis" id="contact">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <div id="devis" />
              <div className="contact_component">
                <div>
                  <p className="eyebrow">Contact</p>
                  <h2 className="heading-style-h2">Devis gratuit</h2>
                  <p className="text-size-large text-color-muted margin-top margin-small">
                    Nom, téléphone et type de travaux suffisent pour ouvrir le dossier. Ajoutez ce que vous voyez : tuiles déplacées, gouttière percée, charpente qui fléchit, trace d&apos;eau dans une pièce.
                  </p>
                  <div className="contact_card margin-top margin-medium">
                    <dl className="contact_details">
                      <div>
                        <dt>Téléphone</dt>
                        <dd>
                          <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>
                        </dd>
                      </div>
                      <div>
                        <dt>E-mail</dt>
                        <dd>
                          <a href={SITE.emailHref}>{SITE.email}</a>
                        </dd>
                      </div>
                      <div>
                        <dt>SIRET</dt>
                        <dd>
                          <strong>{SITE.siret}</strong>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <div className="contact_card">
                  <QuoteForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
