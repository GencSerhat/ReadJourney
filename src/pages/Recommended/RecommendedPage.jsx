import { useEffect, useState } from "react";
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
  const { register, handleSubmit, watch } = useForm({
    defaultValues: { title: "", author: "" },
    mode: "onTouched",
  });

  // Watch values
  const titleVal = watch("title");
  const authorVal = watch("author");

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
      setErrMsg(
        err?.normalizedMessage || err?.message || "Failed to load recommendations"
      );
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    load({ pageArg: page });
  
  }, [page]);

  
  const onApply = async () => {
    setPage(1);
    await load({ pageArg: 1 });
  };

  // ----- ASIDE (sol panel) -----
  const aside = (
    <aside className={styles.aside}>
      {/* Filters card */}
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Filters:</h3>

        <form className={styles.filters} onSubmit={handleSubmit(onApply)} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>Book title:</span>
            <input
              className={styles.input}
              type="text"
              placeholder="Enter text"
              {...register("title")}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>The author:</span>
            <input
              className={styles.input}
              type="text"
              placeholder="Enter text"
              {...register("author")}
            />
          </label>

          <button className={styles.applyBtn} type="submit" disabled={loading}>
            {loading ? "Loading..." : "To apply"}
          </button>
        </form>
      </section>

      <section className={styles.card}>
        <h4 className={styles.workoutTitle}>Start your workout</h4>

        <ol className={styles.steps}>
          <li>
            <span className={styles.stepNum}>1</span>
            <span>
              Create a personal <strong>library</strong>: add the books you intend to read to it.
            </span>
          </li>
          <li>
            <span className={styles.stepNum}>2</span>
            <span>
              Create your first <strong>workout</strong>: define a goal, choose a period, start training.
            </span>
          </li>
        </ol>

        <Link className={styles.libraryLink} to="/library">
          My library →
        </Link>
      </section>

      {/* Quote card */}
      <section className={`${styles.card} ${styles.card2}`}>
        <img src="/images/book.png" className={styles.bookImg}/>
        <p className={styles.quoteText}>
          <strong>“Books are windows</strong> to the world, and reading is a journey into the unknown.”
        </p>
      </section>
    </aside>
  );

  // ----- MAIN (orta panel) -----
  return (
   <div className={styles.screen}>   
      <Dashboard title="Recommended" aside={aside}>
        <div className={styles.mainPanel}>
          <div className={styles.mainHeader}>
            <h2 className={styles.heading}>Recommended</h2>
          </div>

          {errMsg ? <div className={styles.errorBanner}>{errMsg}</div> : null}

          <RecommendedBooks
            items={loading ? [] : items}
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      </Dashboard>
    </div>
  );
}
