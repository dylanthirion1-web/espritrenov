"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { SITE } from "@/lib/constants";

const LINKS = [
  ["accueil", "Accueil"],
  ["services", "Services"],
  ["realisations", "Réalisations"],
  ["a-propos", "À propos"],
  ["contact", "Contact"],
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const hrefFor = (id) => (pathname === "/" ? `#${id}` : `/#${id}`);

  return (
    <header className={`section_header${scrolled ? " is-scrolled" : ""}`}>
      <div className="padding-global">
        <div className="container-large">
          <div className="header_component">
            <Logo href={pathname === "/" ? "#accueil" : "/"} />
            <nav className="nav" id="site-nav" data-open={open ? "true" : "false"} aria-label="Navigation principale">
              {LINKS.map(([id, label]) => (
                <a key={id} className="nav_link" href={hrefFor(id)} onClick={() => setOpen(false)}>
                  {label}
                </a>
              ))}
              <a className="nav_phone" href={SITE.phoneHref}>
                {SITE.phoneDisplay}
              </a>
              <a className="button nav_cta" href={hrefFor("devis")} onClick={() => setOpen(false)}>
                Demander un devis gratuit
              </a>
            </nav>
            <div className="header_actions">
              <a className="header_phone" href={SITE.phoneHref}>
                {SITE.phoneDisplay}
              </a>
              <a className="button is-compact header_cta" href={hrefFor("devis")}>
                <span className="header_cta_full">Demander un devis gratuit</span>
                <span className="header_cta_short">Devis</span>
              </a>
              <button
                className="nav_toggle"
                type="button"
                aria-expanded={open}
                aria-controls="site-nav"
                onClick={() => setOpen((value) => !value)}
              >
                <span className="nav_toggle_bar" />
                <span className="nav_toggle_bar" />
                <span className="nav_toggle_bar" />
                <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
