import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Имя пользователя должно быть не менее 3 символов")
    .max(30, "Имя пользователя должно быть не более 30 символов"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
