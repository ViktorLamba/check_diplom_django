import { request } from "@/shared/api/http";
import type { PaginatedResponse } from "@/shared/api/types";

export type University = {
  id: number;
  userId: number;
  name: string;
  username: string;
  email: string;
  createdAt: string;
};

export type CreateUniversityPayload = {
  name: string;
  email: string;
  username: string;
};

export function getUniversities(params: {
  search?: string;
  page?: number;
  page_size?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("page_size", String(params.page_size ?? 10));

  return request<PaginatedResponse<University>>(
    `/api/universities/?${searchParams.toString()}`,
  );
}

export function createUniversity(payload: CreateUniversityPayload) {
  return request<University>("/api/universities/", {
    method: "POST",
    body: payload,
  });
}

export type UpdateUniversityPayload = CreateUniversityPayload;

export function updateUniversity(id: number, payload: UpdateUniversityPayload) {
  return request<University>(`/api/universities/${id}/`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteUniversity(id: number) {
  return request<void>(`/api/universities/${id}/`, {
    method: "DELETE",
  });
}
