export type DiplomaStatus = "valid" | "pending" | "revoked";

export type Diploma = {
  id: number;
  number: string;
  owner: string;
  universityName: string;
  speciality: string;
  issuedAt: string;
  status: DiplomaStatus;
};

export const diplomaStatusLabels: Record<DiplomaStatus, string> = {
  valid: "Подтверждён",
  pending: "На проверке",
  revoked: "Отозван",
};

export const initialDiplomas: Diploma[] = [
  {
    id: 1,
    number: "DIP-2026-001",
    owner: "Иванов Иван Иванович",
    universityName: "МГУ им. М. В. Ломоносова",
    speciality: "Информатика",
    issuedAt: "2026-05-01",
    status: "valid",
  },
  {
    id: 2,
    number: "DIP-2026-002",
    owner: "Петрова Анна Сергеевна",
    universityName: "СПбГУ",
    speciality: "Прикладная математика",
    issuedAt: "2026-04-18",
    status: "pending",
  },
  {
    id: 3,
    number: "DIP-2026-003",
    owner: "Сидоров Алексей Олегович",
    universityName: "КФУ",
    speciality: "Программная инженерия",
    issuedAt: "2026-04-09",
    status: "revoked",
  },
  {
    id: 4,
    number: "DIP-2026-004",
    owner: "Кузнецова Мария Андреевна",
    universityName: "МГУ им. М. В. Ломоносова",
    speciality: "Информационные системы",
    issuedAt: "2026-03-25",
    status: "valid",
  },
];
