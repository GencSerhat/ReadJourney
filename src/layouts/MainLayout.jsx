import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.css";

export default function MainLayout() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>Read Journey</div>

          {/* Buraya sonra gerçek Header (UserNav, UserBar, Logout) gelecek */}
          <nav>Header Placeholder</nav>
        </div>
      </header>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
