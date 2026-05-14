import { request } from "@/shared/api/http";
import type { PaginatedResponse } from "@/shared/api/types";

export type UserRole = "admin" | "university" | "student" | "user";

export type ApiUser = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  universityId: number | null;
  universityName: string | null;
  studentId: number | null;
  studentName: string | null;
  isActive: boolean;
  createdAt: string;
};

export function getUsers(params: {
  search?: string;
  role?: UserRole | "";
  page?: number;
  page_size?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.role) searchParams.set("role", params.role);
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("page_size", String(params.page_size ?? 10));

  return request<PaginatedResponse<ApiUser>>(
    `/api/users/?${searchParams.toString()}`,
  );
}

export function deleteUser(id: number) {
  return request<void>(`/api/users/${id}/`, {
    method: "DELETE",
  });
}
