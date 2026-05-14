import { useNavigate } from "react-router-dom";
import styles from "./AuthPromptCard.module.scss";

export function AuthPromptCard() {
  const navigate = useNavigate();

  return (
    <section className={styles.card}>
      <div className={styles.content}>
        <div className={styles.textBlock}>
          <h2 className={styles.title}>
            Получите доступ к полному функционалу
          </h2>
          <p className={styles.subtitle}>
            Авторизуйтесь, чтобы использовать проверку дипломов, просматривать
            историю запросов и управлять данными платформы.
          </p>
        </div>

        <button
          type="button"
          className={styles.button}
          onClick={() => navigate("/login")}
        >
          Авторизоваться
        </button>
      </div>
    </section>
  );
}
