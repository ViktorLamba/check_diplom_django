import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthContext";
import {
  publicDashboardData,
  dashboardDataByRole,
  type DashboardData,
} from "../model/dashboardData";
import {
  getAdminDashboardData,
  getPublicStats,
  getUniversityDashboardData,
} from "../model/dashboardApi";
import { StatsGrid } from "./StatsGrid";
import { RecentChecksCard } from "./RecentChecksCard";
import { QuickActionsCard } from "./QuickActionsCard";
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
    if (!user) {
      if (showAuthPrompt) {
        const loadPublicDashboard = async () => {
          try {
            setDashboardData(publicDashboardData);

            const stats = await getPublicStats();

            setDashboardData({
              ...publicDashboardData,
              stats: [
                {
                  id: "universities",
                  label: "Всего вузов",
                  value: new Intl.NumberFormat("ru-RU").format(
                    stats.universitiesCount,
                  ),
                },
                {
                  id: "users",
                  label: "Пользователей",
                  value: new Intl.NumberFormat("ru-RU").format(
                    stats.usersCount,
                  ),
                },
                {
                  id: "diplomas",
                  label: "Всего дипломов",
                  value: new Intl.NumberFormat("ru-RU").format(
                    stats.diplomasCount,
                  ),
                },
                {
                  id: "checksToday",
                  label: "Проверок сегодня",
                  value: new Intl.NumberFormat("ru-RU").format(
                    stats.checksTodayCount,
                  ),
                },
              ],
            });
          } catch {
            setDashboardData(publicDashboardData);
          }
        };

        void loadPublicDashboard();
      }

      return;
    }

    if (user.role === "student") {
      return;
    }

    const baseData =
      user.role === "admin"
        ? dashboardDataByRole.admin
        : dashboardDataByRole.university;

    if (user.role === "admin") {
      const loadAdminDashboard = async () => {
        try {
          setIsLoading(true);
          setDashboardError("");

          const realDashboardData = await getAdminDashboardData(baseData);
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

      void loadAdminDashboard();
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
  }, [user, showAuthPrompt]);

  if (user?.role === "student") {
    return <Navigate to="/home/my-diplomas" replace />;
  }

  if (!dashboardData) {
    return null;
  }

  const isPublicDashboard = showAuthPrompt && !user;

  return (
    <section className={styles.dashboard}>
      {dashboardError && <p>{dashboardError}</p>}
      {isLoading && <p>Загрузка данных...</p>}

      <StatsGrid stats={dashboardData.stats} />

      {isPublicDashboard && dashboardData.quickActions.length > 0 && (
        <QuickActionsCard actions={dashboardData.quickActions} layout="grid" />
      )}

      {!isPublicDashboard && dashboardData.recentChecks.length > 0 && (
        <div className={styles.bottomSection}>
          <RecentChecksCard
            title={dashboardData.recentChecksTitle}
            checks={dashboardData.recentChecks}
          />
          <QuickActionsCard
            actions={dashboardData.quickActions}
            layout="stack"
          />
        </div>
      )}
    </section>
  );
}
