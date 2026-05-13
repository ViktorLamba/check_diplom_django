import { useEffect, useMemo, useState } from "react";
import {
  createUniversity,
  getUniversities,
  type University,
} from "../model/universitiesApi";
import styles from "./AdminUniversitiesPage.module.scss";

const pageSize = 10;

export function AdminUniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [listError, setListError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
  });

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        setIsLoading(true);
        setListError("");

        const response = await getUniversities({
          search: search.trim(),
          page,
          page_size: pageSize,
        });

        setUniversities(response.results);
        setTotalCount(response.count);
      } catch (error) {
        setUniversities([]);
        setTotalCount(0);
        setListError(
          error instanceof Error ? error.message : "Не удалось загрузить вузы.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadUniversities();
  }, [search, page]);

  const filteredUniversities = useMemo(() => universities, [universities]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const username = form.username.trim();

    if (!name || !email || !username) {
      setFormError("Заполните название вуза, email и логин.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      const newUniversity = await createUniversity({
        name,
        email,
        username,
      });

      setUniversities((currentUniversities) => [
        newUniversity,
        ...currentUniversities,
      ]);
      setTotalCount((currentCount) => currentCount + 1);
      setForm({ name: "", email: "", username: "" });
      setIsFormOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Не удалось создать вуз.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBlock}>
          <div>
            <h2 className={styles.title}>Вузы</h2>
            <p className={styles.subtitle}>
              Регистрация вузов и управление доступом образовательных
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
            <strong className={styles.summaryValue}>{totalCount}</strong>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>На странице</span>
            <strong className={styles.summaryValue}>
              {universities.length}
            </strong>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Страница</span>
            <strong className={styles.summaryValue}>{page}</strong>
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
              <label className={styles.label} htmlFor="universityEmail">
                Email
              </label>
              <input
                id="universityEmail"
                className={styles.input}
                type="email"
                value={form.email}
                placeholder="office@university.ru"
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    email: event.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="universityUsername">
                Логин
              </label>
              <input
                id="universityUsername"
                className={styles.input}
                type="text"
                value={form.username}
                placeholder="msu"
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    username: event.target.value,
                  }))
                }
              />
            </div>

            {formError && <p className={styles.formError}>{formError}</p>}

            <button
              className={styles.primaryButton}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Сохранение..." : "Сохранить вуз"}
            </button>
          </form>
        )}

        <div className={styles.toolbar}>
          <input
            className={styles.input}
            type="search"
            value={search}
            placeholder="Поиск по названию, логину или email"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        {listError && <p className={styles.formError}>{listError}</p>}

        {isLoading ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>Загрузка вузов...</h3>
          </div>
        ) : filteredUniversities.length > 0 ? (
          <div className={styles.table}>
            <div className={styles.headRow}>
              <span>Вуз</span>
              <span>Логин</span>
              <span>Email</span>
              <span>Дата создания</span>
            </div>

            <div className={styles.body}>
              {filteredUniversities.map((university) => (
                <div className={styles.row} key={university.id}>
                  <span className={styles.name}>{university.name}</span>
                  <span className={styles.cell}>{university.username}</span>
                  <span className={styles.cell}>{university.email}</span>
                  <span className={styles.cell}>{university.createdAt}</span>
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

        {totalCount > pageSize && (
          <div className={styles.toolbar}>
            <button
              className={styles.primaryButton}
              type="button"
              disabled={page === 1}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              Назад
            </button>

            <button
              className={styles.primaryButton}
              type="button"
              disabled={page * pageSize >= totalCount}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Вперёд
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
