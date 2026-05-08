import styles from "./AdminUsersPage.module.scss";

export function AdminUsersPage() {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBlock}>
          <div>
            <h2 className={styles.title}>Пользователи</h2>
            <p className={styles.subtitle}>
              Управление пользователями системы: поиск, фильтрация, просмотр и
              удаление.
            </p>
          </div>

          <button className={styles.primaryButton} type="button">
            Добавить пользователя
          </button>
        </div>

        <div className={styles.toolbar}>
          <input
            className={styles.input}
            type="search"
            placeholder="Поиск по имени или email"
          />

          <select className={styles.select} defaultValue="">
            <option value="">Все роли</option>
            <option value="admin">Администраторы</option>
            <option value="university">Представители вузов</option>
            <option value="student">Студенты</option>
          </select>
        </div>

        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>Пользователи пока не загружены</h3>
          <p className={styles.emptyText}>
            Здесь появится таблица пользователей после подключения API.
          </p>
        </div>
      </div>
    </section>
  );
}
