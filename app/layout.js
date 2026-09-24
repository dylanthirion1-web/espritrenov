import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "800"],
});

const description =
  "Esprit Rénov' réalise la couverture, la zinguerie et la charpente, en rénovation intérieure et extérieure. Devis gratuit, réponse sous 48 h.";

export const metadata = {
  metadataBase: new URL("https://www.espritrenov.fr"),
  title: {
    default: "Esprit Rénov' | Rénovation intérieure et extérieure",
    template: "%s | Esprit Rénov'",
  },
  description,
  applicationName: "Esprit Rénov'",
  authors: [{ name: "Esprit Rénov'" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.espritrenov.fr",
    siteName: "Esprit Rénov'",
    title: "Esprit Rénov' | Rénovation intérieure et extérieure",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Esprit Rénov' | Rénovation intérieure et extérieure",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#0B0B0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={montserrat.className}>
        <svg className="defs-svg" aria-hidden="true">
          <defs>
            <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EC3F9C" />
              <stop offset="50%" stopColor="#8B3DF5" />
              <stop offset="100%" stopColor="#5B4BFF" />
            </linearGradient>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
