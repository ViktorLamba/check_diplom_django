import { useMemo, useState, type FormEvent } from "react";
import {
  initialUsers,
  type ManagedUser,
  type ManagedUserRole,
} from "../model/usersMock";
import styles from "./AdminUsersPage.module.scss";

const roleLabels: Record<ManagedUserRole, string> = {
  university: "Представитель вуза",
  student: "Студент",
};

export function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<ManagedUserRole | "">("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    role: "university" as ManagedUserRole,
    universityName: "",
  });

  const filteredUsers = useMemo(() => {
    const normalaizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter ? user.role === roleFilter : true;

      const matchesSearch = normalaizedSearch
        ? [
            user.fullName,
            user.username,
            user.email,
            user.universityName,
            roleLabels[user.role],
          ]

            .join(" ")
            .toLowerCase()
            .includes(normalaizedSearch)
        : true;

      return matchesRole && matchesSearch;
    });
  }, [search, roleFilter, users]);

  const universityUsersCount = users.filter(
    (user) => user.role === "university",
  ).length;

  const studentUsersCount = users.filter(
    (user) => user.role === "student",
  ).length;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = form.fullName.trim();
    const username = form.username.trim();
    const email = form.email.trim();
    const universityName = form.universityName.trim();

    if (!fullName || !username || !email || !universityName) {
      setFormError("Заполните ФИО, username, email и вуз.");
      return;
    }

    const isUsernameTaken = users.some((user) => user.username === username);
    const isEmailTaken = users.some((user) => user.email === email);

    if (isUsernameTaken) {
      setFormError("Пользователь с таким username уже есть.");
      return;
    }

    if (isEmailTaken) {
      setFormError("Пользователь с таким email уже есть.");
      return;
    }

    setUsers((currentUsers) => [
      {
        id: Date.now(),
        fullName,
        username,
        email,
        role: form.role,
        universityName,
        status: "active",
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...currentUsers,
    ]);

    setForm({
      fullName: "",
      username: "",
      email: "",
      role: "university",
      universityName: "",
    });
    setFormError("");
    setIsFormOpen(false);
  };

  const handleDelete = (user: ManagedUser) => {
    const shouldDelete = window.confirm(
      `Удалить пользователя "${user.fullName}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.filter((item) => item.id !== user.id),
    );
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

            {formError && <p className={styles.formError}>{formError}</p>}

            <button className={styles.primaryButton} type="submit">
              Сохранить пользователя
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

        {filteredUsers.length > 0 ? (
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
              {filteredUsers.map((user) => (
                <div className={styles.row} key={user.id}>
                  <span className={styles.name}>{user.fullName}</span>
                  <span className={styles.cell}>{user.username}</span>
                  <span className={styles.cell}>{user.email}</span>
                  <span className={styles.cell}>{roleLabels[user.role]}</span>
                  <span className={styles.cell}>{user.universityName}</span>

                  <span>
                    <span
                      className={
                        user.status === "active"
                          ? styles.statusActive
                          : styles.statusBlocked
                      }
                    >
                      {user.status === "active" ? "Активен" : "Заблокирован"}
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
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>Пользователи не найдены</h3>
            <p className={styles.emptyText}>
              Измените поисковый запрос, фильтр роли или добавьте нового
              пользователя.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
