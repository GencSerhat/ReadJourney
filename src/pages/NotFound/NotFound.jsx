import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

export default function NotFound() {
  const hasToken = Boolean(localStorage.getItem("token"));
  const to = hasToken ? "/recommended" : "/login";

  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.title}>404 — Page not found</div>
        <p className={styles.text}>
          Aradığın sayfa bulunamadı. Güvenli sayfaya dön.
        </p>
        <Link className={styles.link} to={to}>
          {hasToken ? "Recommended" : "Login"}’e dön
        </Link>
      </div>
    </div>
  );
}
