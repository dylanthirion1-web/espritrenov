import { isImageUrl, isVideoUrl, safeMediaUrl } from "@/lib/media";

export default function ProjectMedia({ src, alt = "" }) {
  const url = safeMediaUrl(src);
  if (!url) return null;
  if (isVideoUrl(url)) {
    return <video src={url} controls playsInline preload="metadata" />;
  }
  if (isImageUrl(url)) {
    return <img src={url} alt={alt} />;
  }
  return (
    <a className="project_file" href={url} target="_blank" rel="noreferrer">
      Voir le fichier
    </a>
  );
}
