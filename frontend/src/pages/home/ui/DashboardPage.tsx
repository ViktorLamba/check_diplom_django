import { StatsGrid } from "./StatsGrid";
import { RecentChecksCard } from "./RecentChecksCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { AuthPromptCard } from "./AuthPromptCard";
import styles from "./DashboardPage.module.scss";

type DashboardPageProps = {
  showAuthPrompt?: boolean;
};

export function DashboardPage({ showAuthPrompt = false }: DashboardPageProps) {
  return (
    <section className={styles.dashboard}>
      {showAuthPrompt && <AuthPromptCard />}

      <StatsGrid />

      <div className={styles.bottomSection}>
        <RecentChecksCard />
        <QuickActionsCard />
      </div>
    </section>
  );
}
