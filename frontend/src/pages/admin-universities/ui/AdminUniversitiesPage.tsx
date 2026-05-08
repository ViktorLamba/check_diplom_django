import styles from "./AdminUniversitiesPage.module.scss";

export function AdminUniversitiesPage() {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBlock}>
          <div>
            <h2 className={styles.title}>Вузы</h2>
            <p className={styles.subtitle}>
              Регистрация вузов и управление представителями образовательных
              организаций.
            </p>
          </div>

          <button className={styles.primaryButton} type="button">
            Добавить вуз
          </button>
        </div>

        <div className={styles.toolbar}>
          <input
            className={styles.input}
            type="search"
            placeholder="Поиск по названию вуза"
          />
        </div>

        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>Список вузов пуст</h3>
          <p className={styles.emptyText}>
            После подключения API здесь появятся зарегистрированные вузы.
          </p>
        </div>
      </div>
    </section>
  );
}
