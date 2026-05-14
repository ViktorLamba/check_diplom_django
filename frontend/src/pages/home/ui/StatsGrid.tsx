import type { DashboardStat } from "../model/dashboardData";
import { StatsCard } from "./StatsCard";
import styles from "./StatsGrid.module.scss";

type StatsGridProps = {
  stats: DashboardStat[];
};

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className={styles.grid}>
      {stats.map((stat) => (
        <StatsCard key={stat.id} label={stat.label} value={stat.value} />
      ))}
    </section>
  );
}
