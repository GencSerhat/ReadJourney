import styles from "./MyLibraryBooks.module.css";
import { useState } from "react";
import CoverImage from "../../components/CoverImage/CoverImage";
import BookDetailModal from "./BookDetailModal.jsx";

/**
 * props:
 * - items
 * - onFilterChange?(status)
 * - onRemove?(bookId)
 */
export default function MyLibraryBooks({
  items = [],
  onFilterChange,
  onRemove,
  onStartReading,
}) {
  const [removingId, setRemovingId] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  const handleRemove = async (item) => {
    try {
      setRemovingId(item.id);
      await onRemove?.(item);
    } finally {
      setRemovingId(null);
    }
  };
  return (
    <section className={styles.section} aria-label="My library books">
      <h2 className={styles.title}>My books</h2>

      <div className={styles.toolbar}>
        <div />
        <select
          className={styles.select}
          defaultValue=""
          onChange={(e) => onFilterChange?.(e.target.value)}
          aria-label="Filter by reading status"
        >
          <option value="">All statuses</option>
          <option value="to-read">To read</option>
          <option value="reading">Reading</option>
          <option value="finished">Finished</option>
        </select>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <img src="/images/book.png" alt="book" />
          <p>
            To start training, add some of your books or from the recommended
            ones
          </p>
        </div>
      ) : (
        <ul className={styles.grid}>
          {items.map((b) => (
            <li key={b.id} className={styles.card}>
              <div onClick={() => setOpenItem(b)} style={{ cursor: "pointer" }}>
                <CoverImage
                  src={b.cover}
                  title={b.title}
                  className={styles.cover}
                />
              </div>
              <div className={styles.name}>{b.title}</div>
              <div className={styles.contentAndBtn}>
                <div className={styles.author}>{b.author}</div>
                <button
                  type="button"
                  className={styles.btn}
                  onClick={() => handleRemove(b)}
                  disabled={removingId === b.id}
                >
                  {removingId === b.id ? (
                    "Removing..."
                  ) : (
                    <img src="/images/block.png" alt="remove" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Detay modalı */}
      <BookDetailModal
        open={Boolean(openItem)}
        onClose={() => setOpenItem(null)}
        book={openItem}
        onStart={(book) => {
          setOpenItem(null);
          onStartReading?.(book);
        }}
      />
    </section>
  );
}
