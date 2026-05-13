import { useState, type SubmitEvent } from "react";
import {
  verificationDiplomasMock,
  verificationStatusLabels,
  type VerificationDiploma,
} from "../model/verificationMock";
import styles from "./VerificationPage.module.scss";

type CheckStatus = "idle" | "found" | "notFound";

export function VerificationPage() {
  const [diplomaNumber, setDiplomaNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
  const [result, setResult] = useState<VerificationDiploma | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedNumber = diplomaNumber.trim().toLowerCase();
    const normalizedOwner = ownerName.trim().toLowerCase();

    if (!normalizedNumber || !normalizedOwner) {
      setError("Введите номер диплома и ФИО владельца.");
      setCheckStatus("idle");
      setResult(null);
      return;
    }

    const foundDiploma = verificationDiplomasMock.find((diploma) => {
      const matchesNumber = diploma.number.toLowerCase() === normalizedNumber;
      const matchesOwner = diploma.owner.toLowerCase() === normalizedOwner;

      return matchesNumber && matchesOwner;
    });

    setError("");

    if (!foundDiploma) {
      setCheckStatus("notFound");
      setResult(null);
      return;
    }

    setCheckStatus("found");
    setResult(foundDiploma);
  };

  const handleReset = () => {
    setDiplomaNumber("");
    setOwnerName("");
    setCheckStatus("idle");
    setResult(null);
    setError("");
  };

  return (
    <section className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.card}>
          <div className={styles.section}>
            <div className={styles.topBlock}>
              <h2 className={styles.sectionTitle}>Проверка диплома</h2>
              <p className={styles.sectionSubtitle}>
                Введите номер диплома и ФИО владельца, чтобы проверить документ
                в системе.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="diplomaNumber">
                  Номер диплома
                </label>
                <input
                  id="diplomaNumber"
                  className={styles.input}
                  type="text"
                  value={diplomaNumber}
                  placeholder="Например: DIP-2026-001"
                  onChange={(event) => setDiplomaNumber(event.target.value)}
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
                  value={ownerName}
                  placeholder="Например: Иванов Иван Иванович"
                  onChange={(event) => setOwnerName(event.target.value)}
                />
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              <div className={styles.actions}>
                <button type="submit" className={styles.button}>
                  Проверить диплом
                </button>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleReset}
                >
                  Очистить
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.section}>
            <div className={styles.topBlock}>
              <h2 className={styles.sectionTitle}>Результат проверки</h2>
              <p className={styles.sectionSubtitle}>
                Здесь отображается найденный диплом и его текущий статус.
              </p>
            </div>

            {checkStatus === "idle" && (
              <div className={styles.resultPlaceholder}>
                <div className={styles.resultBadge}>Ожидание проверки</div>
                <p className={styles.resultText}>
                  Заполните форму и нажмите кнопку проверки, чтобы получить
                  информацию о документе.
                </p>
              </div>
            )}

            {checkStatus === "notFound" && (
              <div className={styles.resultNotFound}>
                <div className={styles.statusInvalid}>Не найден</div>
                <h3 className={styles.resultTitle}>Диплом не найден</h3>
                <p className={styles.resultText}>
                  Проверьте номер диплома и ФИО владельца. Если данные введены
                  верно, документа нет в текущем реестре.
                </p>
              </div>
            )}

            {checkStatus === "found" && result && (
              <div className={styles.resultCard}>
                <div
                  className={
                    result.status === "valid"
                      ? styles.statusValid
                      : result.status === "pending"
                        ? styles.statusPending
                        : styles.statusRevoked
                  }
                >
                  {verificationStatusLabels[result.status]}
                </div>

                <h3 className={styles.resultTitle}>{result.number}</h3>

                <div className={styles.details}>
                  <div className={styles.detailItem}>
                    <span>Владелец</span>
                    <strong>{result.owner}</strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>Вуз</span>
                    <strong>{result.universityName}</strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>Специальность</span>
                    <strong>{result.speciality}</strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>Дата выдачи</span>
                    <strong>{result.issuedAt}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
