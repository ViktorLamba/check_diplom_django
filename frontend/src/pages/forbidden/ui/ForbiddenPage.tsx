import { useNavigate } from "react-router-dom";
import styles from "./ForbiddenPage.module.scss";

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.badge}>403</div>

        <div className={styles.content}>
          <h1 className={styles.title}>Доступ запрещён</h1>
          <p className={styles.text}>
            У вас нет прав для просмотра данного раздела. Вернитесь на доступную
            страницу или войдите под другим пользователем.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate("/home")}
          >
            На главную
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate("/login")}
          >
            Войти заново
          </button>
        </div>
      </section>
    </main>
  );
}
