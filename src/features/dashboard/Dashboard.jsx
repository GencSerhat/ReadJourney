import styles from "./Dashboard.module.css";

export default function Dashboard({ title, actions, aside, children }) {
  return (
    <section className={styles.shell} aria-label="Dashboard">
      {(title || actions) && (
        <header className={styles.titleRow}>
          {title ? <h1 className={styles.title}>{title}</h1> : null}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>
      )}

      <div className={styles.grid}>
        {/* ASIDE solda */}
        {aside ? <aside className={styles.aside}>{aside}</aside> : null}

        {/* İçerik sağda */}
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  );
}
