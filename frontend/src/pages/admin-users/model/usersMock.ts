export type ManagedUserRole = "university" | "student";

export type ManagedUserStatus = "active" | "blocked";

export type ManagedUser = {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: ManagedUserRole;
  universityName: string;
  status: ManagedUserStatus;
  createdAt: string;
};

export const initialUsers: ManagedUser[] = [
  {
    id: 1,
    fullName: "Иванов Алексей Сергеевич",
    username: "ivanov_as",
    email: "ivanov@example.com",
    role: "university",
    universityName: "МГУ им. М. В. Ломоносова",
    status: "active",
    createdAt: "2026-05-01",
  },
  {
    id: 2,
    fullName: "Петрова Анна Викторовна",
    username: "petrova_av",
    email: "petrova@example.com",
    role: "university",
    universityName: "СПбГУ",
    status: "active",
    createdAt: "2026-05-02",
  },
  {
    id: 3,
    fullName: "Смирнов Кирилл Олегович",
    username: "smirnov_ko",
    email: "student@example.com",
    role: "student",
    universityName: "МГУ им. М. В. Ломоносова",
    status: "active",
    createdAt: "2026-05-03",
  },
  {
    id: 4,
    fullName: "Кузнецова Мария Андреевна",
    username: "kuznetsova_ma",
    email: "kuznetsova@example.com",
    role: "student",
    universityName: "КФУ",
    status: "blocked",
    createdAt: "2026-05-04",
  },
];
