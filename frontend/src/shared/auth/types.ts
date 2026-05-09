export type UserRole = "admin" | "university" | "student";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  role?: UserRole;
  university?: {
    id: number;
    name: string;
  } | null;
};
