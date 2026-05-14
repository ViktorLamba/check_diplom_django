import { useEffect, useMemo, useState } from "react";
import {
  createUniversity,
  deleteUniversity,
  getUniversities,
  updateUniversity,
  type University,
} from "../model/universitiesApi";
import styles from "./AdminUniversitiesPage.module.scss";

const pageSize = 10;

const initialForm = {
  name: "",
  email: "",
  username: "",
};

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
  const [editingUniversity, setEditingUniversity] = useState<University | null>(
    null,
  );
  const [form, setForm] = useState(initialForm);

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

  const resetForm = () => {
    setForm(initialForm);
    setEditingUniversity(null);
    setFormError("");
  };

  const handleEdit = (university: University) => {
    setEditingUniversity(university);
    setIsFormOpen(true);
    setFormError("");
    setForm({
      name: university.name,
      email: university.email,
      username: university.username,
    });
  };

  const handleDelete = async (university: University) => {
    const shouldDelete = window.confirm(
      `Удалить вуз "${university.name}"? Будут удалены связанные записи.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setListError("");

      await deleteUniversity(university.id);

      setUniversities((currentUniversities) =>
        currentUniversities.filter((item) => item.id !== university.id),
      );
      setTotalCount((currentCount) => Math.max(currentCount - 1, 0));

      if (editingUniversity?.id === university.id) {
        resetForm();
        setIsFormOpen(false);
      }
    } catch (error) {
      setListError(
        error instanceof Error ? error.message : "Не удалось удалить вуз.",
      );
    }
  };

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

      if (editingUniversity) {
        const updatedUniversity = await updateUniversity(editingUniversity.id, {
          name,
          email,
          username,
        });

        setUniversities((currentUniversities) =>
          currentUniversities.map((university) =>
            university.id === updatedUniversity.id
              ? updatedUniversity
              : university,
          ),
        );
      } else {
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
      }

      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : editingUniversity
            ? "Не удалось обновить вуз."
            : "Не удалось создать вуз.",
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
              if (isFormOpen) {
                setIsFormOpen(false);
                resetForm();
                return;
              }

              setIsFormOpen(true);
              resetForm();
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
              {isSubmitting
                ? "Сохранение..."
                : editingUniversity
                  ? "Сохранить изменения"
                  : "Сохранить вуз"}
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
              <span>Действия</span>
            </div>

            <div className={styles.body}>
              {filteredUniversities.map((university) => (
                <div className={styles.row} key={university.id}>
                  <span className={styles.name}>{university.name}</span>
                  <span className={styles.cell}>{university.username}</span>
                  <span className={styles.cell}>{university.email}</span>
                  <span className={styles.cell}>{university.createdAt}</span>
                  <span className={styles.actions}>
                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={() => handleEdit(university)}
                    >
                      Изменить
                    </button>

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
