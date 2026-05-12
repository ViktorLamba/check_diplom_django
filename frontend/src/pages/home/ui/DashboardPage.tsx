import { StatsGrid } from "./StatsGrid";
import { RecentChecksCard } from "./RecentChecksCard";
import { QuickActionsCard } from "./QuickActionsCard";
import styles from "./DashboardPage.module.scss";

export function DashboardPage() {
  return (
    <section className={styles.dashboard}>
      <StatsGrid />

      <div className={styles.bottomSection}>
        <RecentChecksCard />
        <QuickActionsCard />
      </div>
    </section>
  );
}
