import {
  getDiplomas,
  getVerificationLogs,
  type Diploma,
  type DiplomaStatus,
  type VerificationLog,
  type VerificationStatus,
} from "@/pages/diplomas/model/diplomasApi";
import { getStudents } from "@/pages/students/model/studentsApi";
import type { DashboardData, RecentCheck } from "./dashboardData";
import { getUniversities } from "@/pages/admin-universities/model/universitiesApi";
import { request } from "@/shared/api/http";

const formatCount = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value);

const diplomaStatusToCheckStatus: Record<DiplomaStatus, RecentCheck["status"]> =
  {
    valid: "Проверено",
    revoked: "Отозван",
  };

function diplomaToRecentCheck(diploma: Diploma): RecentCheck {
  return {
    id: diploma.id,
    status: diplomaStatusToCheckStatus[diploma.status],
    date: diploma.issuedAt,
    university: diploma.universityName,
    speciality: diploma.speciality,
  };
}

export async function getUniversityDashboardData(
  baseData: DashboardData,
): Promise<DashboardData> {
  const [students, diplomas, validDiplomas, revokedDiplomas, recentDiplomas] =
    await Promise.all([
      getStudents({ page: 1, page_size: 1 }),
      getDiplomas({ page: 1, page_size: 1 }),
      getDiplomas({ status: "valid", page: 1, page_size: 1 }),
      getDiplomas({ status: "revoked", page: 1, page_size: 1 }),
      getDiplomas({ page: 1, page_size: 3 }),
    ]);

  return {
    ...baseData,
    stats: [
      {
        id: "students",
        label: "Студентов моего вуза",
        value: formatCount(students.count),
      },
      {
        id: "diplomas",
        label: "Дипломов моего вуза",
        value: formatCount(diplomas.count),
      },
      {
        id: "validDiplomas",
        label: "Подтверждённых дипломов",
        value: formatCount(validDiplomas.count),
      },
      {
        id: "revokedDiplomas",
        label: "Отозванных дипломов",
        value: formatCount(revokedDiplomas.count),
      },
    ],
    recentChecksTitle: "Последние дипломы моего вуза",
    recentChecks: recentDiplomas.results.map(diplomaToRecentCheck),
  };
}

export async function getAdminDashboardData(
  baseData: DashboardData,
): Promise<DashboardData> {
  const [
    universities,
    diplomas,
    verificationLogs,
    recentVerificationLogs,
    publicStats,
  ] = await Promise.all([
    getUniversities({ page: 1, page_size: 1 }),
    getDiplomas({ page: 1, page_size: 1 }),
    getVerificationLogs({ source: "form", page: 1, page_size: 1 }),
    getVerificationLogs({ source: "form", page: 1, page_size: 5 }),
    getPublicStats(),
  ]);

  return {
    ...baseData,
    stats: [
      {
        id: "universities",
        label: "Всего вузов",
        value: formatCount(universities.count),
      },
      {
        id: "users",
        label: "Пользователей",
        value: formatCount(publicStats.usersCount),
      },
      {
        id: "diplomas",
        label: "Всего дипломов",
        value: formatCount(diplomas.count),
      },
      {
        id: "checksToday",
        label: "Проверок всего",
        value: formatCount(verificationLogs.count),
      },
    ],
    recentChecksTitle: "Последние проверки по системе",
    recentChecks: recentVerificationLogs.results.map(
      verificationLogToRecentCheck,
    ),
  };
}

const verificationStatusToCheckStatus: Record<
  VerificationStatus,
  RecentCheck["status"]
> = {
  verified: "Проверено",
  not_found: "Не найден",
  revoked: "Отозван",
};

function verificationLogToRecentCheck(log: VerificationLog): RecentCheck {
  return {
    id: log.id,
    status: verificationStatusToCheckStatus[log.verificationStatus],
    date: new Date(log.createdAt).toLocaleDateString("ru-RU"),
    university: log.universityName ?? log.diploma?.universityName ?? "-",
    speciality: log.diploma?.speciality ?? log.requestedNumber ?? "-",
  };
}

export type PublicStatsResponse = {
  universitiesCount: number;
  usersCount: number;
  diplomasCount: number;
  checksTodayCount: number;
};

export function getPublicStats() {
  return request<PublicStatsResponse>("/api/public/stats/");
}
