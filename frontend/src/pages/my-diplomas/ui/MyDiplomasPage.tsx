import { useEffect, useMemo, useState } from "react";
import {
  getMyDiplomas,
  type Diploma,
  type DiplomaStatus,
} from "@/pages/diplomas/model/diplomasApi";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import styles from "./MyDiplomasPage.module.scss";

const myDiplomaStatusLabels: Record<DiplomaStatus, string> = {
  valid: "Подтверждён",
  revoked: "Отозван",
};

const pageSize = 10;

export function MyDiplomasPage() {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [selectedDiplomaId, setSelectedDiplomaId] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadDiplomas = async () => {
      try {
        setIsLoading(true);
        setListError("");

        const response = await getMyDiplomas({
          page,
          page_size: pageSize,
        });

        setDiplomas(response.results);
        setTotalCount(response.count);

        if (response.results.length > 0) {
          setSelectedDiplomaId((currentId) => {
            const hasCurrentDiploma = response.results.some(
              (diploma) => diploma.id === currentId,
            );

            return hasCurrentDiploma ? currentId : response.results[0].id;
          });
        } else {
          setSelectedDiplomaId(null);
        }
      } catch (error) {
        setDiplomas([]);
        setTotalCount(0);
        setSelectedDiplomaId(null);
        setListError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить дипломы.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadDiplomas();
  }, [page]);

  const selectedDiploma = useMemo(() => {
    return (
      diplomas.find((diploma) => diploma.id === selectedDiplomaId) ??
      diplomas[0] ??
      null
    );
  }, [diplomas, selectedDiplomaId]);

  const validCount = diplomas.filter(
    (diploma) => diploma.status === "valid",
  ).length;

  const revokedCount = diplomas.filter(
    (diploma) => diploma.status === "revoked",
  ).length;

  const getStatusClassName = (status: DiplomaStatus) => {
    if (status === "valid") {
      return styles.statusValid;
    }

    return styles.statusRevoked;
  };

  const handleSelectDiploma = (diploma: Diploma) => {
    const url = getDiplomaPublicUrl(diploma);

    if (url) {
      navigate(new URL(url).pathname);
    }
  };

  const getDiplomaPublicUrl = (diploma: Diploma) => {
    const url = diploma.verificationUrl || `/diplom/${diploma.publicId}`;

    if (!url || url.includes("undefined") || url.includes("null")) {
      return null;
    }

    return url.startsWith("http") ? url : `${window.location.origin}${url}`;
  };

  const selectedDiplomaPublicUrl = selectedDiploma
    ? getDiplomaPublicUrl(selectedDiploma)
    : null;

  const navigate = useNavigate();

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

          {listError && <p className={styles.emptyText}>{listError}</p>}

          {isLoading ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>Загрузка дипломов...</h3>
            </div>
          ) : diplomas.length > 0 ? (
            <>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Всего дипломов</span>
                  <strong className={styles.summaryValue}>{totalCount}</strong>
                </div>

                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Подтверждённых</span>
                  <strong className={styles.summaryValue}>{validCount}</strong>
                </div>

                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Отозванных</span>
                  <strong className={styles.summaryValue}>
                    {revokedCount}
                  </strong>
                </div>
              </div>

              <div className={styles.layout}>
                <div className={styles.list}>
                  {diplomas.map((diploma) => (
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
                          Диплом находится в системе проверки подлинности.
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
                        <span>Владелец</span>
                        <strong>{selectedDiploma.owner}</strong>
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

                    {selectedDiplomaPublicUrl && (
                      <div className={styles.qrBlock}>
                        <div className={styles.qrPlaceholder}>
                          <QRCodeSVG
                            value={selectedDiplomaPublicUrl}
                            size={82}
                          />
                        </div>

                        <div className={styles.qrTextBlock}>
                          <h4 className={styles.qrTitle}>
                            Публичная ссылка на диплом
                          </h4>
                          <a
                            className={styles.qrText}
                            href={selectedDiplomaPublicUrl}
                          >
                            Открыть диплом
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {totalCount > pageSize && (
                <div className={styles.layout}>
                  <button
                    className={styles.diplomaCard}
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((currentPage) => currentPage - 1)}
                  >
                    Назад
                  </button>

                  <button
                    className={styles.diplomaCard}
                    type="button"
                    disabled={page * pageSize >= totalCount}
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                  >
                    Вперёд
                  </button>
                </div>
              )}
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
