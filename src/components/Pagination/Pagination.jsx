import styles from "./Pagination.module.css";

export default function Pagination({
  page = 1,
  totalPages = 1,
  onPrev,
  onNext,
}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className={styles.wrap} role="navigation" aria-label="Pagination">
      <button
        className={styles.btn}
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous page"
      >
        ←
      </button>
      <span className={styles.info}>
        Page {page} / {totalPages}
      </span>
      <button
        className={styles.btn}
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next page"
      >
        →
      </button>
    </div>
  );
}
