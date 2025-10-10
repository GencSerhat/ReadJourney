import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../../components/Modal/Modal.jsx";
import { addToLibraryApi } from "../../services/libraryApi.js";
import styles from "./BookModal.module.css";
import { rememberCover } from "../../utils/coverCache.js";
export default function BookModal({ open, onClose, book }) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (!book) return null;

  const { id, title, author, cover } = book;
  const onAdd = async () => { if (!id) return;
    setIsAdding(true);
    try {
      await addToLibraryApi(book);
      setAdded(true);
      toast.success("Kitap kütüphanene eklendi!");
      setTimeout(() => {
        setAdded(false);
        onClose?.();
      }, 600);
    } catch (err) {

    const message = err?.normalizedMessage || err?.message || "Add to library failed";
    // Zaten ekliyse hata yerine bilgi ver ve modalı kapa
    const isDuplicate =
      err?.status === 409 || /already/i.test(String(message));
     if (isDuplicate) {
      toast("Bu kitap zaten kütüphanende.", { icon: "ℹ️" });
      onClose?.();
     } else {
       toast.error(message);
     }
    } finally {
      setIsAdding(false);
    }
  };
  // modal renderlandığında cache'e yaz
  rememberCover({
   id: book?.id,
   title: book?.title,
    author: book?.author,
    cover: book?.cover,
  });
  return (
    <Modal open={open} onClose={onClose} title="Book details">
      <div className={styles.wrap}>
        <img
          className={styles.cover}
          src={cover || ""}
          alt={title}
          onError={(e) => {
            e.currentTarget.style.background = "#e5e7eb";
            e.currentTarget.removeAttribute("src");
          }}
        />
        <div className={styles.meta}>
          <div className={styles.name}>{title}</div>
          <div className={styles.author}>{author}</div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.add}
              onClick={onAdd}
              disabled={isAdding || added}
            >
              {added ? "Added ✓" : isAdding ? "Adding..." : "Add to library"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
