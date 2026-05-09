import { useMemo, useState, type SubmitEvent } from "react";
import {
  initialStudents,
  studentStatusLabels,
  type Student,
  type StudentStatus,
} from "../model/studentsMock";
import styles from "./StudentsPage.module.scss";

type StudentForm = {
  fullName: string;
  email: string;
  group: string;
  course: string;
};

const initialForm: StudentForm = {
  fullName: "",
  email: "",
  group: "",
  course: "",
};

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "">("");
  const [form, setForm] = useState<StudentForm>(initialForm);
  const [formError, setFormError] = useState("");

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesStatus = statusFilter
        ? student.status === statusFilter
        : true;

      const matchesSearch = normalizedSearch
        ? [
            student.fullName,
            student.email,
            student.group,
            String(student.course),
            studentStatusLabels[student.status],
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [students, search, statusFilter]);

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

  const updateFormField = (field: keyof StudentForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleAddStudent = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const group = form.group.trim();
    const course = Number(form.course);

    if (!fullName || !email || !group || !course) {
      setFormError("Заполните ФИО, email, группу и курс.");
      return;
    }

    const hasSameEmail = students.some(
      (student) => student.email.toLowerCase() === email.toLowerCase(),
    );

    if (hasSameEmail) {
      setFormError("Студент с таким email уже есть в списке.");
      return;
    }

    const newStudent: Student = {
      id: Date.now(),
      fullName,
      email,
      group,
      course,
      diplomasCount: 0,
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setStudents((currentStudents) => [newStudent, ...currentStudents]);
    setForm(initialForm);
    setFormError("");
  };

  const handleDelete = (student: Student) => {
    const shouldDelete = window.confirm(
      `Удалить студента "${student.fullName}" из списка?`,
    );

    if (!shouldDelete) {
      return;
    }

    setStudents((currentStudents) =>
      currentStudents.filter((item) => item.id !== student.id),
    );
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
              <strong className={styles.summaryValue}>{students.length}</strong>
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

          <form className={styles.form} onSubmit={handleAddStudent}>
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
            </div>

            {formError && <p className={styles.errorText}>{formError}</p>}

            <button className={styles.primaryButton} type="submit">
              Добавить студента
            </button>
          </form>

          <div className={styles.toolbar}>
            <input
              className={styles.input}
              type="search"
              value={search}
              placeholder="Поиск по ФИО, email, группе или курсу"
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className={styles.select}
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StudentStatus | "")
              }
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>

          {filteredStudents.length > 0 ? (
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
        </div>
      </div>
    </section>
  );
}
