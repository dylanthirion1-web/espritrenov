"use client";

import { usePathname } from "next/navigation";
import { SITE } from "@/lib/constants";

export default function Footer() {
  const pathname = usePathname();
  const hrefFor = (id) => (pathname === "/" ? `#${id}` : `/#${id}`);

  return (
    <footer className="section_footer">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-medium">
            <div className="footer_component">
              <div>
                <p className="brand_name">
                  Esprit <span className="text-gradient">Rénov&apos;</span>
                </p>
                <p className="text-color-muted margin-top margin-small max-width-small">
                  Rénovation intérieure et extérieure. Couverture, zinguerie et charpente.
                </p>
              </div>
              <div className="footer_meta">
                <a className="text-weight-bold" href={SITE.phoneHref}>
                  {SITE.phoneDisplay}
                </a>
                <a href={SITE.emailHref}>{SITE.email}</a>
                <nav className="footer_links margin-top margin-small" aria-label="Pied de page">
                  <a href={hrefFor("services")}>Services</a>
                  <a href={hrefFor("realisations")}>Réalisations</a>
                  <a href={hrefFor("a-propos")}>À propos</a>
                  <a href={hrefFor("contact")}>Contact</a>
                  <a href="/mentions-legales">Mentions légales</a>
                  <a href="/politique-de-confidentialite">Politique de confidentialité</a>
                </nav>
              </div>
            </div>
            <div className="footer_bottom margin-top margin-medium">
              <p className="text-size-small text-color-muted">© 2026 Esprit Rénov&apos; · {SITE.siretLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
