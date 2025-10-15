import Modal from "../../components/Modal/Modal.jsx";
import styles from "./BookDetailModal.module.css";

export default function BookDetailModal({ open, onClose, book, onStart }) {
  if (!book) return null;

  const { title, author, cover } = book;
  const total =
    book.totalPages ?? book._raw?.totalPages ?? book._raw?.book?.totalPages;

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className={styles.body}>
        <div className={styles.media}>
          {cover ? (
            <img src={cover} alt={title} className={styles.cover} />
          ) : (
            <div className={styles.cover} />
          )}
        </div>

        <h3 className={styles.name}>{title}</h3>
        {author ? <p className={styles.author}>{author}</p> : null}
        {total ? <p className={styles.meta}>{total} pages</p> : null}

        <button
          type="button"
          className={styles.primary}
          onClick={() => onStart?.(book)}
        >
          Start reading
        </button>

        {/* İstersen göster; ekran görüntüsünde yok */}
        {/* <button type="button" className={styles.secondary} onClick={onClose}>Close</button> */}
      </div>
    </Modal>
  );
}
