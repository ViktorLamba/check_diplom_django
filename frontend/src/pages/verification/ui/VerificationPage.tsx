import styles from "./VerificationPage.module.scss";

export function VerificationPage() {
  return (
    <section className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.card}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Проверка диплома</h2>
            <p className={styles.sectionSubtitle}>
              Введите данные документа, чтобы проверить его подлинность в
              системе.
            </p>

            <form className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="diplomaNumber">
                  Номер диплома
                </label>
                <input
                  id="diplomaNumber"
                  className={styles.input}
                  type="text"
                  placeholder="Введите номер диплома"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="ownerName">
                  ФИО владельца
                </label>
                <input
                  id="ownerName"
                  className={styles.input}
                  type="text"
                  placeholder="Введите ФИО"
                />
              </div>

              <button type="button" className={styles.button}>
                Проверить диплом
              </button>
            </form>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Результат проверки</h2>
            <p className={styles.sectionSubtitle}>
              После отправки формы здесь появится результат проверки диплома.
            </p>

            <div className={styles.resultPlaceholder}>
              <div className={styles.resultBadge}>Ожидание проверки</div>
              <p className={styles.resultText}>
                Введите данные диплома и нажмите кнопку проверки, чтобы получить
                информацию о статусе документа.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
