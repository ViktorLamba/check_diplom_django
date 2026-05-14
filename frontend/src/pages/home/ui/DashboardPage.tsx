import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthContext";
import {
  dashboardDataByRole,
  type DashboardData,
} from "../model/dashboardData";
import { getUniversityDashboardData } from "../model/dashboardApi";
import { StatsGrid } from "./StatsGrid";
import { RecentChecksCard } from "./RecentChecksCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { AuthPromptCard } from "./AuthPromptCard";
import styles from "./DashboardPage.module.scss";

type DashboardPageProps = {
  showAuthPrompt?: boolean;
};

export function DashboardPage({ showAuthPrompt = false }: DashboardPageProps) {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    if (!user || user.role === "student") {
      return;
    }

    const baseData =
      user.role === "admin"
        ? dashboardDataByRole.admin
        : dashboardDataByRole.university;

    if (user.role === "admin") {
      setDashboardData(baseData);
      return;
    }

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setDashboardError("");

        const realDashboardData = await getUniversityDashboardData(baseData);
        setDashboardData(realDashboardData);
      } catch (error) {
        setDashboardData({
          ...baseData,
          stats: baseData.stats.map((stat) => ({
            ...stat,
            value: "0",
          })),
          recentChecks: [],
        });

        setDashboardError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить данные главной.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, [user]);

  if (user?.role === "student") {
    return <Navigate to="/home/my-diplomas" replace />;
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <section className={styles.dashboard}>
      {showAuthPrompt && <AuthPromptCard />}

      {dashboardError && <p>{dashboardError}</p>}
      {isLoading && <p>Загрузка данных...</p>}

      <StatsGrid stats={dashboardData.stats} />

      <div className={styles.bottomSection}>
        <RecentChecksCard
          title={dashboardData.recentChecksTitle}
          checks={dashboardData.recentChecks}
        />
        <QuickActionsCard actions={dashboardData.quickActions} />
      </div>
    </section>
  );
}
