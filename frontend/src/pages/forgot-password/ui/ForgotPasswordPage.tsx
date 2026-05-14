import { useState, type FormEvent } from "react";
import { requestPasswordReset } from "@/pages/login/model/authApi";
import styles from "@/pages/login/ui/LoginPage.module.scss";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Введите email.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setMessage("");

      const response = await requestPasswordReset({
        email: email.trim(),
      });

      setMessage(response.detail);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Если аккаунт найден, мы отправили письмо. Проверьте почту.",
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

            <h1 className={styles.title}>Восстановление пароля</h1>

            <p className={styles.subtitle}>
              Укажите email аккаунта. Если пользователь существует, мы отправим
              ссылку для смены пароля.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                className={styles.input}
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              {error && <div className={styles.serverError}>{error}</div>}
              {message && <div className={styles.serverSuccess}>{message}</div>}

              <button
                className={styles.primaryButton}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Отправка..." : "Отправить ссылку"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
