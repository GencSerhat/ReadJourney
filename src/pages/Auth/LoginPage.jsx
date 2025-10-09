import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../features/auth/validation.js";
import styles from "./Auth.module.css";

import toast from "react-hot-toast";
import { loginApi } from "../../services/authApi.js";
import { useAppDispatch } from "../../app/hooks.js";
import { setCredentials } from "../../features/auth/authSlice.js";

export default function LoginPage() {
  console.log("LoginPage v2.9 aktif"); // TANILAMA: Bu log görünmeli
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isSubmitted },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
      try {
      const data = await loginApi({
        email: values.email,
        password: values.password,
      });

      // 1) Olası token alanlarını karşıla
      const token =
        data?.token ??
        data?.accessToken ??
        data?.access_token ??
        data?.data?.token ??
        null;

      if (!token) {
        throw new Error("Login response missing token");
      }

      // 2) Olası user alanlarını karşıla
      let user =
        data?.user ??
        data?.userData ??
        data?.data?.user ??
        null;

      // 3) Kullanıcı yoksa, token'ı geçici olarak localStorage'a koyup /users/current çağır
      if (!user) {
        try {
          // interceptor token'ı buradan okuyacak
          localStorage.setItem("auth", JSON.stringify({ token }));
          const me = await getCurrentUserApi();
          // /users/current çıktısında muhtemel şekiller
          user = me?.user ?? me?.data ?? me ?? null;
        } catch {
          // yoksay: altta fallback uygulayacağız
        }
      }

      // 4) Hâlâ user yoksa, en azından email’den minimal obje kur (son çare)
      if (!user) {
        user = { email: values.email, name: values.email.split("@")[0] };
      }

      // 5) Başarılı: store’a yaz + redirect
      dispatch(setCredentials({ user, token }));
      toast.success("Giriş başarılı!");

      const redirectTo = location.state?.from?.pathname || "/recommended";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err?.normalizedMessage || err?.message || "Login failed";
      toast.error(message);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card} role="region" aria-label="Login form">
        <h1 className={styles.title}>Log In · v2.9</h1>
        <p className={styles.subtitle}>Hesabına giriş yap ve okumaya devam et.</p>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.group}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
              aria-invalid={Boolean(errors.email) || undefined}
              aria-describedby="email-error"
            />
            <span id="email-error" className={styles.error}>
              {errors.email?.message || ""}
            </span>
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="•••••••"
              autoComplete="current-password"
              {...register("password")}
              aria-invalid={Boolean(errors.password) || undefined}
              aria-describedby="password-error"
            />
            <span id="password-error" className={styles.error}>
              {errors.password?.message || ""}
            </span>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submit}
              disabled={isSubmitting || (isSubmitted && !isValid)}
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>

            <div className={styles.alt}>
              Don’t have an account?
              <Link className={styles.link} to="/register">
                Register
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
