import { http } from "./http";
import { toAbsoluteUrl } from "../utils/url";

export async function fetchRecommendedBooks({ page = 1, limit = 6, title = "", author = "" } = {}) {
  const params = { page, limit };
  if (title) params.title = title;
  if (author) params.author = author;

  const { data } = await http.get("/books/recommend", { params });

  const rawItems =
    data?.items ||
    data?.results ||
    data?.data?.items ||
    data?.data?.results ||
    data?.books ||
    data?.data ||
    [];

  const currentPage =
    data?.page ?? data?.currentPage ?? data?.data?.page ?? page;

  const perPage =
    data?.limit ?? data?.perPage ?? data?.data?.limit ?? limit;

  const total =
    data?.total ?? data?.totalCount ?? data?.data?.total ??
    (data?.totalPages ? data.totalPages * perPage : undefined);

  const totalPages =
    data?.totalPages ?? data?.pageCount ?? data?.data?.totalPages ??
    (total ? Math.max(1, Math.ceil(total / perPage)) : 1);

  const items = rawItems.map((b, idx) => {
    const rawCover =
      b.cover || b.image || b.imageUrl || b.imageURL ||
      b.coverUrl || b.coverURL || b.img || b.thumbnail ||
      b.thumb || b.book_image || b.book_image_url || "";

    // ★ total sayfa için geniş eşleme:
    const pages =
      Number(
        b.totalPages ?? b.pages ?? b.pageCount ?? b.total_pages ?? b.total ?? 0
      ) || undefined;

    return {
      id: b.id ?? b._id ?? b.bookId ?? `${currentPage}-${idx}`,
      title: b.title ?? b.name ?? "Untitled",
      author: b.author ?? b.authors ?? "Unknown",
      cover: toAbsoluteUrl(rawCover),
      totalPages: pages, // ★ EKLENDİ
    };
  });

  return { items, page: currentPage, totalPages, total };
}

export async function fetchBookById(id) {
  if (!id) throw new Error("Missing id");
  // En yaygın detay endpoint: /books/:id
  const { data } = await http.get(`/books/${id}`);
  const b = data?.book || data?.data || data; // farklı yanıt şekilleri

  // Normalize
  const totalPages =
    Number(b?.totalPages ?? b?.pages ?? b?.pageCount ?? b?.total_pages ?? 0) || undefined;

  return {
    id: b?.id ?? b?._id ?? id,
    title: b?.title ?? b?.name ?? "Untitled",
    author: b?.author ?? b?.authors ?? "Unknown",
    cover: toAbsoluteUrl(
      b?.cover ?? b?.image ?? b?.imageUrl ?? b?.coverUrl ?? b?.book_image_url ?? ""
    ),
    totalPages,
  };
}