import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  AppSidebar,
  type SidebarSection,
} from "@/widgets/app-sidebar/ui/AppSidebar";
import styles from "./HomePage.module.scss";
import { useEffect, useState } from "react";
import { me, type AuthUser } from "@/pages/login/model/authApi";
import type { ReactNode } from "react";

export function HomePage() {
  const [activeSection, setActiveSection] =
    useState<SidebarSection>("dashboard");

  const sectionContent: Record<
    SidebarSection,
    {
      title: string;
      subtitle: string;
      render: () => ReactNode;
    }
  > = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Это главная страница приложения.",
      render: () => (
        <p>Здесь позже будут карточки статистики, quick actions и таблица.</p>
      ),
    },
    verification: {
      title: "Подтверждение диплома",
      subtitle: "Раздел проверки и подтверждения дипломов.",
      render: () => (
        <p>
          Здесь можно будет запускать проверку диплома и смотреть результат.
        </p>
      ),
    },
    history: {
      title: "История проверки",
      subtitle: "Список выполненных проверок.",
      render: () => (
        <p>Здесь позже появится журнал проверок и история действий.</p>
      ),
    },
    diplomas: {
      title: "Дипломы",
      subtitle: "Раздел управления дипломами.",
      render: () => (
        <p>Здесь позже будет список дипломов, фильтры и карточки документов.</p>
      ),
    },
    account: {
      title: "Аккаунт",
      subtitle: "Управление профилем и безопасностью входа.",
      render: () => (
        <>
          <p>Имя пользователя: {user?.username ?? "Загрузка..."}</p>
          <p>Email: {user?.email ?? "Загрузка..."}</p>
          <p>Роль: Администратор</p>
          <p>Сменить пароль</p>
          <p>Управление безопасностью входа</p>
        </>
      ),
    },
  };

  const currentSection = sectionContent[activeSection];

  const [user, setUser] = useState<AuthUser | null>(null);

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
        <AppSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          user={user}
        />

        <SidebarInset className={styles.inset}>
          <header className={styles.header}>
            <SidebarTrigger className={styles.trigger} />
            <h1 className={styles.title}>{currentSection.title}</h1>
            <p className={styles.subtitle}>{currentSection.subtitle}</p>
          </header>

          <main className={styles.content}>
            <div className={styles.placeholderCard}>
              {currentSection.render()}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
