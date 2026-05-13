import { request } from "@/shared/api/http";
import type { PaginatedResponse } from "@/shared/api/types";

export type DiplomaStatus = "valid" | "pending" | "revoked";

export type Diploma = {
  id: number;
  number: string;
  studentId: number;
  owner: string;
  universityId: number;
  universityName: string;
  speciality: string;
  qualification: string;
  issuedAt: string;
  status: DiplomaStatus;
  qrCodeUrl?: string | null;
  publicId?: string | null;
  verificationUrl?: string | null;
  verificationApiUrl?: string | null;
};

export type VerifyDiplomaPayload = {
  series?: string;
  number: string;
  issuedAt: string;
};

export type VerifyDiplomaResponse = {
  verified: boolean;
  verificationStatus: "verified" | "revoked" | "not_found";
  verificationMessage: string;
  verificationUrl?: string;
  verificationApiUrl?: string;
  diploma: Diploma | null;
};

export type CreateDiplomaPayload = {
  studentId: number;
  number: string;
  speciality: string;
  qualification: string;
  issuedAt: string;
};

export function getDiplomas(params: {
  search?: string;
  status?: DiplomaStatus | "";
  page?: number;
  page_size?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("page_size", String(params.page_size ?? 10));

  return request<PaginatedResponse<Diploma>>(
    `/api/diplomas/?${searchParams.toString()}`,
  );
}

export function createDiploma(payload: CreateDiplomaPayload) {
  return request<Diploma>("/api/diplomas/", {
    method: "POST",
    body: payload,
  });
}

export function getMyDiplomas(params: { page?: number; page_size?: number }) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("page_size", String(params.page_size ?? 10));

  return request<PaginatedResponse<Diploma>>(
    `/api/diplomas/my/?${searchParams.toString()}`,
  );
}

export function verifyDiploma(payload: VerifyDiplomaPayload) {
  return request<VerifyDiplomaResponse>("/api/diplomas/verify/", {
    method: "POST",
    body: payload,
  });
}

export function getPublicDiploma(publicId: string) {
  return request<Diploma>(`/api/diplom/${publicId}/`);
}
