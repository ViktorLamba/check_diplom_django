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

export function HomePage() {
  const [activeSection, setActiveSection] =
    useState<SidebarSection>("dashboard");

  const sectionContent: Record<
    SidebarSection,
    { title: string; subtitle: string; description: string }
  > = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Это главная страница приложения.",
      description:
        "Здесь позже будут карточки статистики, quick actions и таблица.",
    },
    verification: {
      title: "Подтверждение диплома",
      subtitle: "Раздел проверки и подтверждения дипломов.",
      description:
        "Здесь можно будет запускать проверку диплома и смотреть результат.",
    },
    history: {
      title: "История проверки",
      subtitle: "Список выполненных проверок.",
      description: "Здесь позже появится журнал проверок и история действий.",
    },
    diplomas: {
      title: "Дипломы",
      subtitle: "Раздел управления дипломами.",
      description:
        "Здесь позже будет список дипломов, фильтры и карточки документов.",
    },
    settings: {
      title: "Настройки",
      subtitle: "Параметры приложения и профиля.",
      description:
        "Здесь позже можно будет настраивать аккаунт и параметры системы.",
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
          <SidebarTrigger className={styles.trigger} />
          <header className={styles.header}>
            <h1 className={styles.title}>{currentSection.title}</h1>
            <p className={styles.subtitle}>{currentSection.subtitle}</p>
          </header>

          <main className={styles.content}>
            <div className={styles.placeholderCard}>
              <h2>{currentSection.title}</h2>
              <p>{currentSection.description}</p>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
