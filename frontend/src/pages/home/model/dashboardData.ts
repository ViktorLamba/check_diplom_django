export const dashboardStats = [
  { id: "checksToday", label: "Проверок сегодня", value: "1,200" },
  { id: "totalChecks", label: "Всего проверок", value: "55,890" },
  { id: "validDiplomas", label: "Валидных дипломов", value: "48,765" },
  { id: "revokedDiplomas", label: "Отозванных дипломов", value: "1,125" },
];

export const recentChecks = [
  {
    id: 1,
    status: "valid",
    date: "2026-04-18",
    university: "МГУ им. Ломоносова",
    speciality: "Информатика",
  },
  {
    id: 2,
    status: "invalid",
    date: "2026-04-17",
    university: "СПбГУ",
    speciality: "Прикладная математика",
  },
  {
    id: 3,
    status: "revoked",
    date: "2026-04-16",
    university: "МФТИ",
    speciality: "Программная инженерия",
  },
  {
    id: 4,
    status: "valid",
    date: "2026-04-15",
    university: "КФУ",
    speciality: "Информационные системы",
  },
];

export const quickActions = [
  { id: "verify", label: "Проверить диплом" },
  { id: "scan", label: "Сканировать QR" },
];
