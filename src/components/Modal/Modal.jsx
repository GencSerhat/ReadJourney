import { useEffect } from "react";
import styles from "./Modal.module.css";

export default function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Dialog"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          {title ? <div className={styles.title}>{title}</div> : null}
          <div className={styles.spacer} />
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
