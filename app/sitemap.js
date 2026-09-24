import { SITE } from "@/lib/constants";

export default function sitemap() {
  const lastModified = new Date();
  return [
    { url: SITE.url, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/mentions-legales`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    {
      url: `${SITE.url}/politique-de-confidentialite`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
