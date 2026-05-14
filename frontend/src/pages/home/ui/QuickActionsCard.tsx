import { useNavigate } from "react-router-dom";
import type { QuickAction } from "../model/dashboardData";
import styles from "./QuickActionsCard.module.scss";

type QuickActionsCardProps = {
  actions: QuickAction[];
  layout?: "grid" | "stack";
};

export function QuickActionsCard({
  actions,
  layout = "stack",
}: QuickActionsCardProps) {
  const navigate = useNavigate();

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Быстрые действия</h2>
        <p className={styles.subtitle}>
          Запустите ключевые сценарии без поиска по меню.
        </p>
      </div>

      <div
        className={layout === "grid" ? styles.actionsGrid : styles.actionsStack}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={styles.actionButton}
            onClick={() => navigate(action.to)}
          >
            <span className={styles.actionIcon}>{action.icon}</span>
            <span className={styles.actionLabel}>{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
