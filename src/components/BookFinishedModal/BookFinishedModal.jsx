import Modal from "../../components/Modal/Modal.jsx";
import styles from "./BookFinishedModal.module.css";

export default function BookFinishedModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="">
      <div className={styles.wrap}>
        <div className={styles.emoji} aria-hidden>
          📚
        </div>
        <h3 className={styles.title}>The book is read</h3>
        <p className={styles.text}>
          It was an <b>exciting journey</b>, where each page revealed new
          horizons, and the characters became inseparable friends.
        </p>
        <button type="button" className={styles.btn} onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
