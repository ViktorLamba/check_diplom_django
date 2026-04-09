import styles from "./LoginPage.module.scss";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "../model/loginSchema";

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log("Form Data:", data);
  };

  return (
    <main className={styles.page}>
      <div className={styles.grid} />
      <div className={styles.glowLeft} />
      <div className={styles.glowRight} />
      <div className={styles.glowTop} />

      <section className={styles.wrapper}>
        <div className={styles.brandTop}>Diplomat</div>

        <div className={styles.card}>
          <div className={styles.cardGlow} />

          <div className={styles.content}>
            <div className={styles.brandInside}>Diplomat</div>

            <h1 className={styles.title}>Войти в систему проверки дипломов</h1>

            <p className={styles.subtitle}>
              Войдите в систему, чтобы получить доступ к платформе проверки
              дипломов и цифровых сертификатов.
            </p>

            <form
              className={styles.form}
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <input
                className={`${styles.input} ${styles.inputAccent} ${errors.email ? styles.inputError : ""}`}
                type="email"
                placeholder="Email"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email.message}</span>
              )}

              <input
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <span className={styles.errorText}>
                  {errors.password.message}
                </span>
              )}

              <button className={styles.primaryButton} type="submit">
                Войти
              </button>

              <div className={styles.actionsRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    {...register("rememberMe")}
                  />
                  <span>Запомнить меня</span>
                </label>

                <a href="#" className={styles.link}>
                  Забыли пароль?
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
