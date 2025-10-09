import { http } from "./http";
import { toAbsoluteUrl } from "../utils/url";

/* =========================
   ADD from Recommended (modal)
   POST /books/add  -> { title, author, totalPages }
   ========================= */
export async function addToLibraryApi(book) {
  if (!book) throw new Error("Missing book object");

  const title = book.title ?? book.name ?? "";
  const author = book.author ?? book.authors ?? "";
  const totalPages =
    Number(
      book.totalPages ?? book.pages ?? book.pageCount ?? book.total_pages ?? 0
    ) || undefined;

  if (!title) throw new Error("Missing title");
  if (!totalPages) throw new Error("Missing total pages");

  const payload = { title, author, totalPages };

  try {
    const { data } = await http.post("/books/add", payload);
    return data;
  } catch (err) {
    const status = err?.response?.status || 0;
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Add to library failed";
    const e = new Error(message);
    e.status = status;
    e.normalizedMessage = message;
    throw e;
  }
}

/* =========================
   ADD from My Library form
   POST /books/add -> { title, author, totalPages }
   ========================= */
export async function addOwnBookApi({ title, author, totalPages }) {
  const payload = {
    title: title?.trim(),
    author: author?.trim(),
    totalPages: Number(totalPages),
  };
  const { data } = await http.post("/books/add", payload);
  return data;
}

/* =========================
   LIST My Library
   GET /books/own
   Normalize items (id/title/author/cover/status)
   ========================= */
export async function fetchLibraryList(status = "") {
  const params = {};
  if (status) params.status = status; // backend destekliyorsa kullanır

  const { data } = await http.get("/books/own", { params });

  const list = data?.items || data?.results || data?.data || data || [];
  return list.map((b, i) => ({
    id: b.id ?? b._id ?? b.bookId ?? i,
    title: b.title ?? b.name ?? "Untitled",
    author: b.author ?? b.authors ?? "Unknown",
    cover: toAbsoluteUrl(
      b.cover ?? b.image ?? b.imageUrl ?? b.coverUrl ?? b.book_image_url ?? ""
    ),
    status: b.status ?? b.readingStatus ?? "",
  }));
}

/* =========================
   REMOVE from My Library
   Try common endpoints; prefer DELETE /books/own/:id
   ========================= */
export async function removeLibraryBook(bookId) {
  if (!bookId) throw new Error("Missing bookId");

  const candidates = [
    { method: "delete", url: `/books/own/${bookId}` }, // en olası
    { method: "delete", url: `/library/${bookId}` },
    { method: "delete", url: `/users/books/${bookId}` },
    { method: "delete", url: `/books/${bookId}/remove` },
    { method: "post",   url: `/books/remove`, data: { bookId } },
  ];

  let lastErr;
  for (const c of candidates) {
    try {
      const { data } = await http.request(c);
      return data;
    } catch (e) {
      lastErr = e;
      const code = e?.response?.status || 0;
      if (code === 401 || code === 403) throw e; // yetki hatası → dur
      // diğerlerinde sıradaki adayı denemeye devam
    }
  }
  throw lastErr || new Error("Failed to remove book");
}
