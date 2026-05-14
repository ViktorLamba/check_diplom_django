import type { UserRole } from "@/shared/auth/types";

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
};

export type RecentCheck = {
  id: number;
  status: "Проверено" | "Отклонено" | "В работе";
  date: string;
  university: string;
  speciality: string;
};

export type QuickAction = {
  id: string;
  label: string;
  to: string;
  icon: string;
};

export type DashboardData = {
  stats: DashboardStat[];
  recentChecksTitle: string;
  recentChecks: RecentCheck[];
  quickActions: QuickAction[];
};

export const dashboardDataByRole: Record<
  Extract<UserRole, "admin" | "university">,
  DashboardData
> = {
  admin: {
    stats: [
      { id: "universities", label: "Всего вузов", value: "24" },
      { id: "users", label: "Пользователей", value: "1,284" },
      { id: "diplomas", label: "Всего дипломов", value: "8,912" },
      { id: "checksToday", label: "Проверок сегодня", value: "1,200" },
    ],
    recentChecksTitle: "Последние проверки по системе",
    recentChecks: [
      {
        id: 1,
        status: "Проверено",
        date: "2026-04-18",
        university: "МГУ им. Ломоносова",
        speciality: "Информатика",
      },
      {
        id: 2,
        status: "Отклонено",
        date: "2026-04-17",
        university: "СПбГУ",
        speciality: "Прикладная математика",
      },
      {
        id: 3,
        status: "В работе",
        date: "2026-04-16",
        university: "МФТИ",
        speciality: "Программная инженерия",
      },
    ],
    quickActions: [
      {
        id: "universities",
        label: "Добавить вуз",
        to: "/home/universities",
        icon: "В",
      },
      { id: "users", label: "Пользователи", to: "/home/users", icon: "П" },
      { id: "logs", label: "Логи проверок", to: "/home/history", icon: "Л" },
    ],
  },

  university: {
    stats: [
      { id: "students", label: "Студентов моего вуза", value: "326" },
      { id: "diplomas", label: "Дипломов моего вуза", value: "742" },
      { id: "validDiplomas", label: "Подтверждённых дипломов", value: "0" },
      { id: "revokedDiplomas", label: "Отозванных дипломов", value: "0" },
    ],
    recentChecksTitle: "Последние дипломы моего вуза",
    recentChecks: [
      {
        id: 1,
        status: "Проверено",
        date: "2026-04-18",
        university: "Ваш вуз",
        speciality: "Информатика",
      },
      {
        id: 2,
        status: "В работе",
        date: "2026-04-17",
        university: "Ваш вуз",
        speciality: "Экономика",
      },
      {
        id: 3,
        status: "Отклонено",
        date: "2026-04-16",
        university: "Ваш вуз",
        speciality: "Юриспруденция",
      },
    ],
    quickActions: [
      {
        id: "students",
        label: "Добавить студента",
        to: "/home/students",
        icon: "С",
      },
      {
        id: "createDiploma",
        label: "Создать диплом",
        to: "/home/diplomas/create",
        icon: "Д",
      },
      { id: "diplomas", label: "Все дипломы", to: "/home/diplomas", icon: "Р" },
    ],
  },
};

export const publicDashboardData: DashboardData = {
  stats: [
    { id: "universities", label: "Всего вузов", value: "24" },
    { id: "users", label: "Пользователей", value: "1,284" },
    { id: "diplomas", label: "Всего дипломов", value: "8,912" },
    { id: "checksToday", label: "Проверок сегодня", value: "1,200" },
  ],
  recentChecksTitle: "",
  recentChecks: [],
  quickActions: [
    {
      id: "verification",
      label: "Проверить диплом",
      to: "/verification",
      icon: "П",
    },
    {
      id: "login",
      label: "Авторизоваться",
      to: "/login",
      icon: "А",
    },
  ],
};
