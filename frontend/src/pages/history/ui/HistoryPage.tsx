import { useMemo, useState } from "react";
import {
  initialVerificationLogs,
  verificationStatusLabels,
  verificationTypeLabels,
  type VerificationLogStatus,
  type VerificationLogType,
} from "../model/verificationLogsMock";
import styles from "./HistoryPage.module.scss";

export function HistoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationLogStatus | "">(
    "",
  );
  const [typeFilter, setTypeFilter] = useState<VerificationLogType | "">("");

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return initialVerificationLogs.filter((log) => {
      const matchesStatus = statusFilter ? log.status === statusFilter : true;
      const matchesType = typeFilter ? log.type === typeFilter : true;

      const matchesSearch = normalizedSearch
        ? [
            log.diplomaNumber,
            log.owner,
            log.universityName,
            log.speciality,
            log.checkedBy,
            verificationStatusLabels[log.status],
            verificationTypeLabels[log.type],
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [search, statusFilter, typeFilter]);

  const validCount = initialVerificationLogs.filter(
    (log) => log.status === "valid",
  ).length;

  const invalidCount = initialVerificationLogs.filter(
    (log) => log.status === "invalid",
  ).length;

  const revokedCount = initialVerificationLogs.filter(
    (log) => log.status === "revoked",
  ).length;

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.section}>
          <div className={styles.topBlock}>
            <h2 className={styles.sectionTitle}>Журнал проверок</h2>
            <p className={styles.sectionSubtitle}>
              Логи проверок дипломов с фильтрацией по статусу, типу проверки,
              пользователю и вузу.
            </p>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Всего проверок</span>
              <strong className={styles.summaryValue}>
                {initialVerificationLogs.length}
              </strong>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Подтверждено</span>
              <strong className={styles.summaryValue}>{validCount}</strong>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Не найдено</span>
              <strong className={styles.summaryValue}>{invalidCount}</strong>
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
              placeholder="Поиск по диплому, владельцу, вузу или пользователю"
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className={styles.select}
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as VerificationLogStatus | "",
                )
              }
            >
              <option value="">Все статусы</option>
              <option value="valid">Подтверждён</option>
              <option value="invalid">Не найден</option>
              <option value="revoked">Отозван</option>
            </select>

            <select
              className={styles.select}
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as VerificationLogType | "")
              }
            >
              <option value="">Все типы</option>
              <option value="manual">Ручная проверка</option>
              <option value="qr">QR-код</option>
              <option value="api">API-запрос</option>
            </select>
          </div>

          {filteredLogs.length > 0 ? (
            <div className={styles.table}>
              <div className={styles.headRow}>
                <span>Статус</span>
                <span>Дата</span>
                <span>Диплом</span>
                <span>Владелец</span>
                <span>Вуз</span>
                <span>Тип</span>
                <span>Пользователь</span>
              </div>

              <div className={styles.body}>
                {filteredLogs.map((log) => (
                  <div key={log.id} className={styles.row}>
                    <span>
                      <span
                        className={
                          log.status === "valid"
                            ? styles.statusValid
                            : log.status === "invalid"
                              ? styles.statusInvalid
                              : styles.statusRevoked
                        }
                      >
                        {verificationStatusLabels[log.status]}
                      </span>
                    </span>

                    <span className={styles.cell}>{log.checkedAt}</span>
                    <span className={styles.number}>{log.diplomaNumber}</span>
                    <span className={styles.cell}>{log.owner}</span>
                    <span className={styles.cell}>{log.universityName}</span>
                    <span className={styles.cell}>
                      {verificationTypeLabels[log.type]}
                    </span>
                    <span className={styles.cell}>{log.checkedBy}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>Логи не найдены</h3>
              <p className={styles.emptyText}>
                Измените поисковый запрос, статус или тип проверки.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
