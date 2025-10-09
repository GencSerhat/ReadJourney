import Modal from "../../components/Modal/Modal.jsx";
import styles from "./BookModal.module.css";

export default function BookModal({ open, onClose, book }) {
  if (!book) return null;

  const { title, author, cover } = book;

  const onAdd = () => {
    // Sonraki adımda: backend'e "Add to library" isteği
    // eslint-disable-next-line no-console
    console.log("Add to library clicked:", book);
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose} title="Book details">
      <div className={styles.wrap}>
        <img
          className={styles.cover}
          src={cover || ""}
          alt={title}
          onError={(e) => { e.currentTarget.style.background = "#e5e7eb"; e.currentTarget.removeAttribute("src"); }}
        />
        <div className={styles.meta}>
          <div className={styles.name}>{title}</div>
          <div className={styles.author}>{author}</div>

          <div className={styles.actions}>
            <button type="button" className={styles.add} onClick={onAdd}>
              Add to library
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
