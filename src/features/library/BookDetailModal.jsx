import Modal from "../../components/Modal/Modal.jsx";
import styles from "./BookDetailModal.module.css";

export default function BookDetailModal({ open, onClose, book, onStart }) {
  if (!book) return null;

  const { title, author, cover } = book;
  const total = book.totalPages ?? book._raw?.totalPages ?? book._raw?.book?.totalPages;

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className={styles.body}>
        <div className={styles.media}>
          {/* basit görsel (CoverImage kullanıyorsan onunla da render edebilirsin) */}
          {cover ? <img src={cover} alt={title} className={styles.cover} /> : <div className={styles.cover} />}
        </div>

        <div className={styles.info}>
          <h3 className={styles.name}>{title}</h3>
          <p className={styles.author}>{author}</p>
          {total ? <p className={styles.meta}><span>Total pages:</span> {total}</p> : null}

          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={() => onStart?.(book)}>
              Start reading
            </button>
            <button type="button" className={styles.secondary} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
