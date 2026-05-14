import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { verifyDiploma } from "@/pages/diplomas/model/diplomasApi";
import styles from "./VerificationPage.module.scss";

export function VerificationPage() {
  const navigate = useNavigate();
  const [series, setSeries] = useState("");
  const [number, setNumber] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!number.trim() || !issuedAt) {
      setError("Введите номер диплома и дату выдачи.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setMessage("");

      const response = await verifyDiploma({
        series: series.trim() || undefined,
        number: number.trim(),
        issuedAt,
      });

      if (response.verified && response.verificationUrl) {
        navigate(response.verificationUrl);
        return;
      }

      setMessage(response.verificationMessage || "Диплом не найден.");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Не удалось проверить диплом.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.card}>
          <div className={styles.section}>
            <div className={styles.topBlock}>
              <h2 className={styles.sectionTitle}>Проверка диплома</h2>
              <p className={styles.sectionSubtitle}>
                Укажите номер диплома и дату выдачи. Серия заполняется только
                если она есть в документе.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label}>Серия</label>
                <input
                  className={styles.input}
                  placeholder="Например: AB"
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Номер</label>
                <input
                  className={styles.input}
                  placeholder="Например: DIP-2026-001"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Дата выдачи</label>
                <input
                  className={styles.input}
                  type="date"
                  value={issuedAt}
                  onChange={(e) => setIssuedAt(e.target.value)}
                />
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              <div className={styles.actions}>
                <button
                  className={styles.button}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Проверка..." : "Проверить диплом"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Результат проверки</h2>
            <div
              className={
                message ? styles.resultNotFound : styles.resultPlaceholder
              }
            >
              <p className={styles.resultText}>
                {message ||
                  "После успешной проверки откроется публичная страница диплома."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
