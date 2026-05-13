import {
  getDiplomas,
  type Diploma,
  type DiplomaStatus,
} from "@/pages/diplomas/model/diplomasApi";
import { getStudents } from "@/pages/students/model/studentsApi";
import type { DashboardData, RecentCheck } from "./dashboardData";

const formatCount = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value);

const diplomaStatusToCheckStatus: Record<DiplomaStatus, RecentCheck["status"]> =
  {
    valid: "Проверено",
    pending: "В работе",
    revoked: "Отклонено",
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
