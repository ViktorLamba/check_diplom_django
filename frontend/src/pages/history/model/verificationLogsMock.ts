export type VerificationLogStatus = "valid" | "invalid" | "revoked";

export type VerificationLogType = "manual" | "qr" | "api";

export type VerificationLog = {
  id: number;
  diplomaNumber: string;
  owner: string;
  universityName: string;
  speciality: string;
  checkedAt: string;
  checkedBy: string;
  status: VerificationLogStatus;
  type: VerificationLogType;
};

export const verificationStatusLabels: Record<VerificationLogStatus, string> = {
  valid: "Подтверждён",
  invalid: "Не найден",
  revoked: "Отозван",
};

export const verificationTypeLabels: Record<VerificationLogType, string> = {
  manual: "Ручная проверка",
  qr: "QR-код",
  api: "API-запрос",
};

export const initialVerificationLogs: VerificationLog[] = [
  {
    id: 1,
    diplomaNumber: "DIP-2026-001",
    owner: "Иванов Иван Иванович",
    universityName: "МГУ им. М. В. Ломоносова",
    speciality: "Информатика",
    checkedAt: "2026-05-08 14:30",
    checkedBy: "admin",
    status: "valid",
    type: "manual",
  },
  {
    id: 2,
    diplomaNumber: "DIP-2026-002",
    owner: "Петрова Анна Сергеевна",
    universityName: "СПбГУ",
    speciality: "Прикладная математика",
    checkedAt: "2026-05-08 13:10",
    checkedBy: "ivanov_as",
    status: "invalid",
    type: "qr",
  },
  {
    id: 3,
    diplomaNumber: "DIP-2026-003",
    owner: "Сидоров Алексей Олегович",
    universityName: "КФУ",
    speciality: "Программная инженерия",
    checkedAt: "2026-05-07 18:45",
    checkedBy: "api-client",
    status: "revoked",
    type: "api",
  },
  {
    id: 4,
    diplomaNumber: "DIP-2026-004",
    owner: "Кузнецова Мария Андреевна",
    universityName: "МГУ им. М. В. Ломоносова",
    speciality: "Информационные системы",
    checkedAt: "2026-05-07 11:20",
    checkedBy: "admin",
    status: "valid",
    type: "manual",
  },
];
