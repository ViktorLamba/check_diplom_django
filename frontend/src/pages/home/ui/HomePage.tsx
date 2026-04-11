import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/widgets/app-sidebar/ui/AppSidebar";
import styles from "./HomePage.module.scss";

export function HomePage() {
  return (
    <SidebarProvider>
      <div className={styles.layout}>
        <AppSidebar />

        <SidebarInset className={styles.inset}>
          <header className={styles.header}>
            <SidebarTrigger className={styles.trigger} />
            <div>
              <h1 className={styles.title}>Dashboard</h1>
              <p className={styles.subtitle}>
                Это главная страница приложения.
              </p>
            </div>
          </header>

          <main className={styles.content}>
            <div className={styles.placeholderCard}>
              <h2>Главная страница</h2>
              <p>
                Здесь позже будут карточки статистики, quick actions и таблица.
              </p>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
