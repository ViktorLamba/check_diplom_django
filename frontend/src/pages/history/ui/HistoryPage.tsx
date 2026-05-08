import styles from "./HistoryPage.module.scss";

const mockHistory = [
  {
    id: 1,
    status: "Подтверждён",
    date: "2026-05-08",
    university: "МГУ им. Ломоносова",
    speciality: "Информатика",
  },
  {
    id: 2,
    status: "Не найден",
    date: "2026-05-07",
    university: "СПбГУ",
    speciality: "Прикладная математика",
  },
  {
    id: 3,
    status: "Отозван",
    date: "2026-05-06",
    university: "МФТИ",
    speciality: "Программная инженерия",
  },
];

export function HistoryPage() {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.section}>
          <div className={styles.topBlock}>
            <h2 className={styles.sectionTitle}>Журнал проверок</h2>
            <p className={styles.sectionSubtitle}>
              Здесь отображаются последние выполненные запросы проверки
              дипломов.
            </p>
          </div>

          <div className={styles.table}>
            <div className={styles.headRow}>
              <span>Статус</span>
              <span>Дата</span>
              <span>Университет</span>
              <span>Специальность</span>
            </div>

            <div className={styles.body}>
              {mockHistory.map((item) => (
                <div key={item.id} className={styles.row}>
                  <span className={styles.status}>{item.status}</span>
                  <span className={styles.cell}>{item.date}</span>
                  <span className={styles.cell}>{item.university}</span>
                  <span className={styles.cell}>{item.speciality}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
