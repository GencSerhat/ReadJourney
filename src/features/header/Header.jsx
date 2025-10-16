import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAppSelector, useAppDispatch } from "../../app/hooks.js";
import { selectUser, clearAuth } from "../auth/authSlice.js";
import { logoutApi } from "../../services/authApi.js";
import styles from "./Header.module.css";

export default function Header() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName =
    user?.name || user?.username || user?.email?.split("@")[0] || "Account";
  const initials = (displayName?.[0] || "A").toUpperCase();

  // Home için hangi route’u kullanacağınız:
  // Eğer uygulamanın ana sayfası / ise HOME_PATH = "/"
  // Recommended sayfasını ana sayfa kullanıyorsanız HOME_PATH = "/recommended"
  const HOME_PATH = "/recommended"; // gerekirse "/" yapın

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutApi();
      toast.success("Çıkış yapıldı");
    } catch (err) {
      const msg = err?.normalizedMessage || err?.message || "Çıkış sırasında hata oluştu";
      toast.error(msg);
    } finally {
      dispatch(clearAuth());
      try {
        localStorage.removeItem("auth");
        localStorage.removeItem("token");
      } catch {}
      navigate("/login", { replace: true });
      setIsLoggingOut(false);
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navLinkClass = ({ isActive }) =>
    `${styles.link} ${isActive ? styles.active : ""}`;

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.logo}>READ JOURNEY</div>
 <div className={styles.spacer} />
        {/* Orta navigasyon */}
        <nav className={styles.nav} aria-label="User navigation">
          <NavLink to={HOME_PATH} className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/library" className={navLinkClass}>
            My library
          </NavLink>
        </nav>

        <div className={styles.spacer} />

        {/* Kullanıcı barı */}
        <div className={styles.userBar} aria-label="User bar">
          <div className={styles.avatar} aria-hidden="true">{initials}</div>
          <span>{displayName}</span>
          <button
            type="button"
            className={styles.logout}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>

        {/* Burger (mobile) */}
        <button
          type="button"
          className={styles.burger}
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          ☰
        </button>
      </div>

      {/* Mobile menu (overlay + sheet) */}
      {isMenuOpen && (
        <div className={styles.overlay} onClick={closeMenu} role="presentation">
          <aside
            className={`${styles.sheet} ${styles.sheetOpen}`}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHeader}>
              <div className={styles.sheetTitle}>Menu</div>
              <button
                type="button"
                className={styles.close}
                aria-label="Close menu"
                onClick={closeMenu}
              >
                ✕
              </button>
            </div>

            <nav className={styles.menuNav} aria-label="Mobile user navigation">
              <NavLink to={HOME_PATH} className={navLinkClass} onClick={closeMenu}>
                Home
              </NavLink>
              <NavLink to="/library" className={navLinkClass} onClick={closeMenu}>
                My library
              </NavLink>
            </nav>

            <div className={styles.menuUser}>
              <div className={styles.avatar} aria-hidden="true">{initials}</div>
              <div style={{ flex: 1 }}>{displayName}</div>
            </div>

            <button
              type="button"
              className={styles.menuLogout}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
