const VIDEO_EXT = /\.(mp4|mov|webm|m4v|ogv)(?:$|\?|#)/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)(?:$|\?|#)/i;

export function safeMediaUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

export function isVideoUrl(url) {
  return VIDEO_EXT.test(String(url || ""));
}

export function isImageUrl(url) {
  return IMAGE_EXT.test(String(url || ""));
}
