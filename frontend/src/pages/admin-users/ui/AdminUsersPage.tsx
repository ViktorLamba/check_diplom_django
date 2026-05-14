import { useEffect, useState, type FormEvent } from "react";
import {
  deleteUser,
  getUsers,
  type ApiUser,
  type UserRole,
} from "../model/usersApi";
import { createUniversity } from "../model/universitiesApi";
import { createStudent } from "@/pages/students/model/studentsApi";
import styles from "./AdminUsersPage.module.scss";

type ManagedUserRole = Extract<UserRole, "university" | "student">;

const roleLabels: Record<ManagedUserRole, string> = {
  university: "Представитель вуза",
  student: "Студент",
};

const getUserRoleLabel = (role: UserRole) => {
  if (role === "university" || role === "student") {
    return roleLabels[role];
  }

  return "—";
};

const getUserDisplayName = (user: ApiUser) =>
  user.studentName ?? user.universityName ?? user.username;

export function AdminUsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    role: "university" as ManagedUserRole,
    universityName: "",
    group: "",
    course: 1,
  });

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setFormError("");

      const response = await getUsers({
        search,
        role: roleFilter,
        page: 1,
        page_size: 100,
      });

      setUsers(
        response.results.filter(
          (user) => user.role === "university" || user.role === "student",
        ),
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить пользователей.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [search, roleFilter]);

  const universityUsersCount = users.filter(
    (user) => user.role === "university",
  ).length;

  const studentUsersCount = users.filter(
    (user) => user.role === "student",
  ).length;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = form.fullName.trim();
    const username = form.username.trim();
    const email = form.email.trim();
    const universityName = form.universityName.trim();
    const group = form.group.trim();

    if (!username || !email) {
      setFormError("Заполните username и email.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      if (form.role === "university") {
        if (!universityName) {
          setFormError("Заполните название вуза.");
          return;
        }

        await createUniversity({
          name: universityName,
          username,
          email,
        });
      }

      if (form.role === "student") {
        if (!fullName || !group || !form.course) {
          setFormError("Заполните ФИО, группу и курс студента.");
          return;
        }

        await createStudent({
          fullName,
          username,
          email,
          group,
          course: Number(form.course),
        });
      }

      setForm({
        fullName: "",
        username: "",
        email: "",
        role: "university",
        universityName: "",
        group: "",
        course: 1,
      });

      setIsFormOpen(false);
      await loadUsers();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить пользователя.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (user: ApiUser) => {
    const shouldDelete = window.confirm(
      `Удалить пользователя "${getUserDisplayName(user)}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setFormError("");
      await deleteUser(user.id);
      await loadUsers();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Не удалось удалить пользователя.",
      );
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBlock}>
          <div>
            <h2 className={styles.title}>Пользователи</h2>
            <p className={styles.subtitle}>
              Управление представителями вузов и студентами. Администратор
              системы не создаётся через этот раздел.
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
            {isFormOpen ? "Скрыть форму" : "Добавить пользователя"}
          </button>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Всего пользователей</span>
            <strong className={styles.summaryValue}>{users.length}</strong>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Представителей вузов</span>
            <strong className={styles.summaryValue}>
              {universityUsersCount}
            </strong>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Студентов</span>
            <strong className={styles.summaryValue}>{studentUsersCount}</strong>
          </div>
        </div>

        {isFormOpen && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="fullName">
                ФИО
              </label>
              <input
                id="fullName"
                className={styles.input}
                type="text"
                value={form.fullName}
                placeholder="ФИО пользователя"
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    fullName: event.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">
                Username
              </label>
              <input
                id="username"
                className={styles.input}
                type="text"
                value={form.username}
                placeholder="username"
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    username: event.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                value={form.email}
                placeholder="email@example.com"
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    email: event.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="role">
                Роль
              </label>
              <select
                id="role"
                className={styles.select}
                value={form.role}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    role: event.target.value as ManagedUserRole,
                  }))
                }
              >
                <option value="university">Представитель вуза</option>
                <option value="student">Студент</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="universityName">
                Вуз
              </label>
              <input
                id="universityName"
                className={styles.input}
                type="text"
                value={form.universityName}
                placeholder="Название вуза"
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    universityName: event.target.value,
                  }))
                }
              />
            </div>

            {form.role === "student" && (
              <>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="group">
                    Группа
                  </label>
                  <input
                    id="group"
                    className={styles.input}
                    type="text"
                    value={form.group}
                    placeholder="ИВТ-401"
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        group: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="course">
                    Курс
                  </label>
                  <input
                    id="course"
                    className={styles.input}
                    type="number"
                    min={1}
                    max={6}
                    value={form.course}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        course: Number(event.target.value),
                      }))
                    }
                  />
                </div>
              </>
            )}

            {formError && <p className={styles.formError}>{formError}</p>}

            <button
              className={styles.primaryButton}
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Сохранение..." : "Сохранить пользователя"}
            </button>
          </form>
        )}

        <div className={styles.toolbar}>
          <input
            className={styles.input}
            type="search"
            value={search}
            placeholder="Поиск по ФИО, username, email или вузу"
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className={styles.select}
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as ManagedUserRole | "")
            }
          >
            <option value="">Все роли</option>
            <option value="university">Представители вузов</option>
            <option value="student">Студенты</option>
          </select>
        </div>

        {isLoading && <p>Загрузка пользователей...</p>}

        {!isLoading && users.length > 0 ? (
          <div className={styles.table}>
            <div className={styles.headRow}>
              <span>Пользователь</span>
              <span>Username</span>
              <span>Email</span>
              <span>Роль</span>
              <span>Вуз</span>
              <span>Статус</span>
              <span>Действия</span>
            </div>

            <div className={styles.body}>
              {users.map((user) => (
                <div className={styles.row} key={user.id}>
                  <span className={styles.name}>
                    {getUserDisplayName(user)}
                  </span>
                  <span className={styles.cell}>{user.username}</span>
                  <span className={styles.cell}>{user.email}</span>
                  <span className={styles.cell}>
                    {getUserRoleLabel(user.role)}
                  </span>
                  <span className={styles.cell}>
                    {user.universityName ?? "-"}
                  </span>

                  <span>
                    <span
                      className={
                        user.isActive
                          ? styles.statusActive
                          : styles.statusBlocked
                      }
                    >
                      {user.isActive ? "Активен" : "Заблокирован"}
                    </span>
                  </span>

                  <span className={styles.actions}>
                    <button
                      className={styles.dangerButton}
                      type="button"
                      onClick={() => handleDelete(user)}
                    >
                      Удалить
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !isLoading && (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>Пользователи не найдены</h3>
              <p className={styles.emptyText}>
                Измените поисковый запрос, фильтр роли или добавьте нового
                пользователя.
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
