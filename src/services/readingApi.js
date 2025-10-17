import { http } from "./http";

// —— START / FINISH —
export async function startReadingApi({ bookId, page }) {
  if (!bookId) throw new Error("Missing bookId");
  const { data } = await http.post("/books/reading/start", {
    id: bookId,
    page: Number(page),
  });
  return data;
}

// POST /books/reading/finish  body: { id: <bookId>, page }
export async function stopReadingApi({ bookId, page }) {
  if (!bookId) throw new Error("Missing bookId");
  const { data } = await http.post("/books/reading/finish", {
    id: bookId,
    page: Number(page),
  });
  return data;
}

// —— DETAILS 
// GET /books/{id}  → kitap + progress[]
export async function fetchReadingDetails({ bookId }) {
  if (!bookId) return { diary: [], stats: {} };
  const { data } = await http.get(`/books/${encodeURIComponent(bookId)}`);
  return normalizeBookDetails(data);
}

// —— DIARY DELETE —

export async function deleteDiaryEntry({ bookId, entryId }) {
  if (!bookId || !entryId) throw new Error("Missing bookId/entryId");
  const { data } = await http.delete("/books/reading", {
    params: { bookId, readingId: entryId },
  });
  return data;
}


function normalizeBookDetails(raw) {
  const totalPages = Number(raw?.totalPages ?? 0) || 0;
  const progress = Array.isArray(raw?.progress) ? raw.progress : [];


  const sessions = progress.map((p, i) => {
    const pages = Number(p?.readPages ?? 0) || 0;
    const status = p?.status || (p?.endReading ? "inactive" : "active");
    return {
      id: p?.id ?? p?._id ?? `${p?.startReading ?? "s"}-${i}`,
      start: p?.startReading ?? null,
      finish: p?.endReading ?? null,
      status, // "active" | "inactive"
      pages,
      speed: Number(p?.speed ?? 0) || 0,
    };
  });
  const active = sessions.find((s) => s.status === "active") || null;

  // Günlük satırları
  const diary = sessions.map((p, i) => {
    const pages = p.pages;
    const percent = totalPages > 0 ? Math.round((pages / totalPages) * 100) : 0;
    return {
      id: p.id,
      date: p.start,
      pages,
      minutes: 0, // response'ta süre yok → 0 bırakıyoruz
      percent,
      active: p.status === "active",
    };
  });

  // Basit istatistikler
  const totalRead = diary.reduce((s, d) => s + d.pages, 0);
  const speeds = sessions.map((p) => Number(p.speed || 0)).filter((v) => v > 0);
  const avgSpeed = speeds.length
    ? Math.round(speeds.reduce((s, v) => s + v, 0) / speeds.length)
    : 0;

  return {
    diary,
    activeReadingId: active?.id || null,
    stats: {
      totalPages,
      totalMinutes: 0, // süre verisi yok
      avgSpeed,
      currentStreak: 0, // response’ta yok
      totalRead,
          completion: totalPages ? Math.round((totalRead / totalPages) * 100) : 0, // ← ekledik

    },
  };
}
