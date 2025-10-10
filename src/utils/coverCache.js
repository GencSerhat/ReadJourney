const KEY = "coverCache.v1";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(obj) { localStorage.setItem(KEY, JSON.stringify(obj)); }

export function rememberCover({ id, title, author, cover }) {
  if (!cover) return;
  const cache = load();

  if (id) cache[`id:${id}`] = cover;

  const k1 = (title || "").trim().toLowerCase();
  const k2 = (author || "").trim().toLowerCase();
  if (k1) cache[`ta:${k1}|${k2}`] = cover;

  save(cache);
}

export function findCover({ id, title, author }) {
  const cache = load();
  if (id && cache[`id:${id}`]) return cache[`id:${id}`];

  const k1 = (title || "").trim().toLowerCase();
  const k2 = (author || "").trim().toLowerCase();
  return cache[`ta:${k1}|${k2}`] || "";
}
