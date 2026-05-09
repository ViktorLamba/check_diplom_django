import { useMemo, useState } from "react";
import {
  initialUniversities,
  type University,
} from "../model/universitiesMock";
import styles from "./AdminUniversitiesPage.module.scss";

export function AdminUniversitiesPage() {
  const [universities, setUniversities] =
    useState<University[]>(initialUniversities);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "",
    city: "",
    representative: "",
  });

  const filteredUniversities = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    if (!normalizedSearch) {
      return universities;
    }

    return universities.filter((university) =>
      [university.name, university.city, university.representative]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [search, universities]);

  const activeCount = universities.filter(
    (university) => university.status === "active",
  ).length;

  const diplomasCount = universities.reduce(
    (total, university) => total + university.diplomasCount,
    0,
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = form.name.trim();
    const city = form.city.trim();
    const representative = form.representative.trim();

    if (!name || !city || !representative) {
      setFormError("Пожалуйста, заполните все поля");
      return;
    }

    setUniversities((currentUniversities) => [
      {
        id: Date.now(),
        name,
        city,
        representative,
        studentsCount: 0,
        diplomasCount: 0,
        status: "active",
      },
      ...currentUniversities,
    ]);

    setForm({ name: "", city: "", representative: "" });
    setFormError("");
    setIsFormOpen(false);
  };

  const handleDelete = (university: University) => {
    const shouldDelete = window.confirm(
      `Удалить вуз "${university.name}" из списка?`,
    );

    if (!shouldDelete) {
      return;
    }

    setUniversities((currentUniversities) =>
      currentUniversities.filter((item) => item.id !== university.id),
    );
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBlock}>
          <div>
            <h2 className={styles.title}>Вузы</h2>
            <p className={styles.subtitle}>
              Регистрация вузов и управление представителями образовательных
              организаций.
            </p>
          </div>

          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => {
              setIsFormOpen((currentValue) => !currentValue);
              setFormError("");
            }}
          >
            {isFormOpen ? "Скрыть форму" : "Добавить вуз"}
          </button>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Всего вузов</span>
            <strong className={styles.summaryValue}>
              {universities.length}
            </strong>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Активных</span>
            <strong className={styles.summaryValue}>{activeCount}</strong>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Дипломов</span>
            <strong className={styles.summaryValue}>{diplomasCount}</strong>
          </div>
        </div>

        {isFormOpen && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="universityName">
                Название вуза
              </label>
              <input
                id="universityName"
                className={styles.input}
                type="text"
                value={form.name}
                placeholder="Например: МГУ им. М. В. Ломоносова"
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="universityCity">
                Город
              </label>
              <input
                id="universityCity"
                className={styles.input}
                type="text"
                value={form.city}
                placeholder="Город"
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    city: event.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="representative">
                Представитель
              </label>
              <input
                id="representative"
                className={styles.input}
                type="text"
                value={form.representative}
                placeholder="ФИО представителя"
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    representative: event.target.value,
                  }))
                }
              />
            </div>

            {formError && <p className={styles.formError}>{formError}</p>}

            <button className={styles.primaryButton} type="submit">
              Сохранить вуз
            </button>
          </form>
        )}

        <div className={styles.toolbar}>
          <input
            className={styles.input}
            type="search"
            value={search}
            placeholder="Поиск по названию, городу или представителю"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {filteredUniversities.length > 0 ? (
          <div className={styles.table}>
            <div className={styles.headRow}>
              <span>Вуз</span>
              <span>Город</span>
              <span>Представитель</span>
              <span>Студенты</span>
              <span>Дипломы</span>
              <span>Статус</span>
              <span>Действия</span>
            </div>

            <div className={styles.body}>
              {filteredUniversities.map((university) => (
                <div className={styles.row} key={university.id}>
                  <span className={styles.name}>{university.name}</span>
                  <span className={styles.cell}>{university.city}</span>
                  <span className={styles.cell}>
                    {university.representative}
                  </span>
                  <span className={styles.cell}>
                    {university.studentsCount}
                  </span>
                  <span className={styles.cell}>
                    {university.diplomasCount}
                  </span>

                  <span>
                    <span
                      className={
                        university.status === "active"
                          ? styles.statusActive
                          : styles.statusPaused
                      }
                    >
                      {university.status === "active" ? "Активен" : "Пауза"}
                    </span>
                  </span>

                  <span className={styles.actions}>
                    <button
                      className={styles.dangerButton}
                      type="button"
                      onClick={() => handleDelete(university)}
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
            <h3 className={styles.emptyTitle}>Вузы не найдены</h3>
            <p className={styles.emptyText}>
              Попробуйте изменить поисковый запрос или добавьте новый вуз.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
