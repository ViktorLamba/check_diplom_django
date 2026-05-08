import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/widgets/app-sidebar/ui/AppSidebar";
import styles from "./HomePage.module.scss";
import { useEffect, useState } from "react";
import { me, type AuthUser } from "@/pages/login/model/authApi";
import { Outlet, useLocation } from "react-router-dom";

const pageMeta: Record<
  string,
  {
    title: string;
    subtitle: string;
  }
> = {
  "/home/dashboard": {
    title: "Главная страница",
    subtitle: "Обзор активности платформы",
  },
  "/home/verification": {
    title: "Подтверждение диплома",
    subtitle: "Раздел проверки и подтверждения дипломов.",
  },
  "/home/history": {
    title: "История проверки",
    subtitle: "Список выполненных проверок.",
  },
  "/home/diplomas": {
    title: "Дипломы",
    subtitle: "Раздел управления дипломами.",
  },
  "/home/account": {
    title: "Аккаунт",
    subtitle: "Управление профилем и безопасностью входа.",
  },
};

export function HomePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const location = useLocation();

  const currentMeta =
    pageMeta[location.pathname] ?? pageMeta["/home/dashboard"];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await me();
        setUser(response.user);
      } catch (error) {
        console.error("Не удалось загрузить пользователя", error);
      }
    };
    void loadUser();
  }, []);
  return (
    <SidebarProvider>
      <div className={styles.layout}>
        <AppSidebar user={user} />

        <SidebarInset className={styles.inset}>
          <header className={styles.header}>
            <SidebarTrigger className={styles.trigger} />
            <div className={styles.headerContent}>
              <h1 className={styles.title}>{currentMeta.title}</h1>
              <p className={styles.subtitle}>{currentMeta.subtitle}</p>
            </div>
          </header>

          <main className={styles.dashboardContent}>
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
