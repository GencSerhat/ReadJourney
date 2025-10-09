import { useState } from "react";
import styles from "./RecommendedBooks.module.css";
import Pagination from "../../components/Pagination/Pagination.jsx";
import BookModal from "./BookModal.jsx"; // ← EKLE

export default function RecommendedBooks({
  items = [],
  page = 1,
  totalPages = 1,
  onPrev,
  onNext,
}) {
  const [openId, setOpenId] = useState(null);
  const active = items.find((b) => b.id === openId) || null;

  return (
    <section className={styles.section} aria-label="Recommended books">
      <h2 className={styles.title}>Books</h2>

      {items.length === 0 ? (
        <div className={styles.empty}>
          Henüz öneri yüklenmedi. Filtreleri kullanarak arama yapabilirsin.
        </div>
      ) : (
        <ul className={styles.grid}>
          {items.map((b) => (
            <li key={b.id} className={styles.card}>
              <img
                className={styles.cover}
                src={b.cover || ""}
                alt={b.title}
                onClick={() => setOpenId(b.id)}
                onError={(e) => {
                  e.currentTarget.style.background = "#e5e7eb";
                  e.currentTarget.removeAttribute("src");
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setOpenId(b.id); }}
              />
              <div className={styles.name}>{b.title}</div>
              <div className={styles.author}>{b.author}</div>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onPrev={onPrev} onNext={onNext} />

      {/* Modal */}
      <BookModal
        open={Boolean(openId)}
        onClose={() => setOpenId(null)}
        book={active}
      />
    </section>
  );
}
