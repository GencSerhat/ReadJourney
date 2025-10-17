import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../features/auth/validation.js";
import styles from "./Auth.module.css";

import toast from "react-hot-toast";
import { loginApi, getCurrentUserApi } from "../../services/authApi.js";
import { useAppDispatch } from "../../app/hooks.js";
import { setCredentials } from "../../features/auth/authSlice.js";

export default function LoginPage() {
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

      // 1) token yakala
      const token =
        data?.token ??
        data?.accessToken ??
        data?.access_token ??
        data?.data?.token ??
        null;
      if (!token) throw new Error("Login response missing token");

      //  user yakala (yoksa /users/current)
      let user =
        data?.user ??
        data?.userData ??
        data?.data?.user ??
        null;

      if (!user) {
        localStorage.setItem("auth", JSON.stringify({ token }));
        try {
          const me = await getCurrentUserApi();
          user = me?.user ?? me?.data ?? me ?? null;
        } catch {
         
        }
      }

      if (!user) user = { email: values.email, name: values.email.split("@")[0] };

      //  store + yönlendir
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
    <div className={styles.shell}>
      <div className={styles.container}>
      
        <section className={styles.left}>
          <div className={styles.logo}>READ JOURNEY</div>

          <h1 className={styles.heroTitle}>
            <span>Expand your</span>
            <span>mind, reading</span>
            <span>a book</span>
          </h1>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.group}>
              <label className={styles.visuallyHidden} htmlFor="email">Email</label>
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
              <label className={styles.visuallyHidden} htmlFor="password">Password</label>
              <div className={styles.passwordWrap}>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  placeholder="Password:  Yourpasswordhere"
                  autoComplete="current-password"
                  {...register("password")}
                  aria-invalid={Boolean(errors.password) || undefined}
                  aria-describedby="password-error"
                />
                <span className={styles.eye} aria-hidden>👁️</span>
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
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>

            <div className={styles.alt}>
              Don’t have an account?
              <Link className={styles.link} to="/register">Register</Link>
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
