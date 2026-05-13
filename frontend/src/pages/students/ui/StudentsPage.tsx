import { useMemo, useEffect, useState, type FormEvent } from "react";
import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
  type Student,
  type StudentStatus,
} from "../model/studentsApi";
import styles from "./StudentsPage.module.scss";

const studentStatusLabels: Record<StudentStatus, string> = {
  active: "Активен",
  inactive: "Неактивен",
};

const pageSize = 10;

type StudentForm = {
  fullName: string;
  email: string;
  username: string;
  group: string;
  course: string;
  status: StudentStatus;
};

const initialForm: StudentForm = {
  fullName: "",
  email: "",
  username: "",
  group: "",
  course: "",
  status: "active",
};

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "">("");
  const [form, setForm] = useState<StudentForm>(initialForm);
  const [formError, setFormError] = useState("");
  const [listError, setListError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true);
        setListError("");

        const response = await getStudents({
          search: search.trim(),
          status: statusFilter,
          page,
          page_size: pageSize,
        });

        setStudents(response.results);
        setTotalCount(response.count);
      } catch (error) {
        setStudents([]);
        setTotalCount(0);
        setListError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить студентов.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadStudents();
  }, [search, statusFilter, page]);

  const filteredStudents = useMemo(() => students, [students]);

  const activeCount = students.filter(
    (student) => student.status === "active",
  ).length;

  const inactiveCount = students.filter(
    (student) => student.status === "inactive",
  ).length;

  const totalDiplomasCount = students.reduce(
    (sum, student) => sum + student.diplomasCount,
    0,
  );

  const updateFormField = <K extends keyof StudentForm>(
    field: K,
    value: StudentForm[K],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingStudent(null);
    setFormError("");
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormError("");
    setForm({
      fullName: student.fullName,
      email: student.email,
      username: "",
      group: student.group,
      course: String(student.course),
      status: student.status,
    });
  };

  const handleSubmitStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const username = form.username.trim();
    const group = form.group.trim();
    const course = Number(form.course);

    if (!fullName || !email || !group || !course) {
      setFormError("Заполните ФИО, email, группу и курс.");
      return;
    }

    if (!editingStudent && !username) {
      setFormError("Заполните логин студента.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      if (editingStudent) {
        const updatedStudent = await updateStudent(editingStudent.id, {
          fullName,
          email,
          group,
          course,
          status: form.status,
        });

        setStudents((currentStudents) =>
          currentStudents.map((student) =>
            student.id === updatedStudent.id ? updatedStudent : student,
          ),
        );
      } else {
        const newStudent = await createStudent({
          fullName,
          email,
          username,
          group,
          course,
        });

        setStudents((currentStudents) => [newStudent, ...currentStudents]);
        setTotalCount((currentCount) => currentCount + 1);
      }

      resetForm();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : editingStudent
            ? "Не удалось обновить студента."
            : "Не удалось добавить студента.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (student: Student) => {
    const shouldDelete = window.confirm(
      `Удалить студента "${student.fullName}" из списка?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setListError("");

      await deleteStudent(student.id);

      setStudents((currentStudents) =>
        currentStudents.filter((item) => item.id !== student.id),
      );

      setTotalCount((currentCount) => Math.max(currentCount - 1, 0));

      if (editingStudent?.id === student.id) {
        resetForm();
      }
    } catch (error) {
      setListError(
        error instanceof Error ? error.message : "Не удалось удалить студента.",
      );
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.section}>
          <div className={styles.topBlock}>
            <div>
              <h2 className={styles.title}>Студенты</h2>
              <p className={styles.subtitle}>
                Список студентов вашего вуза и управление их учетными записями.
              </p>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Всего студентов</span>
              <strong className={styles.summaryValue}>{totalCount}</strong>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Активных</span>
              <strong className={styles.summaryValue}>{activeCount}</strong>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Неактивных</span>
              <strong className={styles.summaryValue}>{inactiveCount}</strong>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Дипломов</span>
              <strong className={styles.summaryValue}>
                {totalDiplomasCount}
              </strong>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmitStudent}>
            <div className={styles.formGrid}>
              <input
                className={styles.input}
                type="text"
                value={form.fullName}
                placeholder="ФИО студента"
                onChange={(event) =>
                  updateFormField("fullName", event.target.value)
                }
              />

              {!editingStudent && (
                <input
                  className={styles.input}
                  type="text"
                  value={form.username}
                  placeholder="Логин студента"
                  onChange={(event) =>
                    updateFormField("username", event.target.value)
                  }
                />
              )}

              <input
                className={styles.input}
                type="email"
                value={form.email}
                placeholder="Email"
                onChange={(event) =>
                  updateFormField("email", event.target.value)
                }
              />

              <input
                className={styles.input}
                type="text"
                value={form.group}
                placeholder="Группа"
                onChange={(event) =>
                  updateFormField("group", event.target.value)
                }
              />

              <input
                className={styles.input}
                type="number"
                min="1"
                max="6"
                value={form.course}
                placeholder="Курс"
                onChange={(event) =>
                  updateFormField("course", event.target.value)
                }
              />

              {editingStudent && (
                <select
                  className={styles.select}
                  value={form.status}
                  onChange={(event) =>
                    updateFormField(
                      "status",
                      event.target.value as StudentStatus,
                    )
                  }
                >
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                </select>
              )}
            </div>

            {formError && <p className={styles.errorText}>{formError}</p>}

            <button
              className={styles.primaryButton}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Сохранение..."
                : editingStudent
                  ? "Сохранить изменения"
                  : "Добавить студента"}
            </button>

            {editingStudent && (
              <button
                className={styles.dangerButton}
                type="button"
                onClick={resetForm}
              >
                Отменить редактирование
              </button>
            )}
          </form>

          <div className={styles.toolbar}>
            <input
              className={styles.input}
              type="search"
              value={search}
              placeholder="Поиск по ФИО, email, группе или курсу"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />

            <select
              className={styles.select}
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StudentStatus | "");
                setPage(1);
              }}
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>

          {listError && <p className={styles.errorText}>{listError}</p>}

          {isLoading ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>Загрузка студентов...</h3>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className={styles.table}>
              <div className={styles.headRow}>
                <span>ФИО</span>
                <span>Email</span>
                <span>Группа</span>
                <span>Курс</span>
                <span>Дипломы</span>
                <span>Статус</span>
                <span>Действия</span>
              </div>

              <div className={styles.body}>
                {filteredStudents.map((student) => (
                  <div key={student.id} className={styles.row}>
                    <span className={styles.name}>{student.fullName}</span>
                    <span className={styles.cell}>{student.email}</span>
                    <span className={styles.cell}>{student.group}</span>
                    <span className={styles.cell}>{student.course}</span>
                    <span className={styles.cell}>{student.diplomasCount}</span>
                    <span>
                      <span
                        className={
                          student.status === "active"
                            ? styles.statusActive
                            : styles.statusInactive
                        }
                      >
                        {studentStatusLabels[student.status]}
                      </span>
                    </span>
                    <span className={styles.actions}>
                      <button
                        className={styles.primaryButton}
                        type="button"
                        onClick={() => handleEdit(student)}
                      >
                        Изменить
                      </button>

                      <button
                        className={styles.dangerButton}
                        type="button"
                        onClick={() => handleDelete(student)}
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
              <h3 className={styles.emptyTitle}>Студенты не найдены</h3>
              <p className={styles.emptyText}>
                Измените поисковый запрос, фильтр статуса или добавьте нового
                студента.
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

              <span className={styles.subtitle}>Страница {page}</span>

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
      </div>
    </section>
  );
}
