import styles from "./DiplomasPage.module.scss";

const mockDiplomas = [
  {
    id: 1,
    number: "DIP-2026-001",
    owner: "Иванов Иван Иванович",
    speciality: "Информатика",
    issuedAt: "2026-05-01",
  },
  {
    id: 2,
    number: "DIP-2026-002",
    owner: "Петрова Анна Сергеевна",
    speciality: "Прикладная математика",
    issuedAt: "2026-04-18",
  },
  {
    id: 3,
    number: "DIP-2026-003",
    owner: "Сидоров Алексей Олегович",
    speciality: "Программная инженерия",
    issuedAt: "2026-04-09",
  },
];

export function DiplomasPage() {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.section}>
          <div className={styles.topBlock}>
            <h2 className={styles.sectionTitle}>Список дипломов</h2>
            <p className={styles.sectionSubtitle}>
              Здесь будет отображаться перечень дипломов, доступных для
              просмотра и управления.
            </p>
          </div>

          <div className={styles.table}>
            <div className={styles.headRow}>
              <span>Номер</span>
              <span>Владелец</span>
              <span>Специальность</span>
              <span>Дата выдачи</span>
            </div>

            <div className={styles.body}>
              {mockDiplomas.map((diploma) => (
                <div key={diploma.id} className={styles.row}>
                  <span className={styles.number}>{diploma.number}</span>
                  <span className={styles.cell}>{diploma.owner}</span>
                  <span className={styles.cell}>{diploma.speciality}</span>
                  <span className={styles.cell}>{diploma.issuedAt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
