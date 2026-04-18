import styles from "./StatsCard.module.scss";

type StatsCardProps = {
  label: string;
  value: string;
};

export function StatsCard({ label, value }: StatsCardProps) {
  return (
    <article className={styles.card}>
      <p className={styles.label}>{label}</p>
      <div className={styles.value}>{value}</div>
    </article>
  );
}
