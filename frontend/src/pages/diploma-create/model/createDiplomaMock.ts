export type DiplomaCreateStudent = {
  id: number;
  fullName: string;
  email: string;
  group: string;
};

export type CreatedDiplomaStatus = "valid" | "pending";

export type CreatedDiploma = {
  id: number;
  number: string;
  studentId: number;
  owner: string;
  universityName: string;
  speciality: string;
  qualification: string;
  issuedAt: string;
  status: CreatedDiplomaStatus;
};

export const createdDiplomaStatusLabels: Record<CreatedDiplomaStatus, string> =
  {
    valid: "Подтверждён",
    pending: "На проверке",
  };

export const diplomaCreateStudentsMock: DiplomaCreateStudent[] = [
  {
    id: 1,
    fullName: "Иванов Иван Иванович",
    email: "ivanov@student.msu.ru",
    group: "ИВТ-401",
  },
  {
    id: 2,
    fullName: "Петрова Анна Сергеевна",
    email: "petrova@student.msu.ru",
    group: "ПМ-402",
  },
  {
    id: 3,
    fullName: "Сидоров Алексей Олегович",
    email: "sidorov@student.msu.ru",
    group: "ИС-301",
  },
];

export const createdDiplomasMock: CreatedDiploma[] = [
  {
    id: 1,
    number: "DIP-2026-001",
    studentId: 1,
    owner: "Иванов Иван Иванович",
    universityName: "МГУ им. М. В. Ломоносова",
    speciality: "Информатика",
    qualification: "Бакалавр",
    issuedAt: "2026-05-01",
    status: "valid",
  },
];
