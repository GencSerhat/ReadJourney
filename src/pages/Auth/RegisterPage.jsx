import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../../features/auth/validation.js";
import styles from "./Auth.module.css";

import toast from "react-hot-toast";
import { registerApi, loginApi, getCurrentUserApi } from "../../services/authApi.js";
import { useAppDispatch } from "../../app/hooks.js";
import { setCredentials } from "../../features/auth/authSlice.js";

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isSubmitted },
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    const { name, email, password } = values;

    try {
      // 1) Kayıt isteği
      const reg = await registerApi({ name, email, password });

      // 2) Olası token/user alanlarını karşıla
      let token =
        reg?.token ??
        reg?.accessToken ??
        reg?.access_token ??
        reg?.data?.token ??
        null;

      let user =
        reg?.user ??
        reg?.userData ??
        reg?.data?.user ??
        null;

      // 3) Token yoksa, aynı bilgilerle login dene
      if (!token) {
        const login = await loginApi({ email, password });
        token =
          login?.token ??
          login?.accessToken ??
          login?.access_token ??
          login?.data?.token ??
          null;
        user =
          user ??
          login?.user ??
          login?.userData ??
          login?.data?.user ??
          null;
      }

      // 4) Hâlâ user yoksa, /users/current ile çek (token'ı geçici yaz)
      if (token && !user) {
        localStorage.setItem("auth", JSON.stringify({ token }));
        try {
          const me = await getCurrentUserApi();
          user = me?.user ?? me?.data ?? me ?? null;
        } catch {
          /* yoksay */
        }
      }

      // 5) Token hâlâ yoksa hata
      if (!token) {
        throw new Error("Registration succeeded but login token missing");
      }

      // 6) Store'a yaz ve yönlendir
      dispatch(setCredentials({ user: user || { name, email }, token }));
      toast.success("Kayıt başarılı, hoş geldin!");
      navigate("/login", { replace: true });
    } catch (err) {
      const message = err?.normalizedMessage || err?.message || "Registration failed";
      toast.error(message);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card} role="region" aria-label="Register form">
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Okuma yolculuğuna başla.</p>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.group}>
            <label className={styles.label} htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className={styles.input}
              placeholder="Your name"
              autoComplete="name"
              {...register("name")}
              aria-invalid={Boolean(errors.name) || undefined}
              aria-describedby="name-error"
            />
            <span id="name-error" className={styles.error}>
              {errors.name?.message || ""}
            </span>
          </div>

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
              placeholder="Minimum 7 characters"
              autoComplete="new-password"
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
              {isSubmitting ? "Creating..." : "Create account"}
            </button>

            <div className={styles.alt}>
              Already have an account?
              <Link className={styles.link} to="/login">
                Log in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
