import styles from "./MyDiplomasPage.module.scss";

export function MyDiplomasPage() {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBlock}>
          <div>
            <h2 className={styles.title}>Мои дипломы</h2>
            <p className={styles.subtitle}>
              Просмотр ваших дипломов, статусов и деталей проверки.
            </p>
          </div>
        </div>

        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>Дипломы пока не найдены</h3>
          <p className={styles.emptyText}>
            Когда вуз добавит ваши дипломы, они появятся в этом разделе.
          </p>
        </div>
      </div>
    </section>
  );
}
