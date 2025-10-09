import { useState } from "react";
import { Link } from "react-router-dom";
import Dashboard from "../../features/dashboard/Dashboard.jsx";
import RecommendedBooks from "../../features/recommended/RecommendedBooks.jsx";
import styles from "./RecommendedPage.module.css";

export default function RecommendedPage() {
  const [page, setPage] = useState(1);
  const totalPages = 5; // şimdilik mock; API gelince sunucudan gelecek

  // Mock veri: sayfa numarasına göre sahte kitaplar
  const demoItems = Array.from({ length: 6 }, (_, i) => {
    const id = (page - 1) * 6 + i + 1;
    return { id, title: `Book #${id}`, author: `Author ${id}`, cover: "" };
  });

  const aside = (
    <div>
      <p className={styles.asideText}>
        Bu bölüm, sana önerilen kitaplar arasında hızlıca arama/filtre yapmana yardımcı olur.
        Kendi kütüphaneni yönetmek için My library sayfasına geçebilirsin.
      </p>
      <Link className={styles.linkBtn} to="/library">Go to My library</Link>
    </div>
  );

  return (
    <Dashboard title="Recommended" aside={aside}>
      <div className={styles.stack}>
        {/* Filters form */}
        <section>
          <h2 className={styles.subTitle}>Find books</h2>
          <form className={styles.filters} onSubmit={(e) => { e.preventDefault(); /* API geldiğinde bu form sayfayı 1'e çeker */ }}>
            <div className={styles.controls}>
              <input className={styles.input} type="text" name="q1" placeholder="Search by title..." />
              <input className={styles.input} type="text" name="q2" placeholder="Search by author..." />
            </div>
            <button className={styles.btn} type="submit">To apply</button>
          </form>
        </section>

        {/* Quote */}
        <section className={styles.quote}>
          “A room without books is like a body without a soul.” — Cicero
        </section>

        {/* RecommendedBooks + Pagination */}
        <RecommendedBooks
          items={demoItems}
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>
    </Dashboard>
  );
}
