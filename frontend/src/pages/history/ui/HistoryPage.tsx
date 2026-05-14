import { useEffect, useMemo, useState } from "react";
import {
  getVerificationLogs,
  type VerificationLog,
  type VerificationSource,
  type VerificationStatus,
} from "@/pages/diplomas/model/diplomasApi";
import styles from "./HistoryPage.module.scss";

const pageSize = 10;

const verificationStatusLabels: Record<VerificationStatus, string> = {
  verified: "Подтверждён",
  not_found: "Не найден",
  revoked: "Отозван",
};

const verificationSourceLabels: Record<VerificationSource, string> = {
  form: "Проверка через форму",
  public: "Открытие публичной страницы / QR",
};

export function HistoryPage() {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "">("");
  const [sourceFilter, setSourceFilter] = useState<VerificationSource | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        setListError("");

        const response = await getVerificationLogs({
          search: search.trim(),
          status: statusFilter,
          source: sourceFilter,
          page,
          page_size: pageSize,
        });

        setLogs(response.results);
        setTotalCount(response.count);
      } catch (error) {
        setLogs([]);
        setTotalCount(0);
        setListError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить журнал проверок.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadLogs();
  }, [search, statusFilter, sourceFilter, page]);

  const verifiedCount = useMemo(
    () => logs.filter((log) => log.verificationStatus === "verified").length,
    [logs],
  );

  const notFoundCount = useMemo(
    () => logs.filter((log) => log.verificationStatus === "not_found").length,
    [logs],
  );

  const revokedCount = useMemo(
    () => logs.filter((log) => log.verificationStatus === "revoked").length,
    [logs],
  );

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.section}>
          <div className={styles.topBlock}>
            <h2 className={styles.sectionTitle}>Журнал проверок</h2>
            <p className={styles.sectionSubtitle}>
              Логи проверок дипломов с фильтрацией по статусу, источнику,
              пользователю и вузу.
            </p>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Всего проверок</span>
              <strong className={styles.summaryValue}>{totalCount}</strong>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Подтверждено</span>
              <strong className={styles.summaryValue}>{verifiedCount}</strong>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Не найдено</span>
              <strong className={styles.summaryValue}>{notFoundCount}</strong>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Отозвано</span>
              <strong className={styles.summaryValue}>{revokedCount}</strong>
            </div>
          </div>

          <div className={styles.toolbar}>
            <input
              className={styles.input}
              type="search"
              value={search}
              placeholder="Поиск по диплому, владельцу или вузу"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />

            <select
              className={styles.select}
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as VerificationStatus | "");
                setPage(1);
              }}
            >
              <option value="">Все статусы</option>
              <option value="verified">Подтверждён</option>
              <option value="not_found">Не найден</option>
              <option value="revoked">Отозван</option>
            </select>

            <select
              className={styles.select}
              value={sourceFilter}
              onChange={(event) => {
                setSourceFilter(event.target.value as VerificationSource | "");
                setPage(1);
              }}
            >
              <option value="">Все источники</option>
              <option value="form">Проверка через форму</option>
              <option value="public">Публичная страница / QR</option>
            </select>
          </div>

          {listError && <p className={styles.emptyText}>{listError}</p>}

          {isLoading ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>Загрузка логов...</h3>
            </div>
          ) : logs.length > 0 ? (
            <div className={styles.table}>
              <div className={styles.headRow}>
                <span>Статус</span>
                <span>Дата</span>
                <span>Диплом</span>
                <span>Владелец</span>
                <span>Вуз</span>
                <span>Источник</span>
                <span>IP</span>
              </div>

              <div className={styles.body}>
                {logs.map((log) => (
                  <div key={log.id} className={styles.row}>
                    <span>
                      <span
                        className={
                          log.verificationStatus === "verified"
                            ? styles.statusValid
                            : log.verificationStatus === "not_found"
                              ? styles.statusInvalid
                              : styles.statusRevoked
                        }
                      >
                        {verificationStatusLabels[log.verificationStatus]}
                      </span>
                    </span>

                    <span className={styles.cell}>
                      {new Date(log.createdAt).toLocaleString("ru-RU")}
                    </span>
                    <span className={styles.number}>
                      {log.diploma?.number ?? log.requestedNumber}
                    </span>
                    <span className={styles.cell}>
                      {log.diploma?.owner ?? "Не найден"}
                    </span>
                    <span className={styles.cell}>
                      {log.universityName ?? log.diploma?.universityName ?? "-"}
                    </span>
                    <span className={styles.cell}>
                      {verificationSourceLabels[log.source]}
                    </span>
                    <span className={styles.cell}>
                      {log.requesterIp ?? "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>Логи не найдены</h3>
              <p className={styles.emptyText}>
                Измените поисковый запрос, статус или источник проверки.
              </p>
            </div>
          )}

          {totalCount > pageSize && (
            <div className={styles.toolbar}>
              <button
                className={styles.select}
                type="button"
                disabled={page === 1}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                Назад
              </button>

              <span className={styles.sectionSubtitle}>Страница {page}</span>

              <button
                className={styles.select}
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
