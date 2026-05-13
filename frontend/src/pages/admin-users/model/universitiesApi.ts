import { request } from "@/shared/api/http";

export type CreateUniversityPayload = {
  name: string;
  email: string;
  username: string;
};

export type University = {
  id: number;
  userId: number;
  name: string;
  username: string;
  email: string;
  createdAt: string;
};

export function createUniversity(payload: CreateUniversityPayload) {
  return request<University>("/api/universities/", {
    method: "POST",
    body: payload,
  });
}
