import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Dashboard from "../../features/dashboard/Dashboard.jsx";
import RecommendedBooks from "../../features/recommended/RecommendedBooks.jsx";
import { fetchRecommendedBooks } from "../../services/booksApi.js";
import styles from "./RecommendedPage.module.css";

export default function RecommendedPage() {
  // Server pagination state
  const [page, setPage] = useState(1);
  const limit = 6;

  // Data state
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Filters form
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: { title: "", author: "" },
    mode: "onTouched",
  });

  // Watch values to keep UI in sync (isteğe bağlı)
  const titleVal = watch("title");
  const authorVal = watch("author");

  // Aside
  const aside = useMemo(
    () => (
      <div>
        <p className={styles.asideText}>
          Bu bölüm, sana önerilen kitaplar arasında hızlıca arama/filtre yapmana yardımcı olur.
          Kendi kütüphaneni yönetmek için My library sayfasına geçebilirsin.
        </p>
        <Link className={styles.linkBtn} to="/library">Go to My library</Link>
      </div>
    ),
    []
  );

  // Fetch helper
  const load = async ({ pageArg = page } = {}) => {
    setLoading(true);
    setErrMsg("");
    try {
      const { items, totalPages } = await fetchRecommendedBooks({
        page: pageArg,
        limit,
        title: titleVal?.trim(),
        author: authorVal?.trim(),
      });
      setItems(items);
      setTotalPages(Math.max(1, totalPages || 1));
    } catch (err) {
      setErrMsg(err?.normalizedMessage || err?.message || "Failed to load recommendations");
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme + sayfa değişince getir
  useEffect(() => {
    load({ pageArg: page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Form submit → sayfayı 1’e al ve getir
  const onApply = async () => {
    setPage(1);
    await load({ pageArg: 1 });
  };

  return (
    <Dashboard title="Recommended" aside={aside}>
      <div className={styles.stack}>
        {/* Filters form */}
        <section>
          <h2 className={styles.subTitle}>Find books</h2>
          <form className={styles.filters} onSubmit={handleSubmit(onApply)} noValidate>
            <div className={styles.controls}>
              <input
                className={styles.input}
                type="text"
                placeholder="Search by title..."
                {...register("title")}
              />
              <input
                className={styles.input}
                type="text"
                placeholder="Search by author..."
                {...register("author")}
              />
            </div>
            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? "Loading..." : "To apply"}
            </button>
          </form>
        </section>

        {/* Quote */}
        <section className={styles.quote}>
          “A room without books is like a body without a soul.” — Cicero
        </section>

        {/* Hata/Loading durumları */}
        {errMsg ? (
          <div className={styles.quote} style={{ borderLeftColor: "#fca5a5", background: "#fff1f2", fontStyle: "normal" }}>
            {errMsg}
          </div>
        ) : null}

        {/* List + Pagination */}
        <RecommendedBooks
          items={loading ? [] : items}
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>
    </Dashboard>
  );
}
