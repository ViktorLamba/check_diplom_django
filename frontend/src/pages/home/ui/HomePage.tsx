import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/widgets/app-sidebar/ui/AppSidebar";
import styles from "./HomePage.module.scss";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthContext";

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
  "/home/universities": {
    title: "Вузы",
    subtitle: "Регистрация и управление вузами.",
  },
  "/home/users": {
    title: "Пользователи",
    subtitle: "Управление пользователями системы.",
  },
  "/home/students": {
    title: "Студенты",
    subtitle: "Студенты вашего вуза.",
  },
  "/home/diplomas/create": {
    title: "Создание диплома",
    subtitle: "Добавление диплома студенту.",
  },
  "/home/my-diplomas": {
    title: "Мои дипломы",
    subtitle: "Ваши дипломы и статусы проверки.",
  },
};

export function HomePage() {
  const { user } = useAuth();
  const location = useLocation();

  const currentMeta =
    pageMeta[location.pathname] ?? pageMeta["/home/dashboard"];

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
