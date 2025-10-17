import { http } from "./http";
import { toAbsoluteUrl } from "../utils/url";
import { findCover } from "../utils/coverCache";

export async function addToLibraryApi(book) {
  if (!book) throw new Error("Missing book object");

  const title = book.title ?? book.name ?? "";
  const author = book.author ?? book.authors ?? "";
  const totalPages =
    Number(
      book.totalPages ?? book.pages ?? book.pageCount ?? book.total_pages ?? 0,
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


export async function addOwnBookApi({ title, author, totalPages }) {
  const payload = {
    title: title?.trim(),
    author: author?.trim(),
    totalPages: Number(totalPages),
  };
  const { data } = await http.post("/books/add", payload);
  return data;
}


export async function fetchLibraryList(status = "") {
  const params = {};
  if (status) params.status = status;

  const { data } = await http.get("/books/own", { params });
  const list = data?.items || data?.results || data?.data || data || [];
 const normalized = list.map((b, i) => {
    const nested = b.book || {};
   const coverRaw = b.cover ?? b.image ?? b.imageUrl ?? b.imageURL ?? b.coverUrl ??
                   nested.cover ?? nested.image ?? nested.imageUrl ?? nested.coverUrl ?? "";
    return {
        ownId: b.id ?? b._id ?? null,
    bookId: b.bookId ?? nested.id ?? nested._id ?? null,
    id: (b.id ?? b._id ?? b.bookId ?? i),
    title: b.title ?? b.name ?? nested.title ?? nested.name ?? "Untitled",
    author: b.author ?? b.authors ?? nested.author ?? nested.authors ?? "Unknown",
    cover: toAbsoluteUrl(coverRaw),
    status: b.status ?? b.readingStatus ?? "",
    _raw: b,
    };
    return item;
  });

  for (const it of normalized) {
    if (!it.cover) {
      const cached = findCover({ id: it.bookId, title: it.title, author: it.author });
      if (cached) it.cover = toAbsoluteUrl(cached);
    }
 }
 return normalized;
}


export async function removeLibraryBook(item) {
  if (!item) throw new Error("Missing item");

  const ownId = item.ownId ?? item.id ?? item._raw?.id ?? item._raw?._id;
  if (!ownId) throw new Error("Missing ownId (library record id)");

  // Swagger: DELETE /books/remove/{id}
  const url = `/books/remove/${encodeURIComponent(String(ownId))}`;

  try {
    const { data } = await http.delete(url);
    return data; // ör: { message: "This book was deleted", id: "..." }
  } catch (err) {
    const status = err?.response?.status || 0;
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Failed to remove book";
    const e = new Error(message);
    e.status = status;
    e.normalizedMessage = message;
    throw e;
  }
}