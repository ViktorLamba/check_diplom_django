import { useMemo, useState } from "react";
import {
  diplomaStatusLabels,
  initialDiplomas,
  type Diploma,
  type DiplomaStatus,
} from "../model/diplomasMock";
import styles from "./DiplomasPage.module.scss";

export function DiplomasPage() {
  const [diplomas, setDiplomas] = useState<Diploma[]>(initialDiplomas);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DiplomaStatus | "">("");

  const filteredDiplomas = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return diplomas.filter((diploma) => {
      const matchesStatus = statusFilter
        ? diploma.status === statusFilter
        : true;

      const matchesSearch = normalizedSearch
        ? [
            diploma.number,
            diploma.owner,
            diploma.universityName,
            diploma.speciality,
            diplomaStatusLabels[diploma.status],
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [diplomas, search, statusFilter]);

  const validCount = diplomas.filter(
    (diploma) => diploma.status === "valid",
  ).length;

  const pendingCount = diplomas.filter(
    (diploma) => diploma.status === "pending",
  ).length;

  const revokedCount = diplomas.filter(
    (diploma) => diploma.status === "revoked",
  ).length;

  const handleDelete = (diploma: Diploma) => {
    const shouldDelete = window.confirm(
      `Удалить диплом "${diploma.number}" из списка?`,
    );

    if (!shouldDelete) {
      return;
    }

    setDiplomas((currentDiplomas) =>
      currentDiplomas.filter((item) => item.id !== diploma.id),
    );
  };

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
              <strong className={styles.summaryValue}>{diplomas.length}</strong>
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
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className={styles.select}
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as DiplomaStatus | "")
              }
            >
              <option value="">Все статусы</option>
              <option value="valid">Подтверждённые</option>
              <option value="pending">На проверке</option>
              <option value="revoked">Отозванные</option>
            </select>
          </div>

          {filteredDiplomas.length > 0 ? (
            <div className={styles.table}>
              <div className={styles.headRow}>
                <span>Номер</span>
                <span>Владелец</span>
                <span>Вуз</span>
                <span>Специальность</span>
                <span>Дата выдачи</span>
                <span>Статус</span>
                <span>Действия</span>
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
                    <span className={styles.actions}>
                      <button
                        className={styles.dangerButton}
                        type="button"
                        onClick={() => handleDelete(diploma)}
                      >
                        Удалить
                      </button>
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
        </div>
      </div>
    </section>
  );
}
