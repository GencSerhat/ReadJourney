import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.css";
import Header from "../features/header/Header";

export default function MainLayout() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
       
          <Header />
        </div>
      </header>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
