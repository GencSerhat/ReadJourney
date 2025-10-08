import { Outlet } from "react-router-dom";
import styles from "./PublicLayout.module.css";

export default function PublicLayout() {
  return (
    <div className={styles.wrapper}>
      <main className={styles.container}>
        {/* Public sayfalar buraya yerleşecek */}
        <Outlet />
      </main>
      <footer className={styles.footer}>Read Journey - Public Area</footer>
    </div>
  );
}
