import type { RecentCheck } from "../model/dashboardData";
import styles from "./RecentChecksCard.module.scss";

type RecentChecksCardProps = {
  title: string;
  checks: RecentCheck[];
};

export function RecentChecksCard({ title, checks }: RecentChecksCardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </div>

      <div className={styles.table}>
        <div className={styles.headRow}>
          <span>Статус</span>
          <span>Дата</span>
          <span>Университет</span>
          <span>Специальность</span>
        </div>

        <div className={styles.body}>
          {checks.map((check) => (
            <div key={check.id} className={styles.row}>
              <div className={styles.statusCell}>
                <span
                  className={`${styles.statusDot} ${
                    check.status === "Проверено"
                      ? styles.valid
                      : check.status === "Отклонено"
                        ? styles.invalid
                        : styles.revoked
                  }`}
                />
                <span className={styles.statusText}>{check.status}</span>
              </div>

              <span className={styles.cell}>{check.date}</span>
              <span className={styles.cell}>{check.university}</span>
              <span className={styles.cell}>{check.speciality}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
