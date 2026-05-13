export type MyDiplomaStatus = "valid" | "pending" | "revoked";

export type MyDiploma = {
  id: number;
  number: string;
  universityName: string;
  speciality: string;
  qualification: string;
  issuedAt: string;
  status: MyDiplomaStatus;
  verificationDetails: string;
};

export const myDiplomaStatusLabels: Record<MyDiplomaStatus, string> = {
  valid: "Подтверждён",
  pending: "На проверке",
  revoked: "Отозван",
};

export const myDiplomasMock: MyDiploma[] = [
  {
    id: 1,
    number: "DIP-2026-001",
    universityName: "МГУ им. М. В. Ломоносова",
    speciality: "Информатика",
    qualification: "Бакалавр",
    issuedAt: "2026-05-01",
    status: "valid",
    verificationDetails: "Диплом успешно подтверждён в системе.",
  },
  {
    id: 2,
    number: "DIP-2026-002",
    universityName: "МГУ им. М. В. Ломоносова",
    speciality: "Информационные системы",
    qualification: "Магистр",
    issuedAt: "2026-05-08",
    status: "pending",
    verificationDetails: "Диплом ожидает завершения проверки вузом.",
  },
];
