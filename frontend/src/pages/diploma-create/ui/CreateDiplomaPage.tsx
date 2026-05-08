import styles from "./CreateDiplomaPage.module.scss";

export function CreateDiplomaPage() {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBlock}>
          <div>
            <h2 className={styles.title}>Создание диплома</h2>
            <p className={styles.subtitle}>
              Добавьте данные диплома для студента вашего вуза.
            </p>
          </div>
        </div>

        <form className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="student">
              Студент
            </label>
            <select id="student" className={styles.select} defaultValue="">
              <option value="" disabled>
                Выберите студента
              </option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="diplomaNumber">
              Номер диплома
            </label>
            <input
              id="diplomaNumber"
              className={styles.input}
              type="text"
              placeholder="Например: DIP-2026-001"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="speciality">
              Специальность
            </label>
            <input
              id="speciality"
              className={styles.input}
              type="text"
              placeholder="Название специальности"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="issuedAt">
              Дата выдачи
            </label>
            <input id="issuedAt" className={styles.input} type="date" />
          </div>

          <button className={styles.primaryButton} type="button">
            Создать диплом
          </button>
        </form>
      </div>
    </section>
  );
}
