export type University = {
  id: number;
  name: string;
  city: string;
  representative: string;
  studentsCount: number;
  diplomasCount: number;
  status: "active" | "paused";
};

export const initialUniversities: University[] = [
  {
    id: 1,
    name: "МГУ им. М. В. Ломоносова",
    city: "Москва",
    representative: "Иванов Алексей",
    studentsCount: 1240,
    diplomasCount: 812,
    status: "active",
  },
  {
    id: 2,
    name: "СПбГУ",
    city: "Санкт-Петербург",
    representative: "Петрова Анна",
    studentsCount: 930,
    diplomasCount: 640,
    status: "active",
  },
  {
    id: 3,
    name: "КФУ",
    city: "Казань",
    representative: "Сидоров Максим",
    studentsCount: 520,
    diplomasCount: 284,
    status: "paused",
  },
];
