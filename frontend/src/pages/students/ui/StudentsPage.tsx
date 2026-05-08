import styles from "./StudentsPage.module.scss";

export function StudentsPage() {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBlock}>
          <div>
            <h2 className={styles.title}>Студенты</h2>
            <p className={styles.subtitle}>
              Список студентов вашего вуза и управление их учетными записями.
            </p>
          </div>

          <button className={styles.primaryButton} type="button">
            Добавить студента
          </button>
        </div>

        <div className={styles.toolbar}>
          <input
            className={styles.input}
            type="search"
            placeholder="Поиск по ФИО или email"
          />

          <select className={styles.select} defaultValue="">
            <option value="">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>
        </div>

        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>Студенты пока не добавлены</h3>
          <p className={styles.emptyText}>
            Здесь появится таблица студентов вашего вуза после подключения API.
          </p>
        </div>
      </div>
    </section>
  );
}
