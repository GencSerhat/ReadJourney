import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../../features/auth/validation.js";
import styles from "./Auth.module.css";

import toast from "react-hot-toast";
import {
  registerApi,
  loginApi,
  getCurrentUserApi,
} from "../../services/authApi.js";
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
      const reg = await registerApi({ name, email, password });

      let token =
        reg?.token ??
        reg?.accessToken ??
        reg?.access_token ??
        reg?.data?.token ??
        null;

      let user = reg?.user ?? reg?.userData ?? reg?.data?.user ?? null;

      if (!token) {
        const login = await loginApi({ email, password });
        token =
          login?.token ??
          login?.accessToken ??
          login?.access_token ??
          login?.data?.token ??
          null;
        user =
          user ?? login?.user ?? login?.userData ?? login?.data?.user ?? null;
      }

      if (token && !user) {
        localStorage.setItem("auth", JSON.stringify({ token }));
        try {
          const me = await getCurrentUserApi();
          user = me?.user ?? me?.data ?? me ?? null;
        } catch {
          /* ignore */
        }
      }

      if (!token)
        throw new Error("Registration succeeded but login token missing");

      dispatch(setCredentials({ user: user || { name, email }, token }));
      toast.success("Kayıt başarılı, hoş geldin!");
      navigate("/login", { replace: true });
    } catch (err) {
      const message =
        err?.normalizedMessage || err?.message || "Registration failed";
      toast.error(message);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.container}>
        {/* Sol taraf: büyük başlık */}
        <section className={styles.left}>
          <div className={styles.logo}><img src="/images/Logo.png"/></div>

          <h1 className={styles.heroTitle}>
            <span>Expand your</span>
            <span>mind, reading</span>
            <span>a book</span>
          </h1>

          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className={styles.group}>
              <label className={styles.visuallyHidden} htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                className={styles.input}
                placeholder="Name:  Ilona Ratushniak"
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
              <label className={styles.visuallyHidden} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="Mail:  your@email.com"
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
              <label className={styles.visuallyHidden} htmlFor="password">
                Password
              </label>
              <div className={styles.passwordWrap}>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  placeholder="Password:  Minimum 7 characters"
                  autoComplete="new-password"
                  {...register("password")}
                  aria-invalid={Boolean(errors.password) || undefined}
                  aria-describedby="password-error"
                />
                <span className={styles.eye} aria-hidden>
                  👁️
                </span>
              </div>
              <span id="password-error" className={styles.error}>
                {errors.password?.message || ""}
              </span>
            </div>

            <button
              type="submit"
              className={styles.submit}
              disabled={isSubmitting || (isSubmitted && !isValid)}
            >
              {isSubmitting ? "Creating..." : "Registration"}
            </button>

            <div className={styles.alt}>
              Already have an account?
              <Link className={styles.link} to="/login">
                Log in
              </Link>
            </div>
          </form>
        </section>

       
        <section className={styles.right} aria-hidden="true">
          <img
            className={styles.rightImg}
            src="/images/iPhoneBlack.png"
            alt="App preview"
            loading="lazy"
            decoding="async"
          />
        </section>
      </div>
    </div>
  );
}
