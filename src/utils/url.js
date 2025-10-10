export function toAbsoluteUrl(raw) {
  if (!raw) return "";
  let u = String(raw).trim();

  // boş, null benzerlerini ele
  if (!u || u === "null" || u === "undefined") return "";

  // //domain/... → https: ekle
  if (u.startsWith("//")) u = "https:" + u;

  // http → https
  if (u.startsWith("http://")) u = "https://" + u.slice(7);

  // ftp.goit.study → https://ftp.goit.study (bazı backend’lerde şema eksik olabiliyor)
  if (u.startsWith("ftp.goit.study")) u = "https://" + u;

  // ./, /img/... gibi göreli yolları elersen (senin app’in public kökü)
  if (u.startsWith("/")) {
    const origin = (import.meta.env.VITE_ASSETS_ORIGIN || window.location.origin).replace(/\/+$/,"");
    u = origin + u;
  }

  return u;
}