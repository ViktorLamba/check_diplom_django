import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import {
  createDiploma,
  type Diploma,
  type DiplomaStatus,
} from "@/pages/diplomas/model/diplomasApi";
import { getStudents, type Student } from "@/pages/students/model/studentsApi";
import styles from "./CreateDiplomaPage.module.scss";

type DiplomaForm = {
  studentId: string;
  number: string;
  speciality: string;
  qualification: string;
  issuedAt: string;
};

const initialForm: DiplomaForm = {
  studentId: "",
  number: "",
  speciality: "",
  qualification: "",
  issuedAt: "",
};

const diplomaStatusLabels: Record<DiplomaStatus, string> = {
  valid: "Подтверждён",
  pending: "На проверке",
  revoked: "Отозван",
};

export function CreateDiplomaPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [recentDiplomas, setRecentDiplomas] = useState<Diploma[]>([]);
  const [form, setForm] = useState<DiplomaForm>(initialForm);
  const [formError, setFormError] = useState("");
  const [studentsError, setStudentsError] = useState("");
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedDiploma, setLastCreatedDiploma] = useState<Diploma | null>(
    null,
  );

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsStudentsLoading(true);
        setStudentsError("");

        const response = await getStudents({
          page: 1,
          page_size: 100,
        });

        setStudents(response.results);
      } catch (error) {
        setStudents([]);
        setStudentsError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить студентов.",
        );
      } finally {
        setIsStudentsLoading(false);
      }
    };

    void loadStudents();
  }, []);

  const selectedStudent = useMemo(() => {
    return students.find((student) => student.id === Number(form.studentId));
  }, [form.studentId, students]);

  const updateFormField = (field: keyof DiplomaForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const getStatusClassName = (status: DiplomaStatus) => {
    if (status === "valid") {
      return styles.statusValid;
    }

    return styles.statusPending;
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const studentId = Number(form.studentId);
    const number = form.number.trim();
    const speciality = form.speciality.trim();
    const qualification = form.qualification.trim();
    const issuedAt = form.issuedAt;

    if (!studentId || !number || !speciality || !qualification || !issuedAt) {
      setFormError(
        "Заполните студента, номер диплома, специальность, квалификацию и дату выдачи.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      const createdDiploma = await createDiploma({
        studentId,
        number,
        speciality,
        qualification,
        issuedAt,
      });

      setLastCreatedDiploma(createdDiploma);
      setRecentDiplomas((currentDiplomas) => [
        createdDiploma,
        ...currentDiplomas,
      ]);
      setForm(initialForm);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Не удалось создать диплом.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.card}>
          <div className={styles.section}>
            <div className={styles.topBlock}>
              <h2 className={styles.title}>Создание диплома</h2>
              <p className={styles.subtitle}>
                Добавьте данные диплома для студента вашего вуза.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="student">
                  Студент
                </label>
                <select
                  id="student"
                  className={styles.select}
                  value={form.studentId}
                  disabled={isStudentsLoading}
                  onChange={(event) =>
                    updateFormField("studentId", event.target.value)
                  }
                >
                  <option value="" disabled>
                    {isStudentsLoading
                      ? "Загрузка студентов..."
                      : "Выберите студента"}
                  </option>

                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.fullName} · {student.group}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="diplomaNumber">
                  Номер диплома
                </label>
                <input
                  id="diplomaNumber"
                  className={styles.input}
                  type="text"
                  value={form.number}
                  placeholder="Например: DIP-2026-005"
                  onChange={(event) =>
                    updateFormField("number", event.target.value)
                  }
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="speciality">
                  Специальность
                </label>
                <input
                  id="speciality"
                  className={styles.input}
                  type="text"
                  value={form.speciality}
                  placeholder="Название специальности"
                  onChange={(event) =>
                    updateFormField("speciality", event.target.value)
                  }
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="qualification">
                  Квалификация
                </label>
                <select
                  id="qualification"
                  className={styles.select}
                  value={form.qualification}
                  onChange={(event) =>
                    updateFormField("qualification", event.target.value)
                  }
                >
                  <option value="" disabled>
                    Выберите квалификацию
                  </option>
                  <option value="Бакалавр">Бакалавр</option>
                  <option value="Специалист">Специалист</option>
                  <option value="Магистр">Магистр</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="issuedAt">
                  Дата выдачи
                </label>
                <input
                  id="issuedAt"
                  className={styles.input}
                  type="date"
                  value={form.issuedAt}
                  onChange={(event) =>
                    updateFormField("issuedAt", event.target.value)
                  }
                />
              </div>

              {studentsError && (
                <p className={styles.errorText}>{studentsError}</p>
              )}

              {formError && <p className={styles.errorText}>{formError}</p>}

              <button
                className={styles.primaryButton}
                type="submit"
                disabled={isSubmitting || isStudentsLoading}
              >
                {isSubmitting ? "Создание..." : "Создать диплом"}
              </button>
            </form>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.section}>
            <div className={styles.topBlock}>
              <h2 className={styles.title}>Предпросмотр</h2>
              <p className={styles.subtitle}>
                Здесь отображается последний созданный диплом.
              </p>
            </div>

            {lastCreatedDiploma ? (
              <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                  <div>
                    <h3 className={styles.previewTitle}>
                      {lastCreatedDiploma.number}
                    </h3>
                    <p className={styles.previewSubtitle}>
                      {lastCreatedDiploma.owner}
                    </p>
                  </div>

                  <span
                    className={getStatusClassName(lastCreatedDiploma.status)}
                  >
                    {diplomaStatusLabels[lastCreatedDiploma.status]}
                  </span>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span>Вуз</span>
                    <strong>{lastCreatedDiploma.universityName}</strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>Студент</span>
                    <strong>
                      {selectedStudent?.fullName ?? lastCreatedDiploma.owner}
                    </strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>Специальность</span>
                    <strong>{lastCreatedDiploma.speciality}</strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>Квалификация</span>
                    <strong>{lastCreatedDiploma.qualification}</strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>Дата выдачи</span>
                    <strong>{lastCreatedDiploma.issuedAt}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>Диплом ещё не создан</h3>
                <p className={styles.emptyText}>
                  Заполните форму и создайте диплом, чтобы увидеть результат.
                </p>
              </div>
            )}

            <div className={styles.recentBlock}>
              <h3 className={styles.recentTitle}>Последние созданные</h3>

              {recentDiplomas.length > 0 ? (
                <div className={styles.recentList}>
                  {recentDiplomas.slice(0, 3).map((diploma) => (
                    <div key={diploma.id} className={styles.recentItem}>
                      <div>
                        <span className={styles.recentNumber}>
                          {diploma.number}
                        </span>
                        <p className={styles.recentOwner}>{diploma.owner}</p>
                      </div>

                      <span className={getStatusClassName(diploma.status)}>
                        {diplomaStatusLabels[diploma.status]}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>
                  После создания дипломы появятся в этом списке.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
