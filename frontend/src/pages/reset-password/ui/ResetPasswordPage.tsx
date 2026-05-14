import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "@/pages/login/model/authApi";
import styles from "@/pages/login/ui/LoginPage.module.scss";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasResetParams = Boolean(uid && token);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasResetParams) {
      setError("Ссылка восстановления некорректна.");
      return;
    }

    if (!password || !passwordConfirm) {
      setError("Введите новый пароль и подтверждение.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Пароли не совпадают.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setMessage("");

      const response = await confirmPasswordReset({
        uid,
        token,
        password,
        passwordConfirm,
      });

      setMessage(response.detail);

      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Не удалось изменить пароль.",
      );
    } finally {
      setIsSubmitting(false);
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

            <h1 className={styles.title}>Новый пароль</h1>

            <p className={styles.subtitle}>
              Придумайте новый пароль для входа в систему.
            </p>

            {!hasResetParams ? (
              <div className={styles.serverError}>
                Ссылка восстановления некорректна или устарела.
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Новый пароль"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />

                <input
                  className={styles.input}
                  type="password"
                  placeholder="Повторите пароль"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                />

                {error && <div className={styles.serverError}>{error}</div>}

                {message && (
                  <div className={styles.serverSuccess}>{message}</div>
                )}

                <button
                  className={styles.primaryButton}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Сохранение..." : "Сменить пароль"}
                </button>
              </form>
            )}

            <Link className={styles.link} to="/login">
              Вернуться ко входу
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
