import styles from "./MyLibraryBooks.module.css";

/**
 * props:
 * - items
 * - onFilterChange?(status)
 * - onRemove?(bookId)
 */
export default function MyLibraryBooks({ items = [], onFilterChange, onRemove }) {
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
        <div className={styles.empty}>Kütüphanende henüz kitap görünmüyor.</div>
      ) : (
        <ul className={styles.grid}>
          {items.map((b) => (
            <li key={b.id} className={styles.card}>
                {b.cover ? (
                <img
                  className={styles.cover}
                 src={b.cover}
                  alt={b.title}
                 onError={(e) => {
                   // kapak bozuksa img’yi kaldır – stil placeholder görevi görür
                   e.currentTarget.replaceWith(Object.assign(document.createElement("div"), { className: styles.cover }));
                 }}
               />
             ) : (
               <div className={styles.cover} aria-label="No cover" />
            )}
              <div className={styles.name}>{b.title}</div>
              <div className={styles.author}>{b.author}</div>
              <button
                type="button"
                className={styles.btn}
                onClick={() => onRemove?.(b.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
