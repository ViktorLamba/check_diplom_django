import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import type { LoginFormValues } from "../model/loginSchema";
import styles from "./LoginPage.module.scss";

type LoginFormProps = {
  register: UseFormRegister<LoginFormValues>;
  handleSubmit: UseFormHandleSubmit<LoginFormValues>;
  onSubmit: (data: LoginFormValues) => void | Promise<void>;
  errors: FieldErrors<LoginFormValues>;
  serverError: string;
};

export function LoginForm({
  register,
  handleSubmit,
  onSubmit,
  errors,
  serverError,
}: LoginFormProps) {
  return (
    <>
      <h1 className={styles.title}>Войти в систему проверки дипломов</h1>

      <p className={styles.subtitle}>
        Войдите в систему, чтобы получить доступ к платформе проверки дипломов и
        цифровых сертификатов.
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
          <span className={styles.errorText}>{errors.username.message}</span>
        )}

        <input
          className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
          type="password"
          placeholder="Пароль"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <span className={styles.errorText}>{errors.password.message}</span>
        )}

        {serverError && <div className={styles.serverError}>{serverError}</div>}

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
    </>
  );
}
