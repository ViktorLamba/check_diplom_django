import { request } from "../../../shared/api/http";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
};

export type LoginSuccessResponse = {
  detail: string;
  user: AuthUser;
};

export type Login2FAResponse = {
  detail: string;
  requires_2fa: true;
  username: string;
};

export type LoginResponse = LoginSuccessResponse | Login2FAResponse;

export type LoginPayload = {
  username: string;
  password: string;
};

export function login(payload: LoginPayload) {
  return request<LoginResponse>("/api/auth/login/", {
    method: "POST",
    body: payload,
  });
}

export function logout() {
  return request<LogoutResponse>("/api/auth/logout/", {
    method: "POST",
  });
}

export type LogoutResponse = {
  detail: string;
};

export type VerifyLoginPayload = {
  username: string;
  code: string;
};

export type VerifyLoginResponse = {
  detail: string;
  user: AuthUser;
};

export function verifyLogin(payload: VerifyLoginPayload) {
  return request<VerifyLoginResponse>("/api/auth/login/verify/", {
    method: "POST",
    body: payload,
  });
}

export type MeResponse = {
  user: AuthUser;
};

export function me() {
  return request<MeResponse>("/api/auth/me/", {
    method: "GET",
  });
}
