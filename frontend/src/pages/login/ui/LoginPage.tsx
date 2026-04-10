import styles from "./LoginPage.module.scss";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "../model/loginSchema";
import { login } from "../model/authApi";
import { useState } from "react";

export function LoginPage() {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError("");

      const response = await login({
        username: data.username,
        password: data.password,
      });

      console.log("Login response:", response);

      if ("requires_2fa" in response && response.requires_2fa) {
        console.log("Нужен второй шаг 2FA:", response);
        return;
      }

      if ("user" in response) {
        console.log("Успешный вход:", response.user);
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
        return;
      }
      setServerError("Не удалось выполнить вход");
    }
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
                className={`${styles.input} ${styles.inputAccent} ${errors.username ? styles.inputError : ""}`}
                type="text"
                placeholder="Введите имя пользователя"
                autoComplete="username"
                {...register("username")}
              />
              {errors.username && (
                <span className={styles.errorText}>
                  {errors.username.message}
                </span>
              )}

              <input
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                type="password"
                placeholder="Пароль"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <span className={styles.errorText}>
                  {errors.password.message}
                </span>
              )}
              {serverError && (
                <div className={styles.serverError}>{serverError}</div>
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
