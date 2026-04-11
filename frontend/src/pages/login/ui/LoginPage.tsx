import styles from "./LoginPage.module.scss";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "../model/loginSchema";
import { login, verifyLogin } from "../model/authApi";
import { useState } from "react";
import {
  verifyCodeSchema,
  type VerifyCodeFormValues,
} from "../model/verifyCodeSchema";

export function LoginPage() {
  const [serverError, setServerError] = useState("");

  const [authStep, setAuthStep] = useState<"login" | "verify">("login");
  const [pendingUsername, setPendingUsername] = useState("");
  const [debugCode, setDebugCode] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetLoginForm,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: verifyErrors },
    reset: resetVerifyForm,
  } = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError("");

      const response = await login({
        username: data.username,
        password: data.password,
      });

      console.log("Login response:", response);

      if ("requires_2fa" in response && response.requires_2fa) {
        setServerError("");
        setAuthStep("verify");
        setPendingUsername(response.username);
        setDebugCode(response.code_debug ?? "");
        resetVerifyForm();
        return;
      }

      if ("user" in response) {
        console.log("Успешный вход:", response.user);
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
        return;
      }
      setServerError("Не удалось выполнить вход");
    }
  };

  const onVerifySubmit = async (data: VerifyCodeFormValues) => {
    try {
      setServerError("");

      const response = await verifyLogin({
        username: pendingUsername,
        code: data.code,
      });

      console.log("Вход подтвержден:", response.user);
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
        return;
      }
      setServerError("Не удалось подтвердить вход");
    }
  };

  const handleBackToLogin = () => {
    setServerError("");
    setAuthStep("login");
    setPendingUsername("");
    setDebugCode("");
    resetVerifyForm();
    resetLoginForm({
      username: pendingUsername,
      password: "",
      rememberMe: false,
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.grid} />
      <div className={styles.glowLeft} />
      <div className={styles.glowRight} />
      <div className={styles.glowTop} />

      <section className={styles.wrapper}>
        <div className={styles.brandTop}>Diplomat</div>
        <div className={styles.card}>
          <div className={styles.cardGlow} />
          <div className={styles.content}>
            <div className={styles.brandInside}>Diplomat</div>

            {authStep === "login" ? (
              <>
                <h1 className={styles.title}>
                  Войти в систему проверки дипломов
                </h1>

                <p className={styles.subtitle}>
                  Войдите в систему, чтобы получить доступ к платформе проверки
                  дипломов и цифровых сертификатов.
                </p>

                <form
                  className={styles.form}
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  <input
                    className={`${styles.input} ${styles.inputAccent} ${errors.username ? styles.inputError : ""}`}
                    type="text"
                    placeholder="Введите имя пользователя"
                    autoComplete="username"
                    {...register("username")}
                  />
                  {errors.username && (
                    <span className={styles.errorText}>
                      {errors.username.message}
                    </span>
                  )}

                  <input
                    className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                    type="password"
                    placeholder="Пароль"
                    autoComplete="current-password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <span className={styles.errorText}>
                      {errors.password.message}
                    </span>
                  )}
                  {serverError && (
                    <div className={styles.serverError}>{serverError}</div>
                  )}
                  <button className={styles.primaryButton} type="submit">
                    Войти
                  </button>

                  <div className={styles.actionsRow}>
                    <label className={styles.checkboxLabel}>
                      <input
                        className={styles.checkbox}
                        type="checkbox"
                        {...register("rememberMe")}
                      />
                      <span>Запомнить меня</span>
                    </label>

                    <a href="#" className={styles.link}>
                      Забыли пароль?
                    </a>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h1 className={styles.title}>Подтверждение входа</h1>

                <p className={styles.subtitleVerify}>
                  Введите 6-значный код, отправленный на вашу почту или
                  устройство.
                </p>

                <form
                  className={styles.verifyForm}
                  onSubmit={handleSubmitVerify(onVerifySubmit)}
                  noValidate
                >
                  <input
                    className={`${styles.codeInput} ${verifyErrors.code ? styles.inputError : ""}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    maxLength={6}
                    {...registerVerify("code")}
                  />

                  {verifyErrors.code && (
                    <span className={styles.errorText}>
                      {verifyErrors.code.message}
                    </span>
                  )}

                  {serverError && (
                    <div className={styles.serverError}>{serverError}</div>
                  )}

                  <button className={styles.primaryButton} type="submit">
                    Подтвердить вход
                  </button>

                  <button className={styles.secondaryTextButton} type="button">
                    Отправить код повторно
                  </button>

                  <button
                    className={styles.secondaryTextButton}
                    type="button"
                    onClick={handleBackToLogin}
                  >
                    Вернуться к входу
                  </button>

                  <p className={styles.verifyHint}>
                    Код действителен в течение 5 минут
                  </p>

                  {debugCode && (
                    <p className={styles.debugCode}>
                      Тестовый код: {debugCode} {"Этот блок потом убрать"}
                    </p>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
