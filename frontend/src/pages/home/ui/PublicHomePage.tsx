import { DashboardPage } from "./DashboardPage";
import styles from "./PublicHomePage.module.scss";

export function PublicHomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.grid} />
      <div className={styles.glowLeft} />
      <div className={styles.glowRight} />
      <div className={styles.glowTop} />

      <section className={styles.wrapper}>
        <div className={styles.brand}>Diplomat</div>

        <header className={styles.header}>
          <h1 className={styles.title}>Главная страница</h1>
          <p className={styles.subtitle}>
            Платформа проверки подлинности дипломов и цифровых сертификатов.
          </p>
        </header>

        <DashboardPage showAuthPrompt />
      </section>
    </main>
  );
}
