import { useMemo, useState } from "react";
import {
  myDiplomasMock,
  myDiplomaStatusLabels,
  type MyDiploma,
  type MyDiplomaStatus,
} from "../model/myDiplomasMock";
import styles from "./MyDiplomasPage.module.scss";

export function MyDiplomasPage() {
  const [selectedDiplomaId, setSelectedDiplomaId] = useState(
    myDiplomasMock[0]?.id ?? null,
  );

  const selectedDiploma = useMemo(() => {
    return (
      myDiplomasMock.find((diploma) => diploma.id === selectedDiplomaId) ??
      myDiplomasMock[0] ??
      null
    );
  }, [selectedDiplomaId]);

  const validCount = myDiplomasMock.filter(
    (diploma) => diploma.status === "valid",
  ).length;

  const pendingCount = myDiplomasMock.filter(
    (diploma) => diploma.status === "pending",
  ).length;

  const getStatusClassName = (status: MyDiplomaStatus) => {
    if (status === "valid") {
      return styles.statusValid;
    }

    if (status === "pending") {
      return styles.statusPending;
    }

    return styles.statusRevoked;
  };

  const handleSelectDiploma = (diploma: MyDiploma) => {
    setSelectedDiplomaId(diploma.id);
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.section}>
          <div className={styles.topBlock}>
            <div>
              <h2 className={styles.title}>Мои дипломы</h2>
              <p className={styles.subtitle}>
                Просмотр ваших дипломов, статусов и деталей проверки.
              </p>
            </div>
          </div>

          {myDiplomasMock.length > 0 ? (
            <>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Всего дипломов</span>
                  <strong className={styles.summaryValue}>
                    {myDiplomasMock.length}
                  </strong>
                </div>

                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Подтверждённых</span>
                  <strong className={styles.summaryValue}>{validCount}</strong>
                </div>

                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>На проверке</span>
                  <strong className={styles.summaryValue}>
                    {pendingCount}
                  </strong>
                </div>
              </div>

              <div className={styles.layout}>
                <div className={styles.list}>
                  {myDiplomasMock.map((diploma) => (
                    <button
                      key={diploma.id}
                      type="button"
                      className={
                        diploma.id === selectedDiploma?.id
                          ? styles.diplomaCardActive
                          : styles.diplomaCard
                      }
                      onClick={() => handleSelectDiploma(diploma)}
                    >
                      <div className={styles.diplomaCardTop}>
                        <span className={styles.diplomaNumber}>
                          {diploma.number}
                        </span>
                        <span className={getStatusClassName(diploma.status)}>
                          {myDiplomaStatusLabels[diploma.status]}
                        </span>
                      </div>

                      <span className={styles.diplomaSpeciality}>
                        {diploma.speciality}
                      </span>

                      <span className={styles.diplomaMeta}>
                        {diploma.qualification} · {diploma.issuedAt}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedDiploma && (
                  <div className={styles.detailsCard}>
                    <div className={styles.detailsHeader}>
                      <div>
                        <h3 className={styles.detailsTitle}>
                          {selectedDiploma.number}
                        </h3>
                        <p className={styles.detailsSubtitle}>
                          {selectedDiploma.verificationDetails}
                        </p>
                      </div>

                      <span
                        className={getStatusClassName(selectedDiploma.status)}
                      >
                        {myDiplomaStatusLabels[selectedDiploma.status]}
                      </span>
                    </div>

                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <span>Вуз</span>
                        <strong>{selectedDiploma.universityName}</strong>
                      </div>

                      <div className={styles.detailItem}>
                        <span>Специальность</span>
                        <strong>{selectedDiploma.speciality}</strong>
                      </div>

                      <div className={styles.detailItem}>
                        <span>Квалификация</span>
                        <strong>{selectedDiploma.qualification}</strong>
                      </div>

                      <div className={styles.detailItem}>
                        <span>Дата выдачи</span>
                        <strong>{selectedDiploma.issuedAt}</strong>
                      </div>
                    </div>

                    <div className={styles.qrBlock}>
                      <div className={styles.qrPlaceholder}>QR</div>

                      <div className={styles.qrTextBlock}>
                        <h4 className={styles.qrTitle}>QR-код диплома</h4>
                        <p className={styles.qrText}>
                          QR-код будет доступен после подключения API генерации
                          и публичной страницы проверки.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>Дипломы пока не найдены</h3>
              <p className={styles.emptyText}>
                Когда вуз добавит ваши дипломы, они появятся в этом разделе.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
