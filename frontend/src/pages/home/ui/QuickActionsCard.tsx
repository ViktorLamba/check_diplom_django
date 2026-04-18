import { quickActions } from "../model/dashboardData";
import styles from "./QuickActionsCard.module.scss";

export function QuickActionsCard() {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Быстрые действия</h2>
        <p className={styles.subtitle}>
          Запустите ключевые сценарии без поиска по меню.
        </p>
      </div>

      <div className={styles.actions}>
        {quickActions.map((action) => (
          <button key={action.id} type="button" className={styles.actionButton}>
            <span className={styles.actionIcon}>
              {action.id === "verify" ? "D" : "Q"}
            </span>
            <span className={styles.actionLabel}>{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
