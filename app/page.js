import PublicShell from "@/components/PublicShell";
import BeforeAfter from "@/components/BeforeAfter";
import ExpandableText from "@/components/ExpandableText";
import QuoteForm from "@/components/QuoteForm";
import { IconCharpente, IconCouverture, IconZinguerie } from "@/components/Icons";
import { SITE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SERVICES = [
  {
    title: "Couverture",
    icon: IconCouverture,
    text: "Pose et réparation de tuiles, ardoises ou zinc. Nous traitons les points sensibles (faîtage, rives, entrées d'eau) pour garder votre toit parfaitement étanche.",
  },
  {
    title: "Zinguerie",
    icon: IconZinguerie,
    text: "Gouttières, chéneaux et habillages sur mesure. L'eau de pluie est évacuée correctement, vos murs et façades restent protégés de l'humidité.",
  },
  {
    title: "Charpente",
    icon: IconCharpente,
    text: "Diagnostic, renforcement ou remplacement de la structure bois. On s'assure que votre charpente est saine avant toute intervention sur la couverture.",
  },
];

async function getRealisations() {
  const supabase = await createClient();
  if (!supabase) return [];
  const next = await supabase
    .from("realisations")
    .select("id, titre, description, categorie, avant_url, apres_url, mise_en_avant")
    .eq("publie", true)
    .order("mise_en_avant", { ascending: false })
    .order("ordre", { ascending: true })
    .order("created_at", { ascending: false });
  if (!next.error) return next.data || [];

  const legacy = await supabase
    .from("realisations")
    .select("id, titre, description, categorie, image_url, mise_en_avant")
    .eq("publie", true)
    .order("mise_en_avant", { ascending: false })
    .order("ordre", { ascending: true })
    .order("created_at", { ascending: false });
  const source = legacy.error
    ? await supabase
        .from("realisations")
        .select("id, titre, description, categorie, image_url")
        .eq("publie", true)
        .order("ordre", { ascending: true })
        .order("created_at", { ascending: false })
    : legacy;
  if (source.error) {
    console.error(source.error);
    return [];
  }
  return (source.data || []).map((item) => ({
    ...item,
    avant_url: null,
    apres_url: item.image_url || null,
    mise_en_avant: Boolean(item.mise_en_avant),
  }));
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
      name: "Nos services",
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
                <p className="eyebrow">Nos services</p>
                <h2 className="heading-style-h2">Votre toiture, protégée de A à Z</h2>
                <p className="text-size-large text-color-muted max-width-medium margin-top margin-small">
                  Que ce soit une réparation ponctuelle ou une rénovation complète, nous intervenons sur l&apos;ensemble de votre toiture : couverture, évacuation des eaux et structure.
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
                <p className="text-weight-bold">Une question sur votre toit ?</p>
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
                  <p className="eyebrow">Qui sommes-nous</p>
                  <h2 className="heading-style-h2">Une équipe à votre écoute, du premier contact à la fin du chantier</h2>
                  <p className="text-size-large text-color-muted margin-top margin-small">
                    Esprit Rénov&apos; intervient sur tous vos travaux de couverture, zinguerie et charpente, à Nancy et dans un rayon de 150 km.
                  </p>
                  <p className="text-color-muted margin-top margin-small">
                    Chaque devis détaille clairement les travaux prévus, le délai et le prix, sans surprise. Vous restez libre de votre décision, sans aucun engagement.
                  </p>
                  <p className="text-color-muted margin-top margin-small">
                    Un seul interlocuteur vous accompagne du premier rendez-vous jusqu&apos;à la réception du chantier.
                  </p>
                  <a className="button margin-top margin-medium" href="#devis">
                    Demander un devis gratuit
                  </a>
                </div>
                <ul className="about_badges" aria-label="Repères">
                  <li className="about_badge">Nancy et Grand Est</li>
                  <li className="about_badge">Devis sous 48h</li>
                  <li className="about_badge">Assuré & garantie décennale</li>
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
                        <BeforeAfter avant={item.avant_url} apres={item.apres_url} alt={item.titre} />
                        <div className="project_body">
                          <p className="project_tag">{item.categorie}</p>
                          {item.mise_en_avant ? <p className="project_tag">Mis en avant</p> : null}
                          <h3 className="heading-style-h3">{item.titre}</h3>
                          {item.description ? (
                            <ExpandableText text={item.description} className="text-size-small text-color-muted" />
                          ) : null}
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
