import { dashboardStats } from "../model/dashboardData";
import { StatsCard } from "./StatsCard";
import styles from "./StatsGrid.module.scss";

export function StatsGrid() {
  return (
    <section className={styles.grid}>
      {dashboardStats.map((stat) => (
        <StatsCard key={stat.id} label={stat.label} value={stat.value} />
      ))}
    </section>
  );
}
