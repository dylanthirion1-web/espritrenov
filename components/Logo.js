import Link from "next/link";

export default function Logo({ href = "/" }) {
  return (
    <Link className="brand" href={href} aria-label="Esprit Rénov', accueil">
      <svg className="brand_mark" viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M8 30 L32 10 L56 30"
          fill="none"
          stroke="url(#brand-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 30 V50 H48 V30"
          fill="none"
          stroke="url(#brand-gradient)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M32 16 V50" fill="none" stroke="url(#brand-gradient)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="brand_name">
        Esprit <span className="text-gradient">Rénov&apos;</span>
      </span>
    </Link>
  );
}
