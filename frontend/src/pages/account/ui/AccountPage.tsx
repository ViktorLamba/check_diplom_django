import styles from "./AccountPage.module.scss";

export function AccountPage() {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Профиль</h2>

          <div className={styles.infoList}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Имя пользователя</span>
              <span className={styles.value}>admin</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>admin@example.com</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Роль</span>
              <span className={styles.value}>Администратор</span>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Безопасность</h2>

          <div className={styles.infoList}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Смена пароля</span>
              <span className={styles.valueMuted}>Скоро будет доступно</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>
                Управление безопасностью входа
              </span>
              <span className={styles.valueMuted}>Скоро будет доступно</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
