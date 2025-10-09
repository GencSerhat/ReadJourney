export function toAbsoluteUrl(url) {
  if (!url) return "";
  // Zaten mutlaksa dokunma
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;

  // .env’deki base ya da window.location.origin ile tamamla
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+api\/?$/, "");
  const origin = base || window.location.origin;
  const left = url.startsWith("/") ? "" : "/";
  return `${origin}${left}${url}`;
}
