export type StudentStatus = "active" | "inactive";

export type Student = {
  id: number;
  fullName: string;
  email: string;
  group: string;
  course: number;
  diplomasCount: number;
  status: StudentStatus;
  createdAt: string;
};

export const studentStatusLabels: Record<StudentStatus, string> = {
  active: "Активен",
  inactive: "Неактивен",
};

export const initialStudents: Student[] = [
  {
    id: 1,
    fullName: "Иванов Иван Иванович",
    email: "ivanov@student.msu.ru",
    group: "ИВТ-401",
    course: 4,
    diplomasCount: 1,
    status: "active",
    createdAt: "2026-05-01",
  },
  {
    id: 2,
    fullName: "Петрова Анна Сергеевна",
    email: "petrova@student.msu.ru",
    group: "ПМ-402",
    course: 4,
    diplomasCount: 2,
    status: "active",
    createdAt: "2026-05-03",
  },
  {
    id: 3,
    fullName: "Сидоров Алексей Олегович",
    email: "sidorov@student.msu.ru",
    group: "ИС-301",
    course: 3,
    diplomasCount: 0,
    status: "inactive",
    createdAt: "2026-05-05",
  },
];
