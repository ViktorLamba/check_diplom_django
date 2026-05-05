import { z } from "zod";

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(6, "Введите 6-значный код")
    .max(6, "Введите 6-значный код")
    .regex(/^\d{6}$/, "Код должен состоять из 6 цифр"),
});

export type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;
