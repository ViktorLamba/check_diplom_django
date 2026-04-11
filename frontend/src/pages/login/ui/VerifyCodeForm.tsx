import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import type { VerifyCodeFormValues } from "../model/verifyCodeSchema";
import styles from "./LoginPage.module.scss";

type VerifyCodeFormProps = {
  register: UseFormRegister<VerifyCodeFormValues>;
  handleSubmit: UseFormHandleSubmit<VerifyCodeFormValues>;
  onSubmit: (data: VerifyCodeFormValues) => void | Promise<void>;
  errors: FieldErrors<VerifyCodeFormValues>;
  serverError: string;
  debugCode: string;
  onBackToLogin: () => void;
};

export function VerifyCodeForm({
  register,
  handleSubmit,
  onSubmit,
  errors,
  serverError,
  debugCode,
  onBackToLogin,
}: VerifyCodeFormProps) {
  return (
    <>
      <h1 className={styles.title}>Подтверждение входа</h1>

      <p className={styles.subtitleVerify}>
        Введите 6-значный код, отправленный на вашу почту или устройство.
      </p>

      <form
        className={styles.verifyForm}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <input
          className={`${styles.codeInput} ${errors.code ? styles.inputError : ""}`}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          maxLength={6}
          {...register("code")}
        />

        {errors.code && (
          <span className={styles.errorText}>{errors.code.message}</span>
        )}

        {serverError && <div className={styles.serverError}>{serverError}</div>}

        <button className={styles.primaryButton} type="submit">
          Подтвердить вход
        </button>

        <button className={styles.secondaryTextButton} type="button">
          Отправить код повторно
        </button>

        <button
          className={styles.secondaryTextButton}
          type="button"
          onClick={onBackToLogin}
        >
          Вернуться к входу
        </button>

        <p className={styles.verifyHint}>Код действителен в течение 5 минут</p>

        {debugCode && (
          <p className={styles.debugCode}>Тестовый код: {debugCode}</p>
        )}
      </form>
    </>
  );
}
