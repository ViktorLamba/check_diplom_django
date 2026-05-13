export type UserRole = "admin" | "university" | "student";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  universityId: number | null;
  universityName: string | null;
  studentId: number | null;
  studentName: string | null;
};
