import { useMemo, useState, type SubmitEvent } from "react";
import {
  createdDiplomasMock,
  createdDiplomaStatusLabels,
  diplomaCreateStudentsMock,
  type CreatedDiploma,
  type CreatedDiplomaStatus,
} from "../model/createDiplomaMock";
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

export function CreateDiplomaPage() {
  const [createdDiplomas, setCreatedDiplomas] =
    useState<CreatedDiploma[]>(createdDiplomasMock);
  const [form, setForm] = useState<DiplomaForm>(initialForm);
  const [formError, setFormError] = useState("");
  const [lastCreatedDiploma, setLastCreatedDiploma] =
    useState<CreatedDiploma | null>(null);

  const selectedStudent = useMemo(() => {
    return diplomaCreateStudentsMock.find(
      (student) => student.id === Number(form.studentId),
    );
  }, [form.studentId]);

  const updateFormField = (field: keyof DiplomaForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const getStatusClassName = (status: CreatedDiplomaStatus) => {
    if (status === "valid") {
      return styles.statusValid;
    }

    return styles.statusPending;
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const number = form.number.trim();
    const speciality = form.speciality.trim();
    const qualification = form.qualification.trim();
    const issuedAt = form.issuedAt;

    if (
      !selectedStudent ||
      !number ||
      !speciality ||
      !qualification ||
      !issuedAt
    ) {
      setFormError(
        "Заполните студента, номер диплома, специальность, квалификацию и дату выдачи.",
      );
      return;
    }

    const hasSameNumber = createdDiplomas.some(
      (diploma) => diploma.number.toLowerCase() === number.toLowerCase(),
    );

    if (hasSameNumber) {
      setFormError("Диплом с таким номером уже существует.");
      return;
    }

    const newDiploma: CreatedDiploma = {
      id: Date.now(),
      number,
      studentId: selectedStudent.id,
      owner: selectedStudent.fullName,
      universityName: "МГУ им. М. В. Ломоносова",
      speciality,
      qualification,
      issuedAt,
      status: "valid",
    };

    setCreatedDiplomas((currentDiplomas) => [newDiploma, ...currentDiplomas]);
    setLastCreatedDiploma(newDiploma);
    setForm(initialForm);
    setFormError("");
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
                  onChange={(event) =>
                    updateFormField("studentId", event.target.value)
                  }
                >
                  <option value="" disabled>
                    Выберите студента
                  </option>

                  {diplomaCreateStudentsMock.map((student) => (
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

              {formError && <p className={styles.errorText}>{formError}</p>}

              <button className={styles.primaryButton} type="submit">
                Создать диплом
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
                    {createdDiplomaStatusLabels[lastCreatedDiploma.status]}
                  </span>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span>Вуз</span>
                    <strong>{lastCreatedDiploma.universityName}</strong>
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

              <div className={styles.recentList}>
                {createdDiplomas.slice(0, 3).map((diploma) => (
                  <div key={diploma.id} className={styles.recentItem}>
                    <div>
                      <span className={styles.recentNumber}>
                        {diploma.number}
                      </span>
                      <p className={styles.recentOwner}>{diploma.owner}</p>
                    </div>

                    <span className={getStatusClassName(diploma.status)}>
                      {createdDiplomaStatusLabels[diploma.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
