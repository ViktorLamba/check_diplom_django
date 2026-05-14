import { request } from "@/shared/api/http";
import type { PaginatedResponse } from "@/shared/api/types";

export type StudentStatus = "active" | "inactive";

export type Student = {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  group: string;
  course: number;
  diplomasCount: number;
  status: StudentStatus;
  createdAt: string;
};

export type CreateStudentPayload = {
  fullName: string;
  email: string;
  username?: string;
  group: string;
  course: number;
};

export type UpdateStudentPayload = {
  fullName: string;
  email: string;
  group: string;
  course: number;
  status: StudentStatus;
};

export function getStudents(params: {
  search?: string;
  status?: StudentStatus | "";
  page?: number;
  page_size?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("page_size", String(params.page_size ?? 10));

  return request<PaginatedResponse<Student>>(
    `/api/students/?${searchParams.toString()}`,
  );
}

export function createStudent(payload: CreateStudentPayload) {
  return request<Student>("/api/students/", {
    method: "POST",
    body: payload,
  });
}

export function updateStudent(id: number, payload: UpdateStudentPayload) {
  return request<Student>(`/api/students/${id}/`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteStudent(id: number) {
  return request<void>(`/api/students/${id}/`, {
    method: "DELETE",
  });
}
