import { useEffect, useMemo, useState } from "react";
import {
  getDiplomas,
  type Diploma,
  type DiplomaStatus,
} from "../model/diplomasApi";
import styles from "./DiplomasPage.module.scss";

const diplomaStatusLabels: Record<DiplomaStatus, string> = {
  valid: "Подтверждён",
  pending: "На проверке",
  revoked: "Отозван",
};

const pageSize = 10;

export function DiplomasPage() {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DiplomaStatus | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadDiplomas = async () => {
      try {
        setIsLoading(true);
        setListError("");

        const response = await getDiplomas({
          search: search.trim(),
          status: statusFilter,
          page,
          page_size: pageSize,
        });

        setDiplomas(response.results);
        setTotalCount(response.count);
      } catch (error) {
        setDiplomas([]);
        setTotalCount(0);
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
  }, [search, statusFilter, page]);

  const filteredDiplomas = useMemo(() => diplomas, [diplomas]);

  const validCount = diplomas.filter(
    (diploma) => diploma.status === "valid",
  ).length;

  const pendingCount = diplomas.filter(
    (diploma) => diploma.status === "pending",
  ).length;

  const revokedCount = diplomas.filter(
    (diploma) => diploma.status === "revoked",
  ).length;

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.section}>
          <div className={styles.topBlock}>
            <h2 className={styles.sectionTitle}>Список дипломов</h2>
            <p className={styles.sectionSubtitle}>
              Перечень дипломов, доступных для просмотра и управления.
            </p>
          </div>

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
              <span className={styles.summaryLabel}>На проверке</span>
              <strong className={styles.summaryValue}>{pendingCount}</strong>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Отозванных</span>
              <strong className={styles.summaryValue}>{revokedCount}</strong>
            </div>
          </div>

          <div className={styles.toolbar}>
            <input
              className={styles.input}
              type="search"
              value={search}
              placeholder="Поиск по номеру, владельцу, вузу или специальности"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />

            <select
              className={styles.select}
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as DiplomaStatus | "");
                setPage(1);
              }}
            >
              <option value="">Все статусы</option>
              <option value="valid">Подтверждённые</option>
              <option value="pending">На проверке</option>
              <option value="revoked">Отозванные</option>
            </select>
          </div>

          {listError && <p className={styles.emptyText}>{listError}</p>}

          {isLoading ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>Загрузка дипломов...</h3>
            </div>
          ) : filteredDiplomas.length > 0 ? (
            <div className={styles.table}>
              <div className={styles.headRow}>
                <span>Номер</span>
                <span>Владелец</span>
                <span>Вуз</span>
                <span>Специальность</span>
                <span>Дата выдачи</span>
                <span>Статус</span>
                <span>QR</span>
              </div>

              <div className={styles.body}>
                {filteredDiplomas.map((diploma) => (
                  <div key={diploma.id} className={styles.row}>
                    <span className={styles.number}>{diploma.number}</span>
                    <span className={styles.cell}>{diploma.owner}</span>
                    <span className={styles.cell}>
                      {diploma.universityName}
                    </span>
                    <span className={styles.cell}>{diploma.speciality}</span>
                    <span className={styles.cell}>{diploma.issuedAt}</span>
                    <span>
                      <span
                        className={
                          diploma.status === "valid"
                            ? styles.statusValid
                            : diploma.status === "pending"
                              ? styles.statusPending
                              : styles.statusRevoked
                        }
                      >
                        {diplomaStatusLabels[diploma.status]}
                      </span>
                    </span>
                    <span className={styles.cell}>
                      {diploma.qrCodeUrl ? "Доступен" : "Нет"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>Дипломы не найдены</h3>
              <p className={styles.emptyText}>
                Измените поисковый запрос, фильтр статуса или дождитесь
                добавления новых дипломов.
              </p>
            </div>
          )}

          {totalCount > pageSize && (
            <div className={styles.toolbar}>
              <button
                className={styles.dangerButton}
                type="button"
                disabled={page === 1}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                Назад
              </button>

              <span className={styles.sectionSubtitle}>Страница {page}</span>

              <button
                className={styles.dangerButton}
                type="button"
                disabled={page * pageSize >= totalCount}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Вперёд
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
