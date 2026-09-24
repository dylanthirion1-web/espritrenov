"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Demandes" },
  { href: "/admin/realisations", label: "Réalisations" },
];

export default function AdminNav({ role }) {
  const pathname = usePathname();
  const links = role === "admin" ? [...LINKS, { href: "/admin/comptes", label: "Comptes" }] : LINKS;

  return (
    <nav className="admin_nav" aria-label="Administration">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link key={link.href} href={link.href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
            {link.label}
          </Link>
        );
      })}
      <Link href="/">Voir le site</Link>
    </nav>
  );
}
